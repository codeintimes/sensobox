import { FORNIVAL, FORNIVAL_ORDERS, fornivalOrderDocs } from './demo-fornival';

describe('Demo: hornos de Fornival', () => {
  it('cada horno es una orden cerrada de Fornival con su número AANNN y su número de serie', () => {
    const docs = fornivalOrderDocs('fr');
    expect(docs).toHaveLength(FORNIVAL_ORDERS.length);
    expect(new Set(docs.map((d) => d.orderNumber)).size).toBe(docs.length);
    const o = docs.find((d) => d.orderNumber === 25042)!;   // «OF-2025-0042» en Averix
    expect(o.companyName).toBe(FORNIVAL.name);
    expect(o.clientName).toBe('Boulangerie Industrielle Lefèvre SAS');
    expect(o.workName).toBe('Four tunnel à bande FT-1200 · nº de série FT1200-24-0187');
    expect(o.status).toBe(3);
    for (const d of docs) {
      expect(String(d.orderNumber).slice(0, 2)).toBe(String(d.processingDate.getUTCFullYear()).slice(2));
      expect(d.processingDateInitial.getTime()).toBeLessThan(d.processingDate.getTime());
    }
  });
});
