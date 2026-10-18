// Planifica · motor de planificación con capacidad finita.
//
// Algoritmo (inspirado en el enfoque de frePPLe community, MIT: planificación hacia delante por prioridad y
// fecha de entrega, carga de recursos con calendario y operaciones fijadas a mano que se respetan):
// 1. Las órdenes se ordenan por prioridad (1 urgente … 3 normal) y fecha de entrega (EDD).
// 2. Cada operación de la ruta empieza cuando acaba la anterior y busca, entre sus recursos alternativos,
//    el primer hueco libre del calendario donde quepa entera (preparación + piezas / ritmo real).
// 3. El ritmo real = ritmo nominal × factor de capacidad del recurso (OEE real de Ritmia o eficiencia estándar).
// 4. Las operaciones fijadas (arrastradas en el Gantt) no se mueven y ocupan su hueco antes que nadie.
// 5. Una orden va con retraso si su última operación acaba después de la fecha de entrega.

export interface Shift { start: string; end: string; days: number[] } // días ISO: 1 = lunes … 7 = domingo
export interface Calendar { code: string; shifts: Shift[]; holidays: string[] }
export interface Resource { code: string; calendarCode: string; factor: number }
export interface RouteStep { seq: number; resources: string[]; setupMin: number; ratePerHour: number; name?: string }
export interface PlanOrder {
  id: string;
  orderNumber: number;
  articleCode: string;
  qty: number; // piezas pendientes
  dueDate: Date | null;
  priority: number;
  release?: Date | null;
  route: RouteStep[];
}
export interface Locked { orderId: string; seq: number; resourceCode: string; start: Date; end?: Date }
export interface PlannedOp {
  orderId: string;
  orderNumber: number;
  articleCode: string;
  seq: number;
  resourceCode: string;
  start: Date;
  end: Date;
  setupMin: number;
  qty: number;
  workMin: number;
  locked: boolean;
}
export interface OrderResult { orderId: string; orderNumber: number; end: Date | null; dueDate: Date | null; lateMin: number; late: boolean; unplanned: boolean }
export interface PlanResult { ops: PlannedOp[]; orders: OrderResult[] }

const TZ = 'Europe/Madrid';
const MIN = 60000;

