import { ordersAtRisk, OrderSummary } from './risk';

const base: OrderSummary = { id: 'a', orderNumber: 1, articleCode: 'TAR-500', qty: 1000, producedGood: 0, dueDate: '2026-10-24T12:00:00Z', end: '2026-10-23T12:00:00Z', lateMin: 0, late: false, unplanned: false };

describe('Pedidos en riesgo (Planta 3D)', () => {
  it('clasifica retrasados, sin plan y con poca holgura, y descarta los terminados y los holgados', () => {
    const r = ordersAtRisk([
      { ...base, id: 'ok' },
      { ...base, id: 'tight', end: '2026-10-24T02:00:00Z' },
      { ...base, id: 'late', end: '2026-10-24T18:00:00Z', late: true, lateMin: 360 },
      { ...base, id: 'unplanned', unplanned: true, late: true, end: null },
      { ...base, id: 'done', producedGood: 1000, late: true },
    ]);
    expect(r.map((o) => o.id)).toEqual(['unplanned', 'late', 'tight']);
    expect(r[1].slackMin).toBe(-360);
    expect(r[2].risk).toBe('tight');
  });
});
