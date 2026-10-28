import { mkdtempSync, readdirSync, readFileSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { CABECERA_EF, facturaOrdenCsv, facturarOrden, leerDatosFacturacion } from './enlace-fiscal';

const datos = { tarifa: { Estuche: 0.21, _defecto: 0.25 }, clientes: { 'Conservas Albufera, S.A.': 'A46102349' } };
const orden = { orderNumber: 1042, clientName: 'Conservas Albufera, S.A.', workName: 'Estuche lata de atún x3', workType: 'Estuche', productionQuantity: 12000, finalQuantity: 11850 };

describe('Facturación por Enlace Fiscal', () => {
  it('factura las unidades finales a la tarifa del tipo de trabajo, con IVA, en la plantilla Access · CSV', () => {
    const f = facturaOrdenCsv(orden, datos, { serie: 'SB', iva: 21, fecha: '2026-10-28' })!;
    expect(f.numSerie).toBe('SB2026-001042');
    expect(f.total).toBe(3011.09); // 11.850 × 0,21 = 2.488,50 + 522,59 de IVA
    expect(f.contenido).toBe(`${CABECERA_EF}\r\nSB;2026-001042;28/10/2026;A46102349;"Conservas Albufera, S.A.";3011,09;Estuche lata de atún x3 (Estuche) · OF 1042;11850,000;0,2100;21,00\r\n`.replace('"Conservas Albufera, S.A."', 'Conservas Albufera, S.A.'));
  });
  it('sin NIF del cliente no factura; sin cantidad final usa la de producción; tipo desconocido, tarifa por defecto', () => {
    expect(facturaOrdenCsv({ ...orden, clientName: 'Otra, S.L.' }, datos, { serie: 'SB', iva: 21, fecha: '2026-10-28' })).toBeNull();
    const f = facturaOrdenCsv({ ...orden, finalQuantity: 0, workType: 'Otro' }, datos, { serie: 'SB', iva: 21, fecha: '2026-10-28' })!;
    expect([f.unidades, f.precio]).toEqual([12000, 0.25]);
  });
  it('desactivada sin carpeta; con carpeta deja el fichero sin restos temporales', () => {
    expect(facturarOrden(orden, {}).estado).toBe('desactivada');
    const base = mkdtempSync(join(tmpdir(), 'sensobox-ef-'));
    writeFileSync(join(base, 'clientes.json'), JSON.stringify(datos));
    const r = facturarOrden(orden, { ENLACE_FISCAL_CARPETA: join(base, 'entrada'), FACTURACION_CLIENTES: join(base, 'clientes.json') }, new Date('2026-10-28T10:00:00Z'));
    expect(r).toMatchObject({ estado: 'enviada', numSerie: 'SB2026-001042', total: 3011.09 });
    expect(readdirSync(join(base, 'entrada'))).toEqual(['SB2026-001042.csv']);
    expect(readFileSync(join(base, 'entrada', 'SB2026-001042.csv'), 'utf8')).toContain('A46102349');
  });
  it('los datos de la demo tienen NIF para los 18 clientes de Envases Turia', () => {
    const d = leerDatosFacturacion(join(__dirname, 'clientes-demo.json'));
    expect(Object.keys(d.clientes)).toHaveLength(18);
    expect(Object.values(d.clientes).every((n) => /^[A-HJNP-SUVW]\d{7}[0-9A-J]$/.test(n))).toBe(true);
  });
});
