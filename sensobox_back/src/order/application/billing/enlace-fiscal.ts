/**
 * Facturación por Enlace Fiscal (transversal/enlace-fiscal): al cerrar una orden (OPI final), Sensobox deja la factura en la
 * carpeta vigilada de Enlace Fiscal, que la registra en Verifactu (encadenada y con QR) y, si toca, la envía como factura
 * electrónica B2B. Formato: CSV de la plantilla «Access · CSV» de Enlace Fiscal (una fila por línea, «;», coma decimal,
 * fecha DD/MM/AAAA). El fichero se escribe oculto y se renombra para que no se lea a medias.
 *
 * Variables (sensobox_back/.env): ENLACE_FISCAL_CARPETA (vacía = desactivado), ENLACE_FISCAL_SERIE (SB),
 * ENLACE_FISCAL_IVA (21) y FACTURACION_CLIENTES (JSON con NIF por cliente y tarifa por tipo de trabajo; por defecto el de
 * la demo, `clientes-demo.json`).
 */
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'fs';
import { join, resolve } from 'path';

export const CABECERA_EF = 'Serie;NumFactura;Fecha;CIF;Cliente;TotalFactura;Concepto;Unidades;Precio;IVA';

export interface DatosFacturacion { tarifa: Record<string, number>; clientes: Record<string, string> }
export interface OrdenFacturable {
  orderNumber: number; clientName: string; workName: string; workType: string; productionQuantity: number; finalQuantity?: number;
  processingDateFinal?: Date | string | null;
}

export function configEnlaceFiscal(env: NodeJS.ProcessEnv = process.env) {
  return { carpeta: env.ENLACE_FISCAL_CARPETA ? resolve(env.ENLACE_FISCAL_CARPETA) : '', serie: env.ENLACE_FISCAL_SERIE || 'SB', iva: Number(env.ENLACE_FISCAL_IVA || 21),
    clientes: env.FACTURACION_CLIENTES || join(__dirname, 'clientes-demo.json') };
}

export function leerDatosFacturacion(ruta: string): DatosFacturacion {
  if (!existsSync(ruta)) {
    // en dist/ el JSON no se copia: se busca junto al fuente
    const fuente = [ruta.replace(/[\\/]dist[\\/]src[\\/]/, '/src/'), ruta.replace(/[\\/]dist[\\/]/, '/src/')].find((x) => existsSync(x));
    if (!fuente) return { tarifa: {}, clientes: {} };
    ruta = fuente;
  }
  return JSON.parse(readFileSync(ruta, 'utf8'));
}

const dec = (n: number, d = 2) => n.toFixed(d).replace('.', ',');
const esc = (s: string | null | undefined) => {
  const v = (s ?? '').replace(/\r?\n/g, ' ');
  return /[;"]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
};
const r2 = (x: number) => Math.round(x * 100) / 100;

/** Factura de la orden (número = año + número de orden con 6 cifras) o `null` si el cliente no tiene NIF en los datos. */
export function facturaOrdenCsv(o: OrdenFacturable, datos: DatosFacturacion, opts: { serie: string; iva: number; fecha: string }) {
  const nif = datos.clientes[o.clientName];
  if (!nif) return null;
  const unidades = o.finalQuantity && o.finalQuantity > 0 ? o.finalQuantity : o.productionQuantity;
  const precio = datos.tarifa[o.workType] ?? datos.tarifa._defecto ?? 0;
  const numero = `${opts.fecha.slice(0, 4)}-${String(o.orderNumber).padStart(6, '0')}`;
  const base = r2(unidades * precio);
  const total = r2(base + r2((base * opts.iva) / 100));
  const fecha = opts.fecha.slice(0, 10).split('-').reverse().join('/');
  const fila = [esc(opts.serie), esc(numero), fecha, esc(nif), esc(o.clientName), dec(total), esc(`${o.workName} (${o.workType}) · OF ${o.orderNumber}`), dec(unidades, 3), dec(precio, 4), dec(opts.iva)].join(';');
  return { nombre: `${opts.serie}${numero}.csv`, numSerie: `${opts.serie}${numero}`, nif, unidades, precio, total, contenido: `${CABECERA_EF}\r\n${fila}\r\n` };
}

export function dejarEnCarpeta(carpeta: string, nombre: string, contenido: string): string {
  mkdirSync(carpeta, { recursive: true });
  const tmp = join(carpeta, `.${nombre}.part`);
  writeFileSync(tmp, contenido, 'utf8');
  const destino = join(carpeta, nombre);
  renameSync(tmp, destino);
  return destino;
}

/** Factura la orden si la facturación por Enlace Fiscal está activada. Devuelve qué ha hecho (o por qué no). */
export function facturarOrden(o: OrdenFacturable, env: NodeJS.ProcessEnv = process.env, ahora = new Date()) {
  const c = configEnlaceFiscal(env);
  if (!c.carpeta) return { estado: 'desactivada' as const };
  const f = facturaOrdenCsv(o, leerDatosFacturacion(c.clientes), { serie: c.serie, iva: c.iva, fecha: ahora.toISOString().slice(0, 10) });
  if (!f) return { estado: 'sin_datos_fiscales' as const, cliente: o.clientName };
  const fichero = dejarEnCarpeta(c.carpeta, f.nombre, f.contenido);
  return { estado: 'enviada' as const, numSerie: f.numSerie, total: f.total, fichero };
}
