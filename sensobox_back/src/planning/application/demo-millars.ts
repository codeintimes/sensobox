// Planifica · demo de Cerámicas Millars, S.A. (Vila-real): la línea CAS-1 de porcelánico que enseñan Planta 3D y Atisba
// (prensa PR-01 → esmaltado ES-01 → horno de rodillos HR-01 → clasificadora CL-01). Sus recursos llevan `company`: solo los
// ve Millars (los recursos sin empresa son de la empresa principal de la demo, Envases Turia). Las OF 261182…261184 son
// las OF-26-1182…1184 de Atisba y Lotea (lotes L26-<día>-C/B/A); la 261184 está en el horno ahora.
import { Lang } from '../../i18n/messages';

type T6 = Record<Lang, string>;
const L = (es: string, en: string, nl: string, de: string, fr: string, it: string): T6 => ({ es, en, nl, de, fr, it });

export const MILLARS = { name: 'Cerámicas Millars, S.A.', technician: 'Vicent Arnau Gil' };
/** Usuarios de Millars en Sensobox (misma clave que la demo): la administradora ve solo su Planifica y sus órdenes. */
export const MILLARS_USERS = [
  { email: 'marta.climent@ceramicasmillars.es', name: 'Marta Climent Bou', role: 'admin', phone: '+34 964 520 114' },
  { email: 'vicent.arnau@ceramicasmillars.es', name: 'Vicent Arnau Gil', role: 'technician', phone: '+34 964 520 131' },
];
export const MILLARS_CAL = 'CER24';

const LINE = L('CAS-1 · Porcelánico rectificado', 'CAS-1 · Rectified porcelain', 'CAS-1 · Gerectificeerd porselein', 'CAS-1 · Rektifiziertes Feinsteinzeug', 'CAS-1 · Grès cérame rectifié', 'CAS-1 · Gres porcellanato rettificato');
const CAL_NAME = L('Horno continuo · 24 h, 7 días', 'Continuous kiln · 24 h, 7 days', 'Continue oven · 24 u, 7 dagen', 'Durchlaufofen · 24 h, 7 Tage', 'Four continu · 24 h, 7 jours', 'Forno continuo · 24 h, 7 giorni');
const SHIFTS = { M: L('Mañana', 'Morning', 'Ochtend', 'Früh', 'Matin', 'Mattino'), T: L('Tarde', 'Afternoon', 'Middag', 'Spät', 'Après-midi', 'Pomeriggio'), N: L('Noche', 'Night', 'Nacht', 'Nacht', 'Nuit', 'Notte') };

const RES: { code: string; name: T6; eff: number }[] = [
  { code: 'PR-01', name: L('Prensa PH-3200 · 4.800 t', 'PH-3200 press · 4,800 t', 'Pers PH-3200 · 4.800 t', 'Presse PH-3200 · 4.800 t', 'Presse PH-3200 · 4 800 t', 'Pressa PH-3200 · 4.800 t'), eff: 0.9 },
  { code: 'ES-01', name: L('Línea de esmaltado ES-01', 'ES-01 glazing line', 'Glazuurlijn ES-01', 'Glasierlinie ES-01', 'Ligne d’émaillage ES-01', 'Linea di smaltatura ES-01'), eff: 0.9 },
  { code: 'HR-01', name: L('Horno de rodillos HR-01 · FR-2400', 'HR-01 roller kiln · FR-2400', 'Rollenoven HR-01 · FR-2400', 'Rollenofen HR-01 · FR-2400', 'Four à rouleaux HR-01 · FR-2400', 'Forno a rulli HR-01 · FR-2400'), eff: 0.88 },
  { code: 'CL-01', name: L('Clasificadora CL-01', 'CL-01 sorting line', 'Sorteerlijn CL-01', 'Sortieranlage CL-01', 'Trieuse CL-01', 'Selezionatrice CL-01'), eff: 0.92 },
];
const STEPS: { res: string; name: T6; setup: number }[] = [
  { res: 'PR-01', name: L('Prensado', 'Pressing', 'Persen', 'Pressen', 'Pressage', 'Pressatura'), setup: 45 },
  { res: 'ES-01', name: L('Esmaltado e impresión digital', 'Glazing and digital printing', 'Glazuren en digitaal printen', 'Glasieren und Digitaldruck', 'Émaillage et impression numérique', 'Smaltatura e stampa digitale'), setup: 30 },
  { res: 'HR-01', name: L('Cocción', 'Firing', 'Bakken', 'Brennen', 'Cuisson', 'Cottura'), setup: 60 },
  { res: 'CL-01', name: L('Clasificación y paletizado', 'Sorting and palletising', 'Sorteren en palletiseren', 'Sortieren und Palettieren', 'Tri et palettisation', 'Selezione e pallettizzazione'), setup: 15 },
];
// piezas por hora en la línea (la de Atisba: 12 piezas/min de 60×60)
export const MILLARS_ARTICLES: Record<string, { name: T6; rate: number; finish: T6 }> = {
  'POR-6060': { name: L('Porcelánico Calacatta 60×60 rectificado', 'Calacatta porcelain 60×60 rectified', 'Porselein Calacatta 60×60 gerectificeerd', 'Feinsteinzeug Calacatta 60×60 rektifiziert', 'Grès cérame Calacatta 60×60 rectifié', 'Gres porcellanato Calacatta 60×60 rettificato'), rate: 720,
    finish: L('Mate · tono 02', 'Matt · shade 02', 'Mat · tint 02', 'Matt · Ton 02', 'Mat · nuance 02', 'Opaco · tono 02') },
  'POR-3060': { name: L('Porcelánico Calacatta 30×60 rectificado', 'Calacatta porcelain 30×60 rectified', 'Porselein Calacatta 30×60 gerectificeerd', 'Feinsteinzeug Calacatta 30×60 rektifiziert', 'Grès cérame Calacatta 30×60 rectifié', 'Gres porcellanato Calacatta 30×60 rettificato'), rate: 1380,
    finish: L('Pulido · tono 01', 'Polished · shade 01', 'Gepolijst · tint 01', 'Poliert · Ton 01', 'Poli · nuance 01', 'Lucido · tono 01') },
  'POR-60120': { name: L('Porcelánico Statuario 60×120 rectificado', 'Statuario porcelain 60×120 rectified', 'Porselein Statuario 60×120 gerectificeerd', 'Feinsteinzeug Statuario 60×120 rektifiziert', 'Grès cérame Statuario 60×120 rectifié', 'Gres porcellanato Statuario 60×120 rettificato'), rate: 340,
    finish: L('Mate · tono 04', 'Matt · shade 04', 'Mat · tint 04', 'Matt · Ton 04', 'Mat · nuance 04', 'Opaco · tono 04') },
};
const WORK_TYPE = L('Producción de serie', 'Series production', 'Serieproductie', 'Serienfertigung', 'Production en série', 'Produzione di serie');

