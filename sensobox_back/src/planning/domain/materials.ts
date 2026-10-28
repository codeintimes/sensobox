// Planifica · materiales de cada OF (lista de materiales por artículo) y lo que falta tras reservar existencias
// por orden de inicio del plan. Lo consume Acopia (compras con IA): `GET /api/of/{ref}/materiales`.
// Los códigos son los de los artículos de compra de Envases Turia (los mismos que tiene Acopia).

export interface Material { code: string; description: string; unit: 'kg' | 'ud'; perUnit: number }

const m = (code: string, description: string, unit: 'kg' | 'ud', perUnit: number): Material => ({ code, description, unit, perUnit });
const PP = (g: number) => m('GR-PP-H12', 'Granza PP homopolímero inyección', 'kg', g / 1000);
const BLANCO = (g: number) => m('MB-BL-TIO2', 'Masterbatch blanco TiO2', 'kg', g / 1000);
const AZUL = (g: number) => m('MB-AZ-15', 'Masterbatch azul', 'kg', g / 1000);
const CAJA = (porCaja: number) => m('CJ-600-400', 'Caja cartón doble canal 600×400×400', 'ud', 1 / porCaja);
const PALET = (porPalet: number) => m('PAL-EPAL', 'Palé EPAL', 'ud', 1 / porPalet);
const FILM = (porPalet: number) => m('FILM-23', 'Film estirable 23 µm', 'kg', 0.3 / porPalet);

/** Consumo por unidad fabricada de cada artículo de la demo. */
export const BOM: Record<string, Material[]> = {
  'TAP-38': [PP(3), BLANCO(0.06), CAJA(2500)],
  'TAP-83': [PP(6), BLANCO(0.12), CAJA(1200)],
  'TAR-500': [PP(18), m('AD-AE-200', 'Aditivo antiestático', 'kg', 0.00009), CAJA(400), m('SEP-CART', 'Separador de cartón 580×380', 'ud', 1 / 200)],
  'TAR-250': [PP(11), BLANCO(0.22), CAJA(600)],
  'CUB-5L': [PP(220), AZUL(4.4), PALET(240), FILM(240)],
  'CUB-10L': [PP(420), AZUL(8.4), PALET(120), FILM(120)],
  'BOT-1L': [m('GR-PEAD-S', 'Granza PEAD soplado', 'kg', 0.045), m('TP-38-PE', 'Tapón 38 mm PE con precinto', 'ud', 1), CAJA(60)],
  'TAP-CUB': [PP(90), AZUL(1.8), PALET(500)],
};

/** Existencias de la demo en almacén (en una implantación, del ERP por Conectores ERP). */
export const DEMO_STOCK: Record<string, number> = {
  'GR-PP-H12': 9000, 'GR-PEAD-S': 600, 'MB-BL-TIO2': 120, 'MB-AZ-15': 40, 'AD-AE-200': 10, 'TP-38-PE': 8000,
  'CJ-600-400': 1200, 'SEP-CART': 600, 'PAL-EPAL': 40, 'FILM-23': 25,
};

export interface OfInput { ref: string; articleCode: string; product: string; pending: number; start: Date | null }
export interface OfMaterial { codigo: string; descripcion: string; cantidad: number; unidad: string; falta: number }

const up = (n: number) => Math.ceil(n - 1e-9);

/**
 * Reparte las existencias entre las OF abiertas por orden de inicio (las que empiezan antes cogen primero) y devuelve,
 * por OF, lo que necesita de cada material y lo que le falta.
 */
export function materialsByOf(ofs: OfInput[], stock: Record<string, number>): Map<string, OfMaterial[]> {
  const left = { ...stock };
  const out = new Map<string, OfMaterial[]>();
  const order = [...ofs].sort((a, b) => (a.start?.getTime() ?? Infinity) - (b.start?.getTime() ?? Infinity) || a.ref.localeCompare(b.ref));
  for (const of of order) {
    const lines = (BOM[of.articleCode] ?? []).map((mat) => {
      const need = up(Math.max(0, of.pending) * mat.perUnit);
      const have = Math.max(0, left[mat.code] ?? 0);
      const used = Math.min(have, need);
      left[mat.code] = have - used;
      return { codigo: mat.code, descripcion: mat.description, cantidad: need, unidad: mat.unit, falta: need - used };
    });
    out.set(of.ref, lines);
  }
  return out;
}

/** «OF-26012», «OF-2026-26012» o «26012» → 26012. */
export const ofNumber = (ref: string) => Number(/(\d+)\s*$/.exec(String(ref))?.[1] ?? NaN);
