import { BOM, materialsByOf, ofNumber } from './materials';

describe('materiales de las OF para Acopia', () => {
  it('reserva las existencias por orden de inicio y lo que no llega queda como falta', () => {
    const t = (h: number) => new Date(Date.UTC(2026, 9, 28, h));
    const r = materialsByOf([
      { ref: 'OF-2', articleCode: 'BOT-1L', product: 'Bote', pending: 10000, start: t(10) },
      { ref: 'OF-1', articleCode: 'BOT-1L', product: 'Bote', pending: 10000, start: t(8) },
    ], { 'GR-PEAD-S': 600, 'TP-38-PE': 12000, 'CJ-600-400': 1000 });
    const pead1 = r.get('OF-1')!.find((x) => x.codigo === 'GR-PEAD-S')!;
    expect(pead1).toEqual({ codigo: 'GR-PEAD-S', descripcion: 'Granza PEAD soplado', cantidad: 450, unidad: 'kg', falta: 0 });
    expect(r.get('OF-2')!.find((x) => x.codigo === 'GR-PEAD-S')!.falta).toBe(300);
    expect(r.get('OF-2')!.find((x) => x.codigo === 'TP-38-PE')!.falta).toBe(8000);
    expect(r.get('OF-1')!.find((x) => x.codigo === 'CJ-600-400')!.cantidad).toBe(167);
  });
  it('cada artículo de la demo tiene materiales y la referencia admite varios formatos', () => {
    for (const code of ['TAP-38', 'TAP-83', 'TAR-500', 'TAR-250', 'CUB-5L', 'CUB-10L', 'BOT-1L', 'TAP-CUB']) expect(BOM[code].length).toBeGreaterThan(1);
    expect(ofNumber('OF-26012')).toBe(26012);
    expect(ofNumber('OF-2026-26012')).toBe(26012);
    expect(ofNumber('26012')).toBe(26012);
    expect(ofNumber('x')).toBeNaN();
  });
});

describe('clave de integración de las OF', () => {
  it('admite Bearer o x-api-key con INTEGRATION_KEY', () => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { integrationKeyOk } = require('../infrastructure/of.controller');
    process.env.INTEGRATION_KEY = 'clave';
    expect(integrationKeyOk('Bearer clave')).toBe(true);
    expect(integrationKeyOk(undefined, 'clave')).toBe(true);
    expect(integrationKeyOk('Bearer otra', 'otra')).toBe(false);
    expect(integrationKeyOk()).toBe(false);
  });
});