/** Número de Sensobox de la OF que está en el horno (OF-26-1184 en Atisba y Lotea). */
export const MILLARS_RUNNING = 261184;
// [número, artículo, piezas, cliente, entrega (h desde ahora), prioridad] · abiertas; la primera está en marcha (lleva 3 h en el horno)
export const MILLARS_OPEN: [number, string, number, string, number, number][] = [
  [261184, 'POR-6060', 5184, 'Baumarkt Keller GmbH', 14, 2],
  [261185, 'POR-6060', 6200, 'Habitat Cerámica Distribución, S.L.', 40, 3],
  [261186, 'POR-3060', 9600, 'Grupo Interiorismo Levante, S.L.', 60, 3],
  [261187, 'POR-60120', 1800, 'Baumarkt Keller GmbH', 96, 3],
  [261188, 'POR-6060', 7000, 'Grupo Interiorismo Levante, S.L.', 130, 3],
];
// cerradas hoy y ayer (las de los lotes L26-<día>-C y B)
export const MILLARS_CLOSED: [number, string, number, string, number][] = [
  [261182, 'POR-6060', 5184, 'Grupo Interiorismo Levante, S.L.', 19],
  [261183, 'POR-6060', 5184, 'Habitat Cerámica Distribución, S.L.', 11],
];

export function millarsResources(lang: Lang) {
  return RES.map((r, i) => ({ code: r.code, name: r.name[lang], kind: 'maquina', line: LINE[lang], calendarCode: MILLARS_CAL, efficiency: r.eff, ritmia: true, sort: 20 + i, company: MILLARS.name }));
}

export function millarsCalendar(lang: Lang) {
  const all = [1, 2, 3, 4, 5, 6, 7];
  return { code: MILLARS_CAL, name: CAL_NAME[lang], company: MILLARS.name, holidays: [],
    shifts: [{ name: SHIFTS.M[lang], start: '06:00', end: '14:00', days: all }, { name: SHIFTS.T[lang], start: '14:00', end: '22:00', days: all }, { name: SHIFTS.N[lang], start: '22:00', end: '06:00', days: all }] };
}

export function millarsArticles(lang: Lang) {
  return Object.entries(MILLARS_ARTICLES).map(([code, a]) => ({
    code, name: a.name[lang], company: MILLARS.name,
    route: STEPS.map((s, i) => ({ seq: (i + 1) * 10, name: s.name[lang], resources: [s.res], setupMin: s.setup, ratePerHour: a.rate })),
  }));
}

/** Documento de orden de Sensobox de Millars (abierta o cerrada). */
export function millarsOrderDoc(lang: Lang, orderNumber: number, code: string, qty: number, clientName: string, due: Date, status: number, start?: Date) {
  const a = MILLARS_ARTICLES[code];
  const hours = Math.round(STEPS.reduce((s, x) => s + x.setup / 60 + qty / a.rate, 0) * 10) / 10;
  const closed = status === 3;
  return {
    orderNumber, clientName, companyName: MILLARS.name, workName: a.name[lang], workType: WORK_TYPE[lang], productionQuantity: qty, initialQuantity: qty,
    colors: a.finish[lang], processes: STEPS.map((s) => s.name[lang]).join(' + '), specialFinishes: LINE[lang], technician: MILLARS.technician,
    processingDate: due, processingTime: hours, status, quantityProcessed: closed ? qty : 0,
    ...(start ? { processingDateInitial: start } : {}),
    ...(closed ? { finalQuantity: Math.round(qty * 0.975), quantityRate: 97.5, processingDateFinal: due, processingTimeFinal: hours } : {}),
  };
}