// ---------- Calendario ----------
const FMT = new Intl.DateTimeFormat('en-US', { timeZone: TZ, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' });
const DAY_FMT = new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' });
function tzOffsetMin(at: Date): number {
  const p = FMT.formatToParts(at);
  const g = (t: string) => Number(p.find((x) => x.type === t)!.value);
  return Math.round((Date.UTC(g('year'), g('month') - 1, g('day'), g('hour'), g('minute'), g('second')) - at.getTime()) / MIN);
}
export function localToUtc(day: string, hhmm: string): Date {
  const [y, m, d] = day.split('-').map(Number);
  const [h, mi] = hhmm.split(':').map(Number);
  const guess = new Date(Date.UTC(y, m - 1, d, h, mi));
  const o1 = tzOffsetMin(guess);
  const first = new Date(guess.getTime() - o1 * MIN);
  const o2 = tzOffsetMin(first);
  return o1 === o2 ? first : new Date(guess.getTime() - o2 * MIN);
}
export const localDay = (at: Date) => DAY_FMT.format(at);
const addDays = (day: string, n: number) => {
  const [y, m, d] = day.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10);
};
const isoWeekday = (day: string) => {
  const [y, m, d] = day.split('-').map(Number);
  const w = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
  return w === 0 ? 7 : w;
};

const cache = new Map<string, [number, number][]>();

/** Ventanas de trabajo [from, to) de un calendario entre dos instantes (fusionadas y ordenadas). */
export function workingWindows(cal: Calendar, from: Date, to: Date): [number, number][] {
  const d0 = addDays(localDay(from), -1);
  const d1 = localDay(to);
  const key = `${cal.code}|${JSON.stringify(cal.shifts)}|${cal.holidays.join(',')}|${d0}|${d1}`;
  let full = cache.get(key);
  if (!full) {
    full = fullWindows(cal, d0, d1);
    if (cache.size > 2000) cache.clear();
    cache.set(key, full);
  }
  const f = from.getTime(), t = to.getTime();
  const out: [number, number][] = [];
  for (const [a, b] of full) {
    const lo = Math.max(a, f), hi = Math.min(b, t);
    if (hi > lo) out.push([lo, hi]);
  }
  return out;
}

function fullWindows(cal: Calendar, firstDay: string, last: string): [number, number][] {
  const out: [number, number][] = [];
  let day = firstDay;
  while (day <= last) {
    if (!cal.holidays.includes(day)) {
      const wd = isoWeekday(day);
      for (const s of cal.shifts) {
        if (!s.days.includes(wd)) continue;
        const a = localToUtc(day, s.start).getTime();
        const endDay = s.end <= s.start ? addDays(day, 1) : day;
        const b = localToUtc(endDay, s.end).getTime();
        if (b > a) out.push([a, b]);
      }
    }
    day = addDays(day, 1);
  }
  out.sort((x, y) => x[0] - y[0]);
  const merged: [number, number][] = [];
  for (const w of out) {
    const lastW = merged[merged.length - 1];
    if (lastW && w[0] <= lastW[1]) lastW[1] = Math.max(lastW[1], w[1]);
    else merged.push([...w] as [number, number]);
  }
  return merged;
}

/** Minutos de trabajo disponibles entre dos instantes. */
export function workingMinutes(cal: Calendar, from: Date, to: Date): number {
  return workingWindows(cal, from, to).reduce((s, [a, b]) => s + (b - a) / MIN, 0);
}

/** Recorre el calendario desde `start` consumiendo `minutes` de trabajo. Devuelve inicio real y fin. */
export function walk(cal: Calendar, start: number, minutes: number, horizonEnd: number): { start: number; end: number } | null {
  const wins = workingWindows(cal, new Date(start), new Date(horizonEnd));
  let left = minutes * MIN;
  let realStart: number | null = null;
  for (const [a, b] of wins) {
    const s = Math.max(a, start);
    if (s >= b) continue;
    if (realStart === null) realStart = s;
    const avail = b - s;
    if (avail >= left) return { start: realStart, end: s + left };
    left -= avail;
  }
  return null;
}

// ---------- Planificador ----------
export function opMinutes(step: RouteStep, qty: number, factor: number): number {
  const rate = step.ratePerHour * Math.max(0.05, factor);
  return step.setupMin + (qty / rate) * 60;
}

export function schedule(input: {
  now: Date;
  horizonDays?: number;
  calendars: Calendar[];
  resources: Resource[];
  orders: PlanOrder[];
  locked?: Locked[];
}): PlanResult {
  const now = input.now.getTime();
  const horizon = now + (input.horizonDays ?? 60) * 86400000;
  const cal = new Map(input.calendars.map((c) => [c.code, c]));
  const res = new Map(input.resources.map((r) => [r.code, r]));
  const busy = new Map<string, [number, number][]>(input.resources.map((r) => [r.code, []]));
  const ops: PlannedOp[] = [];
  const locked = input.locked ?? [];

  const reserve = (code: string, a: number, b: number) => {
    const list = busy.get(code)!;
    list.push([a, b]);
    list.sort((x, y) => x[0] - y[0]);
  };

  // 1. Operaciones fijadas: ocupan su hueco tal cual (recalculando la duración con el ritmo actual)
  const orderById = new Map(input.orders.map((o) => [o.id, o]));
  const lockedKey = new Set<string>();
  for (const l of locked) {
    const o = orderById.get(l.orderId);
    const r = res.get(l.resourceCode);
    if (!o || !r) continue;
    const step = o.route.find((s) => s.seq === l.seq);
    if (!step) continue;
    const c = cal.get(r.calendarCode)!;
    const work = opMinutes(step, o.qty, r.factor);
    const w = walk(c, l.start.getTime(), work, horizon);
    if (!w) continue;
    reserve(r.code, w.start, w.end);
    lockedKey.add(`${o.id}#${step.seq}`);
    ops.push({ orderId: o.id, orderNumber: o.orderNumber, articleCode: o.articleCode, seq: step.seq, resourceCode: r.code, start: new Date(w.start), end: new Date(w.end), setupMin: step.setupMin, qty: o.qty, workMin: work, locked: true });
  }

  // 2. Resto de órdenes por prioridad y fecha de entrega
  const sorted = [...input.orders].sort(
    (a, b) => a.priority - b.priority || (a.dueDate?.getTime() ?? Infinity) - (b.dueDate?.getTime() ?? Infinity) || a.orderNumber - b.orderNumber,
  );
  const results: OrderResult[] = [];
  for (const o of sorted) {
    let ready = Math.max(now, o.release?.getTime() ?? 0);
    let end: number | null = null;
    let unplanned = false;
    for (const step of [...o.route].sort((a, b) => a.seq - b.seq)) {
      const key = `${o.id}#${step.seq}`;
      if (lockedKey.has(key)) {
        const lop = ops.find((x) => x.orderId === o.id && x.seq === step.seq)!;
        ready = Math.max(ready, lop.end.getTime());
        end = lop.end.getTime();
        continue;
      }
      let best: { code: string; start: number; end: number; work: number } | null = null;
      for (const code of step.resources) {
        const r = res.get(code);
        if (!r) continue;
        const c = cal.get(r.calendarCode);
        if (!c) continue;
        const work = opMinutes(step, o.qty, r.factor);
        const slot = findSlot(c, busy.get(code)!, ready, work, horizon);
        if (slot && (!best || slot.end < best.end)) best = { code, ...slot, work };
      }
      if (!best) {
        unplanned = true;
        break;
      }
      reserve(best.code, best.start, best.end);
      ops.push({ orderId: o.id, orderNumber: o.orderNumber, articleCode: o.articleCode, seq: step.seq, resourceCode: best.code, start: new Date(best.start), end: new Date(best.end), setupMin: step.setupMin, qty: o.qty, workMin: best.work, locked: false });
      ready = best.end;
      end = best.end;
    }
    const due = o.dueDate?.getTime() ?? null;
    const lateMin = !unplanned && end !== null && due !== null ? Math.max(0, (end - due) / MIN) : 0;
    results.push({ orderId: o.id, orderNumber: o.orderNumber, end: end !== null && !unplanned ? new Date(end) : null, dueDate: o.dueDate, lateMin, late: unplanned || lateMin > 0, unplanned });
  }
  ops.sort((a, b) => a.resourceCode.localeCompare(b.resourceCode) || a.start.getTime() - b.start.getTime());
  return { ops, orders: results };
}

/** Primer hueco libre (según calendario y operaciones ya reservadas) donde cabe `work` minutos a partir de `ready`. */
export function findSlot(cal: Calendar, busy: [number, number][], ready: number, work: number, horizon: number) {
  const candidates = [ready, ...busy.map((b) => b[1]).filter((e) => e > ready)].sort((a, b) => a - b);
  for (const c of candidates) {
    const w = walk(cal, c, work, horizon);
    if (!w) return null;
    const clash = busy.some(([a, b]) => a < w.end && b > w.start);
    if (!clash) return w;
  }
  return null;
}

/** Carga por recurso y día: minutos ocupados frente a minutos disponibles del calendario. */
export function loadByDay(ops: PlannedOp[], resources: Resource[], calendars: Calendar[], from: Date, days: number) {
  const cal = new Map(calendars.map((c) => [c.code, c]));
  const out: { resourceCode: string; day: string; bookedMin: number; availableMin: number; load: number }[] = [];
  const firstDay = localDay(from);
  for (const r of resources) {
    const c = cal.get(r.calendarCode)!;
    for (let i = 0; i < days; i++) {
      const day = addDays(firstDay, i);
      const a = localToUtc(day, '00:00').getTime();
      const b = localToUtc(addDays(day, 1), '00:00').getTime();
      const availableMin = workingMinutes(c, new Date(a), new Date(b));
      let bookedMin = 0;
      for (const op of ops) {
        if (op.resourceCode !== r.code) continue;
        const s = Math.max(a, op.start.getTime());
        const e = Math.min(b, op.end.getTime());
        if (e > s) bookedMin += workingMinutes(c, new Date(s), new Date(e));
      }
      out.push({ resourceCode: r.code, day, bookedMin: Math.round(bookedMin), availableMin: Math.round(availableMin), load: availableMin ? bookedMin / availableMin : 0 });
    }
  }
  return out;
}

/** Diferencia entre dos planes: órdenes que pasan a ir con retraso o se retrasan más. */
export function comparePlans(before: PlanResult, after: PlanResult) {
  const prev = new Map(before.orders.map((o) => [o.orderId, o]));
  return after.orders
    .map((o) => {
      const p = prev.get(o.orderId);
      const shiftMin = p?.end && o.end ? (o.end.getTime() - p.end.getTime()) / MIN : 0;
      return { orderId: o.orderId, orderNumber: o.orderNumber, before: p?.end ?? null, after: o.end, shiftMin: Math.round(shiftMin), newlyLate: !!p && !p.late && o.late, late: o.late, lateMin: Math.round(o.lateMin) };
    })
    .filter((x) => x.shiftMin > 0 || x.newlyLate);
}
