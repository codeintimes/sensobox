// Planifica · servicio: reúne pedidos de Sensobox, rutas, recursos y calendarios, lanza el planificador,
// guarda el plan y atiende la integración con Ritmia (OEE real y avance de fabricación).
import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { Model } from 'mongoose';
import { tr } from '../../i18n/i18n';
import { Lang, LANGS } from '../../i18n/messages';
import { Calendar, comparePlans, loadByDay, PlanOrder, Resource, schedule, workingWindows } from '../domain/scheduler';
import { ordersAtRisk } from '../domain/risk';
import { DEMO_STOCK, materialsByOf, ofNumber, OfInput } from '../domain/materials';
import { ARTICLES, CLIENTS, DEMO_FIRST_ORDER, DEMO_ORDERS, demoArticles, demoCalendars, demoResources, demoText } from './demo';
import { FORNIVAL, fornivalOrderDocs } from './demo-fornival';
import { MILLARS, MILLARS_CLOSED, MILLARS_OPEN, MILLARS_RUNNING, MILLARS_USERS, millarsArticles, millarsCalendar, millarsOrderDoc, millarsResources } from './demo-millars';

/** Lo que ve un usuario en Planifica: los recursos de su empresa si tiene propios; si no, los que no son de nadie. */
export interface Scope { codes: Set<string>; company: string | null; owners: string[] }

const OPEN_STATUSES = [1, 2]; // pendiente y en proceso

export interface CapacityInfo { code: string; factor: number; source: 'ritmia' | 'standard'; availability?: number; performance?: number; oee?: number }

@Injectable()
export class PlanningService {
  private readonly logger = new Logger('Planifica');
  private ritmiaCache: { at: number; data: any[] | null; error: string | null } = { at: 0, data: null, error: null };

  constructor(
    @InjectModel('PlanningResource') private readonly resources: Model<any>,
    @InjectModel('PlanningCalendar') private readonly calendars: Model<any>,
    @InjectModel('PlanningArticle') private readonly articles: Model<any>,
    @InjectModel('PlanningOrder') private readonly links: Model<any>,
    @InjectModel('PlanningOperation') private readonly operations: Model<any>,
    @InjectModel('Order') private readonly orders: Model<any>,
  ) {}

