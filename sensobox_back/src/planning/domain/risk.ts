// Pedidos en riesgo para el panel de dirección de Planta 3D: los que acaban después de la fecha de entrega, los que no
// caben en el plan y los que acaban con menos de `marginHours` de holgura. Ordenados por gravedad.
export interface OrderSummary {
  id: string; orderNumber: number; clientName?: string; articleCode: string; articleName?: string; qty: number; producedGood: number;
  dueDate: Date | string | null; end: Date | string | null; lateMin: number; late: boolean; unplanned: boolean;
}
export type RiskLevel = 'late' | 'unplanned' | 'tight';

export function ordersAtRisk(orders: OrderSummary[], marginHours = 24) {
  const out: (OrderSummary & { risk: RiskLevel; slackMin: number | null })[] = [];
  for (const o of orders) {
    if (o.producedGood >= o.qty) continue;
    const due = o.dueDate ? new Date(o.dueDate).getTime() : null;
    const end = o.end ? new Date(o.end).getTime() : null;
    const slackMin = due !== null && end !== null ? Math.round((due - end) / 60000) : null;
    let risk: RiskLevel | null = null;
    if (o.unplanned) risk = 'unplanned';
    else if (o.late || (slackMin !== null && slackMin < 0)) risk = 'late';
    else if (slackMin !== null && slackMin < marginHours * 60) risk = 'tight';
    if (risk) out.push({ ...o, risk, slackMin });
  }
  const rank: Record<RiskLevel, number> = { unplanned: 0, late: 1, tight: 2 };
  return out.sort((a, b) => rank[a.risk] - rank[b.risk] || (a.slackMin ?? -1e9) - (b.slackMin ?? -1e9));
}
