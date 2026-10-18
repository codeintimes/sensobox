import { Calendar, comparePlans, loadByDay, localToUtc, PlanOrder, schedule, walk, workingMinutes } from './scheduler';

const ALL = [1, 2, 3, 4, 5, 6, 7];
const H24: Calendar = { code: '24H', shifts: [{ start: '06:00', end: '14:00', days: ALL }, { start: '14:00', end: '22:00', days: ALL }, { start: '22:00', end: '06:00', days: ALL }], holidays: [] };
const DAY: Calendar = { code: 'DIA', shifts: [{ start: '06:00', end: '14:00', days: [1, 2, 3, 4, 5] }], holidays: ['2026-12-08'] };
const now = localToUtc('2026-12-07', '06:00'); // lunes

const order = (id: string, qty: number, due: string | null, priority = 3, route = [{ seq: 10, resources: ['M1'], setupMin: 0, ratePerHour: 60 }]): PlanOrder => ({
  id, orderNumber: Number(id.replace(/\D/g, '')) || 1, articleCode: 'A', qty, dueDate: due ? new Date(due) : null, priority, route,
});

describe('Planifica · calendario', () => {
  it('cuenta los minutos de trabajo de un turno de mañana de lunes a viernes, con festivo', () => {
    // lunes 7 (8 h), martes 8 festivo, miércoles 9 (8 h)
    expect(workingMinutes(DAY, localToUtc('2026-12-07', '00:00'), localToUtc('2026-12-10', '00:00'))).toBe(16 * 60);
  });
  it('una operación que no cabe en el turno sigue en el siguiente día laborable', () => {
    const w = walk(DAY, localToUtc('2026-12-07', '12:00').getTime(), 4 * 60, localToUtc('2027-01-31', '00:00').getTime())!;
    expect(new Date(w.end).toISOString()).toBe(localToUtc('2026-12-09', '08:00').toISOString());
  });
});

describe('Planifica · capacidad finita', () => {
  it('no solapa dos órdenes en la misma máquina y respeta prioridad y fecha de entrega', () => {
    const plan = schedule({
      now, calendars: [H24], resources: [{ code: 'M1', calendarCode: '24H', factor: 1 }],
      orders: [order('OF1', 120, '2026-12-20T00:00:00Z'), order('OF2', 60, '2026-12-08T00:00:00Z'), order('OF3', 60, '2026-12-30T00:00:00Z', 1)],
    });
    const seq = plan.ops.map((o) => o.orderId);
    expect(seq).toEqual(['OF3', 'OF2', 'OF1']); // urgente primero, luego por fecha de entrega
    for (let i = 1; i < plan.ops.length; i++) expect(plan.ops[i].start.getTime()).toBeGreaterThanOrEqual(plan.ops[i - 1].end.getTime());
    expect(plan.ops[2].end.toISOString()).toBe(localToUtc('2026-12-07', '10:00').toISOString());
  });

  it('usa el factor de capacidad real (OEE) para alargar la operación', () => {
    const plan = schedule({ now, calendars: [H24], resources: [{ code: 'M1', calendarCode: '24H', factor: 0.5 }], orders: [order('OF1', 60, null)] });
    expect((plan.ops[0].end.getTime() - plan.ops[0].start.getTime()) / 60000).toBe(120);
  });

  it('elige la máquina alternativa que acaba antes y encadena la ruta', () => {
    const route = [
      { seq: 10, resources: ['M1', 'M2'], setupMin: 30, ratePerHour: 60 },
      { seq: 20, resources: ['MON'], setupMin: 0, ratePerHour: 120 },
    ];
    const plan = schedule({
      now, calendars: [H24],
      resources: [{ code: 'M1', calendarCode: '24H', factor: 1 }, { code: 'M2', calendarCode: '24H', factor: 1 }, { code: 'MON', calendarCode: '24H', factor: 1 }],
      orders: [order('OF1', 600, null, 3, route), order('OF2', 60, null, 3, route)],
    });
    const of2 = plan.ops.filter((o) => o.orderId === 'OF2');
    expect(of2[0].resourceCode).toBe('M2');
    expect(of2[1].start.getTime()).toBeGreaterThanOrEqual(of2[0].end.getTime());
  });

  it('respeta una operación fijada a mano y avisa del retraso', () => {
    const lockedStart = localToUtc('2026-12-07', '08:00');
    const plan = schedule({
      now, calendars: [H24], resources: [{ code: 'M1', calendarCode: '24H', factor: 1 }],
      orders: [order('OF1', 600, '2026-12-07T12:00:00Z'), order('OF2', 120, null)],
      locked: [{ orderId: 'OF2', seq: 10, resourceCode: 'M1', start: lockedStart }],
    });
    const of2 = plan.ops.find((o) => o.orderId === 'OF2')!;
    expect(of2.locked).toBe(true);
    expect(of2.start.toISOString()).toBe(lockedStart.toISOString());
    const of1 = plan.ops.find((o) => o.orderId === 'OF1')!;
    expect(of1.start.getTime()).toBeGreaterThanOrEqual(of2.end.getTime()); // 06-08 no caben 10 h, va detrás
    expect(plan.orders.find((o) => o.orderId === 'OF1')!.late).toBe(true);
  });

  it('simula un pedido urgente y detecta qué órdenes se retrasan', () => {
    const base = { now, calendars: [H24], resources: [{ code: 'M1', calendarCode: '24H', factor: 1 }] };
    const orders = [order('OF1', 480, localToUtc('2026-12-07', '15:00').toISOString())];
    const before = schedule({ ...base, orders });
    const after = schedule({ ...base, orders: [...orders, order('URG', 240, null, 1)] });
    const diff = comparePlans(before, after);
    expect(diff).toHaveLength(1);
    expect(diff[0].orderId).toBe('OF1');
    expect(diff[0].shiftMin).toBe(240);
    expect(diff[0].newlyLate).toBe(true);
  });

  it('calcula la carga diaria de cada máquina', () => {
    const plan = schedule({ now, calendars: [DAY], resources: [{ code: 'M1', calendarCode: 'DIA', factor: 1 }], orders: [order('OF1', 240, null)] });
    const load = loadByDay(plan.ops, [{ code: 'M1', calendarCode: 'DIA', factor: 1 }], [DAY], now, 3);
    expect(load[0]).toMatchObject({ day: '2026-12-07', bookedMin: 240, availableMin: 480 });
    expect(load[0].load).toBeCloseTo(0.5);
    expect(load[1].availableMin).toBe(0); // festivo
  });
});