  // ---------- Capacidad real desde Ritmia ----------
  async ritmiaAvailability(force = false): Promise<{ ok: boolean; url: string; data: any[] | null; error: string | null; at: number }> {
    const url = process.env.RITMIA_URL || '';
    if (!url) return { ok: false, url, data: null, error: null, at: 0 };
    if (!force && Date.now() - this.ritmiaCache.at < 5 * 60000) return { ok: !!this.ritmiaCache.data, url, ...this.ritmiaCache };
    try {
      const res = await fetch(`${url}/api/integration/availability?days=14`, {
        headers: { 'x-api-key': process.env.INTEGRATION_KEY || 'ritmia-sensobox-demo' },
        signal: AbortSignal.timeout(4000),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      this.ritmiaCache = { at: Date.now(), data: await res.json(), error: null };
    } catch (e: any) {
      this.ritmiaCache = { at: Date.now(), data: null, error: e?.message ?? String(e) };
    }
    return { ok: !!this.ritmiaCache.data, url, ...this.ritmiaCache };
  }

  async capacity(): Promise<CapacityInfo[]> {
    const res = await this.resources.find().sort({ sort: 1 }).lean();
    const r = await this.ritmiaAvailability();
    return res.map((x: any) => {
      const real = x.ritmia ? r.data?.find((a: any) => a.code === x.code) : null;
      return real
        ? { code: x.code, factor: Math.max(0.2, Math.min(1, real.capacityFactor)), source: 'ritmia', availability: real.availability, performance: real.performance, oee: real.oee }
        : { code: x.code, factor: x.efficiency, source: 'standard' };
    });
  }

  // ---------- Entradas del planificador ----------
  private async inputs() {
    const [resources, calendars, articles, links, cap] = await Promise.all([
      this.resources.find().sort({ sort: 1 }).lean(),
      this.calendars.find().lean(),
      this.articles.find().lean(),
      this.links.find().lean(),
      this.capacity(),
    ]);
    const orders = await this.orders.find({ status: { $in: OPEN_STATUSES } }).lean();
    const linkByOrder = new Map(links.map((l: any) => [l.orderId, l]));
    const artByCode = new Map(articles.map((a: any) => [a.code, a]));
    const planOrders: PlanOrder[] = [];
    const unlinked: any[] = [];
    for (const o of orders as any[]) {
      const l = linkByOrder.get(String(o._id));
      const a = l && artByCode.get(l.articleCode);
      if (!l || !a) {
        unlinked.push({ id: String(o._id), orderNumber: o.orderNumber, clientName: o.clientName, workName: o.workName, productionQuantity: o.productionQuantity, status: o.status, companyName: o.companyName });
        continue;
      }
      planOrders.push({
        id: String(o._id), orderNumber: o.orderNumber, articleCode: a.code, qty: o.productionQuantity, dueDate: l.dueDate ? new Date(l.dueDate) : null, priority: l.priority ?? 3,
        route: a.route.map((s: any) => ({ seq: s.seq, resources: s.resources, setupMin: s.setupMin, ratePerHour: s.ratePerHour, name: s.name })),
      });
    }
    const cals: Calendar[] = calendars.map((c: any) => ({ code: c.code, shifts: c.shifts, holidays: c.holidays ?? [] }));
    const factor = new Map(cap.map((c) => [c.code, c.factor]));
    const res: Resource[] = resources.map((r: any) => ({ code: r.code, calendarCode: r.calendarCode, factor: factor.get(r.code) ?? r.efficiency }));
    return { resources, calendars, articles, orders, links, planOrders, unlinked, cals, res, cap };
  }

  /** Recursos visibles para la empresa del usuario (Cerámicas Millars ve los suyos; el resto, los de la demo principal). */
  async scope(company?: string | null): Promise<Scope> {
    const owners: string[] = (await this.resources.distinct('company')).filter((c: any) => !!c);
    const mine = company && owners.includes(company) ? company : null;
    const res = await this.resources.find(mine ? { company: mine } : { company: { $in: [null, ''] } }).lean();
    return { codes: new Set(res.map((r: any) => r.code)), company: mine, owners };
  }

  /** ¿El pedido de Sensobox es de la empresa que se ve? */
  private orderInScope(sc: Scope, companyName?: string) {
    return sc.company ? companyName === sc.company : !sc.owners.includes(companyName ?? '');
  }

  /** ¿El artículo se fabrica en recursos que se ven? */
  private articleInScope(sc: Scope, a: any) {
    return (a?.route ?? []).every((s: any) => (s.resources ?? []).some((c: string) => sc.codes.has(c)));
  }

  /** Recalcula el plan completo respetando las operaciones fijadas y lo guarda. */
  async replan() {
    const inp = await this.inputs();
    const locked = (await this.operations.find({ locked: true }).lean()).map((o: any) => ({ orderId: o.orderId, seq: o.seq, resourceCode: o.resourceCode, start: new Date(o.start) }));
    const plan = schedule({ now: new Date(), calendars: inp.cals, resources: inp.res, orders: inp.planOrders, locked });
    await this.operations.deleteMany({});
    if (plan.ops.length) await this.operations.insertMany(plan.ops);
    return plan;
  }

  /** Plan para el Gantt: operaciones, órdenes con su estado de entrega, recursos y horas sin turno. */
  async getPlan(fromIso?: string, days = 7, company?: string | null) {
    if ((await this.operations.countDocuments()) === 0) await this.replan();
    const inp = await this.inputs();
    const sc = await this.scope(company);
    const from = fromIso ? new Date(fromIso) : new Date(Date.now() - 12 * 3600000);
    const to = new Date(from.getTime() + days * 86400000);
    const ops = (await this.operations.find({ end: { $gt: from }, start: { $lt: to } }).sort({ start: 1 }).lean()).filter((o: any) => sc.codes.has(o.resourceCode));
    const allOps = await this.operations.find().lean();
    const artByCode = new Map(inp.articles.map((a: any) => [a.code, a]));
    const orderInfo = this.orderSummaries(inp, allOps).filter((o) => this.articleInScope(sc, artByCode.get(o.articleCode)));
    const calByCode = new Map(inp.cals.map((c) => [c.code, c]));
    const visibles = inp.resources.filter((r: any) => sc.codes.has(r.code));
    const offTime = visibles.map((r: any) => {
      const wins = workingWindows(calByCode.get(r.calendarCode)!, from, to);
      const gaps: [string, string][] = [];
      let cur = from.getTime();
      for (const [a, b] of wins) {
        if (a > cur) gaps.push([new Date(cur).toISOString(), new Date(a).toISOString()]);
        cur = Math.max(cur, b);
      }
      if (cur < to.getTime()) gaps.push([new Date(cur).toISOString(), to.toISOString()]);
      return { code: r.code, off: gaps };
    });
    const ritmia = await this.ritmiaAvailability();
    return {
      from: from.toISOString(),
      to: to.toISOString(),
      now: new Date().toISOString(),
      resources: visibles.map((r: any) => ({ ...r, _id: String(r._id), capacity: inp.cap.find((c) => c.code === r.code) })),
      operations: ops.map((o: any) => ({ ...o, _id: String(o._id) })),
      orders: orderInfo,
      offTime,
      unlinked: inp.unlinked.filter((u: any) => this.orderInScope(sc, u.companyName)).map(({ companyName, ...u }: any) => u),
      ritmia: { configured: !!ritmia.url, ok: ritmia.ok, error: ritmia.error },
    };
  }

  private orderSummaries(inp: Awaited<ReturnType<PlanningService['inputs']>>, ops: any[]) {
    const linkByOrder = new Map(inp.links.map((l: any) => [l.orderId, l]));
    const artByCode = new Map(inp.articles.map((a: any) => [a.code, a]));
    return inp.planOrders.map((p) => {
      const o: any = inp.orders.find((x: any) => String(x._id) === p.id);
      const l: any = linkByOrder.get(p.id);
      const mine = ops.filter((x) => x.orderId === p.id);
      const end = mine.length ? new Date(Math.max(...mine.map((x) => new Date(x.end).getTime()))) : null;
      const start = mine.length ? new Date(Math.min(...mine.map((x) => new Date(x.start).getTime()))) : null;
      const lateMin = end && p.dueDate ? Math.max(0, (end.getTime() - p.dueDate.getTime()) / 60000) : 0;
      return {
        id: p.id, orderNumber: p.orderNumber, clientName: o?.clientName, articleCode: p.articleCode, articleName: (artByCode.get(p.articleCode) as any)?.name,
        qty: p.qty, producedGood: l?.producedGood ?? 0, dueDate: p.dueDate, priority: p.priority, status: o?.status, start, end,
        lateMin: Math.round(lateMin), late: lateMin > 0 || mine.length < p.route.length, unplanned: mine.length < p.route.length,
      };
    });
  }

  async load(days = 14, company?: string | null) {
    if ((await this.operations.countDocuments()) === 0) await this.replan();
    const inp = await this.inputs();
    const sc = await this.scope(company);
    const ops = (await this.operations.find().lean()).map((o: any) => ({ ...o, start: new Date(o.start), end: new Date(o.end) }));
    const rows = loadByDay(ops, inp.res.filter((r) => sc.codes.has(r.code)), inp.cals, new Date(), days);
    return { resources: inp.resources.filter((r: any) => sc.codes.has(r.code)).map((r: any) => ({ code: r.code, name: r.name, line: r.line, capacity: inp.cap.find((c) => c.code === r.code) })), rows };
  }

  // ---------- Gantt: mover y soltar ----------
  async moveOperation(id: string, body: { resourceCode?: string; start?: string }, company?: string | null) {
    const op: any = await this.operations.findById(id).lean().catch(() => null);
    if (!op) throw new NotFoundException(tr('errors.planning.notFound'));
    const link: any = await this.links.findOne({ orderId: op.orderId }).lean();
    const art: any = link && (await this.articles.findOne({ code: link.articleCode }).lean());
    const step = art?.route.find((s: any) => s.seq === op.seq);
    const resourceCode = body.resourceCode ?? op.resourceCode;
    if (!step || !step.resources.includes(resourceCode)) throw new BadRequestException(tr('errors.planning.invalidResource', { resource: resourceCode }));
    const start = body.start ? new Date(body.start) : new Date(op.start);
    if (isNaN(start.getTime())) throw new BadRequestException(tr('errors.planning.invalidData'));
    await this.operations.updateOne({ _id: id }, { $set: { resourceCode, start, locked: true } });
    await this.replan();
    return this.getPlan(undefined, 7, company);
  }

  async unlock(id: string) {
    const r = await this.operations.updateOne({ _id: id }, { $set: { locked: false } }).catch(() => null);
    if (!r || r.matchedCount === 0) throw new NotFoundException(tr('errors.planning.notFound'));
    await this.replan();
    return { ok: true };
  }

  // ---------- ¿Qué pasa si entra este pedido urgente? ----------
  async simulate(body: { articleCode: string; qty: number; dueDate?: string; priority?: number }, company?: string | null) {
    const inp = await this.inputs();
    const sc = await this.scope(company);
    const art: any = inp.articles.find((a: any) => a.code === body.articleCode);
    if (!art || !this.articleInScope(sc, art)) throw new BadRequestException(tr('errors.planning.unknownArticle', { code: body.articleCode }));
    const qty = Number(body.qty);
    if (!(qty > 0)) throw new BadRequestException(tr('errors.planning.invalidData'));
    const locked = (await this.operations.find({ locked: true }).lean()).map((o: any) => ({ orderId: o.orderId, seq: o.seq, resourceCode: o.resourceCode, start: new Date(o.start) }));
    const now = new Date();
    const before = schedule({ now, calendars: inp.cals, resources: inp.res, orders: inp.planOrders, locked });
    const urgent: PlanOrder = {
      id: 'SIMULADO', orderNumber: 0, articleCode: art.code, qty, dueDate: body.dueDate ? new Date(body.dueDate) : null, priority: Number(body.priority ?? 1),
      route: art.route.map((s: any) => ({ seq: s.seq, resources: s.resources, setupMin: s.setupMin, ratePerHour: s.ratePerHour })),
    };
    const after = schedule({ now, calendars: inp.cals, resources: inp.res, orders: [...inp.planOrders, urgent], locked });
    const result = after.orders.find((o) => o.orderId === 'SIMULADO')!;
    const impact = comparePlans(before, after).filter((x) => x.orderId !== 'SIMULADO');
    const byId = new Map(inp.planOrders.map((p) => [p.id, p]));
    const orderDocs = new Map((inp.orders as any[]).map((o) => [String(o._id), o]));
    return {
      urgent: { ...result, ops: after.ops.filter((o) => o.orderId === 'SIMULADO') },
      impact: impact.filter((x) => this.articleInScope(sc, inp.articles.find((a: any) => a.code === byId.get(x.orderId)?.articleCode))).map((x) => ({ ...x, clientName: orderDocs.get(x.orderId)?.clientName, articleCode: byId.get(x.orderId)?.articleCode, dueDate: byId.get(x.orderId)?.dueDate })),
      lateBefore: before.orders.filter((o) => o.late && this.articleInScope(sc, inp.articles.find((a: any) => a.code === byId.get(o.orderId)?.articleCode))).length,
      lateAfter: after.orders.filter((o) => o.late && o.orderId !== 'SIMULADO' && this.articleInScope(sc, inp.articles.find((a: any) => a.code === byId.get(o.orderId)?.articleCode))).length,
    };
  }

  /** Da de alta el pedido simulado como orden real de Sensobox y replanifica. */
  async confirmUrgent(body: { articleCode: string; qty: number; dueDate?: string; priority?: number; clientName?: string }, lang: Lang, company?: string | null) {
    const art: any = await this.articles.findOne({ code: body.articleCode }).lean();
    const sc = await this.scope(company);
    if (!art || !this.articleInScope(sc, art)) throw new BadRequestException(tr('errors.planning.unknownArticle', { code: body.articleCode }));
    const qty = Number(body.qty);
    if (!(qty > 0) || !body.clientName) throw new BadRequestException(tr('errors.planning.invalidData'));
    await this.detectCompany();
    const due = body.dueDate ? new Date(body.dueDate) : null;
    // cada empresa numera tras su última orden (Millars en 2611xx, el resto como siempre)
    const own = sc.company ? { companyName: sc.company } : { companyName: { $nin: sc.owners } };
    const last: any = await this.orders.findOne(own).sort({ orderNumber: -1 }).lean();
    const num = (last?.orderNumber ?? 260000) + 1;
    const order = await this.orders.create(sc.company === MILLARS.name
      ? millarsOrderDoc(lang, num, art.code, qty, body.clientName, due ?? new Date(Date.now() + 48 * 3600000), 1)
      : this.orderDoc(lang, num, body.clientName, art, qty, due, 1));
    await this.links.create({ orderId: String(order._id), orderNumber: order.orderNumber, articleCode: art.code, dueDate: body.dueDate ? new Date(body.dueDate) : null, priority: Number(body.priority ?? 1) });
    await this.replan();
    return { id: String(order._id), orderNumber: order.orderNumber };
  }

  /** Enlaza un pedido de Sensobox con un artículo (ruta) para que entre en el plan. */
  async link(orderId: string, body: { articleCode: string; dueDate?: string; priority?: number }) {
    const order: any = await this.orders.findById(orderId).lean().catch(() => null);
    if (!order) throw new NotFoundException(tr('errors.planning.notFound'));
    if (!(await this.articles.exists({ code: body.articleCode }))) throw new BadRequestException(tr('errors.planning.unknownArticle', { code: body.articleCode }));
    await this.links.updateOne(
      { orderId },
      { $set: { orderNumber: order.orderNumber, articleCode: body.articleCode, dueDate: body.dueDate ? new Date(body.dueDate) : order.processingDate ?? null, priority: Number(body.priority ?? 3) } },
      { upsert: true },
    );
    await this.replan();
    return { ok: true };
  }

  async setPriority(orderId: string, body: { priority?: number; dueDate?: string }) {
    const set: any = {};
    if (body.priority !== undefined) set.priority = Math.min(3, Math.max(1, Number(body.priority)));
    if (body.dueDate) set.dueDate = new Date(body.dueDate);
    const r = await this.links.updateOne({ orderId }, { $set: set });
    if (r.matchedCount === 0) throw new NotFoundException(tr('errors.planning.notFound'));
    await this.replan();
    return { ok: true };
  }

  // ---------- Datos maestros ----------
  async master(company?: string | null) {
    const sc = await this.scope(company);
    const [allResources, allCalendars, allArticles, cap] = await Promise.all([
      this.resources.find().sort({ sort: 1 }).lean(),
      this.calendars.find().lean(),
      this.articles.find().sort({ code: 1 }).lean(),
      this.capacity(),
    ]);
    const resources = allResources.filter((r: any) => sc.codes.has(r.code));
    const calendars = allCalendars.filter((c: any) => resources.some((r: any) => r.calendarCode === c.code));
    const articles = allArticles.filter((a: any) => this.articleInScope(sc, a));
    const ritmia = await this.ritmiaAvailability();
    return { resources: resources.map((r: any) => ({ ...r, capacity: cap.find((c) => c.code === r.code) })), calendars, articles, ritmia: { configured: !!ritmia.url, ok: ritmia.ok, url: ritmia.url, error: ritmia.error } };
  }

  async updateResource(code: string, body: { efficiency?: number; calendarCode?: string }) {
    const set: any = {};
    if (body.efficiency !== undefined) {
      const e = Number(body.efficiency);
      if (!(e > 0 && e <= 1)) throw new BadRequestException(tr('errors.planning.invalidData'));
      set.efficiency = e;
    }
    if (body.calendarCode) {
      if (!(await this.calendars.exists({ code: body.calendarCode }))) throw new BadRequestException(tr('errors.planning.invalidData'));
      set.calendarCode = body.calendarCode;
    }
    const r = await this.resources.updateOne({ code }, { $set: set });
    if (r.matchedCount === 0) throw new NotFoundException(tr('errors.planning.notFound'));
    await this.replan();
    return { ok: true };
  }

  async updateCalendar(code: string, body: { holidays?: string[]; shifts?: any[] }) {
    const set: any = {};
    if (Array.isArray(body.holidays)) {
      if (!body.holidays.every((h) => /^\d{4}-\d{2}-\d{2}$/.test(h))) throw new BadRequestException(tr('errors.planning.invalidData'));
      set.holidays = [...new Set(body.holidays)].sort();
    }
    if (Array.isArray(body.shifts)) {
      const ok = body.shifts.every((s) => /^\d{2}:\d{2}$/.test(s.start) && /^\d{2}:\d{2}$/.test(s.end) && Array.isArray(s.days));
      if (!ok) throw new BadRequestException(tr('errors.planning.invalidData'));
      set.shifts = body.shifts;
    }
    const r = await this.calendars.updateOne({ code }, { $set: set });
    if (r.matchedCount === 0) throw new NotFoundException(tr('errors.planning.notFound'));
    await this.replan();
    return { ok: true };
  }

  // ---------- Integración con Ritmia ----------
  /** Qué OF tiene cada máquina conectada a Ritmia (en curso y próximas 7 días). */
  /** Pedidos en riesgo con su motivo y holgura (Planta 3D, panel de dirección). */
  async atRisk(marginHours = 24) {
    if ((await this.operations.countDocuments()) === 0) await this.replan();
    const inp = await this.inputs();
    const all = this.orderSummaries(inp, await this.operations.find().lean());
    return { now: new Date().toISOString(), total: all.length, orders: ordersAtRisk(all as any, marginHours) };
  }

  async dispatch() {
    if ((await this.operations.countDocuments()) === 0) await this.replan();
    const now = new Date();
    const ritmiaCodes = (await this.resources.find({ ritmia: true }).lean()).map((r: any) => r.code);
    const ops = await this.operations.find({ resourceCode: { $in: ritmiaCodes }, end: { $gt: now }, start: { $lt: new Date(now.getTime() + 7 * 86400000) } }).sort({ start: 1 }).lean();
    const orderIds = [...new Set(ops.map((o: any) => o.orderId))];
    const orders = await this.orders.find({ _id: { $in: orderIds } }).lean();
    const links = await this.links.find({ orderId: { $in: orderIds } }).lean();
    const arts = await this.articles.find().lean();
    return ops.map((op: any) => {
      const o: any = orders.find((x: any) => String(x._id) === op.orderId);
      const l: any = links.find((x: any) => x.orderId === op.orderId);
      return {
        ref: `OF-${op.orderNumber}`, resourceCode: op.resourceCode, articleCode: op.articleCode, articleName: (arts.find((a: any) => a.code === op.articleCode) as any)?.name ?? op.articleCode,
        client: o?.clientName ?? null, qty: op.qty, done: l?.producedGood ?? 0, dueDate: l?.dueDate ?? null, start: op.start, end: op.end,
        status: new Date(op.start) <= now ? 'running' : 'planned',
      };
    });
  }

  // ---------- Integración con Acopia (compras): materiales de cada OF ----------
  /** OF abiertas con su material pendiente, por orden de inicio del plan; las existencias se reservan en ese orden. */
  private async ofMaterials() {
    if ((await this.operations.countDocuments()) === 0) await this.replan();
    const [orders, links, articles, ops] = await Promise.all([
      this.orders.find({ status: { $in: OPEN_STATUSES } }).lean(),
      this.links.find().lean(),
      this.articles.find().lean(),
      this.operations.find().sort({ start: 1 }).lean(),
    ]);
    const linkByOrder = new Map(links.map((l: any) => [l.orderId, l]));
    const artByCode = new Map(articles.map((a: any) => [a.code, a]));
    const startByOrder = new Map<string, Date>();
    for (const op of ops as any[]) if (!startByOrder.has(op.orderId)) startByOrder.set(op.orderId, new Date(op.start));
    const ofs: (OfInput & { orderNumber: number })[] = [];
    for (const o of orders as any[]) {
      const l: any = linkByOrder.get(String(o._id));
      if (!l) continue;
      ofs.push({ ref: `OF-${o.orderNumber}`, orderNumber: o.orderNumber, articleCode: l.articleCode, product: (artByCode.get(l.articleCode) as any)?.name ?? o.workName,
        pending: Math.max(0, (o.productionQuantity ?? 0) - (l.producedGood ?? 0)), start: startByOrder.get(String(o._id)) ?? null });
    }
    return { ofs, materials: materialsByOf(ofs, DEMO_STOCK) };
  }

  /** `GET /api/of/{ref}/materiales` para Acopia: { ref, producto, inicio, materiales: [{ codigo, descripcion, cantidad, unidad, falta }] }. */
  async ofMaterialsFor(ref: string) {
    const num = ofNumber(ref);
    const { ofs, materials } = await this.ofMaterials();
    const of = ofs.find((x) => x.orderNumber === num);
    if (!of) throw new NotFoundException(tr('errors.planning.notFound'));
    return { ref: of.ref, producto: of.product, inicio: (of.start ?? new Date()).toISOString().slice(0, 10), materiales: materials.get(of.ref) ?? [] };
  }

  /** OF abiertas a las que les falta material (para elegir en Acopia). */
  async ofsWithShortage() {
    const { ofs, materials } = await this.ofMaterials();
    return ofs.map((of) => ({ ref: of.ref, producto: of.product, inicio: (of.start ?? new Date()).toISOString().slice(0, 10), faltan: (materials.get(of.ref) ?? []).filter((m) => m.falta > 0).length }))
      .filter((x) => x.faltan > 0).sort((a, b) => a.inicio.localeCompare(b.inicio));
  }

  /** Piezas fabricadas por OF que manda Ritmia: actualiza el avance y la «cantidad procesada» del pedido. */
  async progress(items: { ref: string; good: number; bad: number }[]) {
    if (!Array.isArray(items)) throw new BadRequestException(tr('errors.planning.invalidData'));
    let updated = 0;
    for (const it of items) {
      const num = Number(String(it.ref).replace(/^OF-/, ''));
      if (!num) continue;
      const l: any = await this.links.findOne({ orderNumber: num });
      if (!l) continue;
      const good = Math.max(l.producedGood ?? 0, Number(it.good) || 0);
      await this.links.updateOne({ _id: l._id }, { $set: { producedGood: good, producedBad: Number(it.bad) || 0 } });
      await this.orders.updateOne({ _id: l.orderId }, { $set: { quantityProcessed: good } });
      updated++;
    }
    return { updated };
  }

  // ---------- Demo ----------
  private company = { name: 'Envases Turia, S.L.', technician: 'Rosa Martínez Peris' };

  /** Empresa y técnico de la demo de Sensobox que haya cargada (los pedidos nuevos van a su nombre). */
  private async detectCompany() {
    const users = this.orders.db.collection('users');
    const admin: any = await users.findOne({ role: 'admin', companyName: { $ne: MILLARS.name } });
    const tech: any = await users.findOne({ role: 'technician', companyName: { $ne: MILLARS.name } });
    if (admin?.companyName) this.company.name = admin.companyName;
    if (tech?.name) this.company.technician = tech.name;
  }

  private orderDoc(lang: Lang, orderNumber: number, clientName: string, art: any, qty: number, due: Date | null, status: number) {
    const a = ARTICLES[art.code];
    const hours = art.route.reduce((s: number, r: any) => s + r.setupMin / 60 + qty / r.ratePerHour, 0);
    return {
      orderNumber, clientName, companyName: this.company.name, workName: art.name, workType: demoText.workType[lang], productionQuantity: qty,
      colors: a?.color[lang] ?? '—', processes: art.route.map((r: any) => r.name).join(' + '), specialFinishes: demoText.noFinish[lang],
      technician: this.company.technician, processingDate: due ?? undefined, processingTime: Math.round(hours * 10) / 10, status,
      quantityProcessed: 0, initialQuantity: qty,
    };
  }

  async seedDemo(langIn: string) {
    const lang = (LANGS.includes(langIn as Lang) ? langIn : 'es') as Lang;
    const old = await this.links.find({ demo: true }).lean();
    await this.orders.deleteMany({ _id: { $in: old.map((l: any) => l.orderId) } });
    await Promise.all([this.resources.deleteMany({}), this.calendars.deleteMany({}), this.articles.deleteMany({}), this.links.deleteMany({}), this.operations.deleteMany({})]);
    await this.calendars.insertMany(demoCalendars(lang));
    await this.resources.insertMany(demoResources(lang));
    const arts = demoArticles(lang);
    await this.articles.insertMany(arts);
    await this.detectCompany();
    const now = Date.now();
    // Numeración fija 26001… (la que usan las demos de Lotea y Planta 3D para encontrar los lotes de cada OF); si ese bloque
    // ya lo ocupan órdenes que no son de esta demo, se sigue tras la última.
    const ocupadas = await this.orders.countDocuments({ orderNumber: { $gte: DEMO_FIRST_ORDER, $lt: DEMO_FIRST_ORDER + DEMO_ORDERS.length } });
    const last: any = ocupadas ? await this.orders.findOne({ companyName: { $ne: MILLARS.name } }).sort({ orderNumber: -1 }).lean() : null;
    let num = ocupadas ? (last?.orderNumber ?? DEMO_FIRST_ORDER - 1) + 1 : DEMO_FIRST_ORDER;
    const locked: any[] = [];
    for (let i = 0; i < DEMO_ORDERS.length; i++) {
      const [code, qty, dueH, priority, status, runningH] = DEMO_ORDERS[i];
      const art = arts.find((a) => a.code === code)!;
      const due = new Date(Math.round((now + dueH * 3600000) / 3600000) * 3600000);
      const order = await this.orders.create(this.orderDoc(lang, num++, CLIENTS[i % CLIENTS.length], art, qty, due, status));
      const firstRate = art.route[0].ratePerHour;
      await this.links.create({ orderId: String(order._id), orderNumber: order.orderNumber, articleCode: code, dueDate: due, priority, demo: true, producedGood: runningH ? Math.round(firstRate * 0.85 * runningH) : 0 });
      if (runningH) {
        locked.push({ orderId: String(order._id), orderNumber: order.orderNumber, articleCode: code, seq: art.route[0].seq, resourceCode: art.route[0].resources[0], start: new Date(now - runningH * 3600000), end: new Date(now), locked: true, qty, setupMin: art.route[0].setupMin, workMin: 0 });
        await this.orders.updateOne({ _id: order._id }, { $set: { quantityProcessed: Math.round(firstRate * 0.85 * runningH), processingDateInitial: new Date(now - runningH * 3600000) } });
      }
    }
    await this.operations.insertMany(locked);
    // Hornos de Fornival (otra empresa de la demo, órdenes cerradas): los que atiende Averix, con su número de orden
    const fv = fornivalOrderDocs(lang);
    await this.orders.deleteMany({ companyName: FORNIVAL.name, orderNumber: { $in: fv.map((o) => o.orderNumber) } });
    await this.orders.insertMany(fv);
    const millars = await this.seedMillars(lang, now);
    const plan = await this.replan();
    this.logger.log(`Demo de Planifica cargada (${lang}): ${plan.ops.length} operaciones, ${plan.orders.filter((o) => o.late).length} con retraso`);
    return { lang, orders: DEMO_ORDERS.length, fornival: fv.length, millars, operations: plan.ops.length, late: plan.orders.filter((o) => o.late).length };
  }

  /** Cerámicas Millars (línea CAS-1 de Planta 3D y Atisba): recursos, calendario y artículos propios, sus usuarios, dos OF
   *  cerradas y cinco abiertas; la 261184 lleva 3 h en el horno HR-01 (todas las fases de la línea a la vez, fijadas). */
  private async seedMillars(lang: Lang, now: number) {
    await this.calendars.insertMany([millarsCalendar(lang)]);
    await this.resources.insertMany(millarsResources(lang));
    const arts = millarsArticles(lang);
    await this.articles.insertMany(arts);
    const users = this.orders.db.collection('users');
    const hash = await bcrypt.hash(process.env.DEMO_PASSWORD || 'Demo2026!', 10);
    for (const u of MILLARS_USERS) {
      await users.updateOne({ email: u.email }, {
        $set: { name: u.name, clientName: MILLARS.name, companyName: MILLARS.name, role: u.role, contactName: u.name, contactPhone: u.phone, contactEmail: u.email },
        $setOnInsert: { password: hash, eco: false, ecoEmissions: 0, createdAt: new Date(now), updatedAt: new Date(now), __v: 0 },
      }, { upsert: true });
    }
    const nums = [...MILLARS_OPEN.map((o) => o[0]), ...MILLARS_CLOSED.map((o) => o[0])];
    await this.orders.deleteMany({ companyName: MILLARS.name, orderNumber: { $in: nums } });
    const hour = (h: number) => new Date(Math.round((now + h * 3600000) / 3600000) * 3600000);
    for (const [num, code, qty, client, h] of MILLARS_CLOSED) {
      const fin = new Date(now - h * 3600000 + 8 * 3600000);
      await this.orders.create(millarsOrderDoc(lang, num, code, qty, client, fin, 3, new Date(now - h * 3600000)));
    }
    const locked: any[] = [];
    for (const [num, code, qty, client, dueH, priority] of MILLARS_OPEN) {
      const running = num === MILLARS_RUNNING;
      const start = running ? new Date(now - 3 * 3600000) : undefined;
      const order = await this.orders.create(millarsOrderDoc(lang, num, code, qty, client, hour(dueH), running ? 2 : 1, start));
      const art = arts.find((a) => a.code === code)!;
      const good = running ? Math.round(art.route[2].ratePerHour * 0.88 * 3) : 0;
      await this.links.create({ orderId: String(order._id), orderNumber: num, articleCode: code, dueDate: hour(dueH), priority, demo: true, producedGood: good });
      if (running) {
        await this.orders.updateOne({ _id: order._id }, { $set: { quantityProcessed: good } });
        // la línea es continua: prensa, esmaltado, horno y clasificadora trabajan la misma OF con 30 min de desfase
        art.route.forEach((st, i) => locked.push({ orderId: String(order._id), orderNumber: num, articleCode: code, seq: st.seq, resourceCode: st.resources[0],
          start: new Date(now - (4 - i * 0.5) * 3600000), end: new Date(now), locked: true, qty, setupMin: st.setupMin, workMin: 0 }));
      }
    }
    await this.operations.insertMany(locked);
    return { users: MILLARS_USERS.length, open: MILLARS_OPEN.length, closed: MILLARS_CLOSED.length };
  }
}
