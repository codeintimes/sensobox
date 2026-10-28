// Planifica · datos de demostración: Envases Turia, S.L. (Paterna), inyección de plástico, 8 inyectoras
// (las mismas que mide Ritmia) y un puesto de montaje de asas. Textos en los seis idiomas de Sensobox.
import { Lang } from '../../i18n/messages';

type T6 = Record<Lang, string>;
const L = (es: string, en: string, nl: string, de: string, fr: string, it: string): T6 => ({ es, en, nl, de, fr, it });

const INJ = L('Inyectora', 'Injection moulder', 'Spuitgietmachine', 'Spritzgießmaschine', 'Presse à injecter', 'Pressa a iniezione');
const LINE_A = L('Línea A · Tapones y tarrinas', 'Line A · Caps and tubs', 'Lijn A · Doppen en bakjes', 'Linie A · Verschlüsse und Becher', 'Ligne A · Bouchons et pots', 'Linea A · Tappi e vaschette');
const LINE_B = L('Línea B · Cubos y botes', 'Line B · Pails and jars', 'Lijn B · Emmers en potten', 'Linie B · Eimer und Dosen', 'Ligne B · Seaux et flacons', 'Linea B · Secchi e barattoli');
const ASSEMBLY = L('Montaje de asas', 'Handle assembly', 'Hengselmontage', 'Bügelmontage', 'Montage des anses', 'Montaggio manici');
const STEP_INJ = L('Inyección', 'Injection moulding', 'Spuitgieten', 'Spritzgießen', 'Injection', 'Stampaggio');
const STEP_ASM = L('Montaje de asa', 'Handle fitting', 'Hengsel monteren', 'Bügel montieren', "Pose de l'anse", 'Montaggio manico');
const NO_FINISH = L('Sin acabado especial', 'No special finish', 'Geen speciale afwerking', 'Ohne Sonderveredelung', 'Sans finition spéciale', 'Nessuna finitura speciale');

export const CAL = {
  C24: { name: L('3 turnos · lunes a domingo', '3 shifts · Monday to Sunday', '3 ploegen · maandag t/m zondag', '3 Schichten · Montag bis Sonntag', '3 équipes · lundi au dimanche', '3 turni · lunedì-domenica') },
  C5S: { name: L('3 turnos · lunes a viernes y sábado mañana', '3 shifts · Mon–Fri and Saturday morning', '3 ploegen · ma–vr en zaterdagochtend', '3 Schichten · Mo–Fr und Samstagfrüh', '3 équipes · lun–ven et samedi matin', '3 turni · lun–ven e sabato mattina') },
  C2T: { name: L('2 turnos · lunes a viernes', '2 shifts · Monday to Friday', '2 ploegen · maandag t/m vrijdag', '2 Schichten · Montag bis Freitag', '2 équipes · lundi au vendredi', '2 turni · lunedì-venerdì') },
};
export const SHIFT_NAMES = {
  M: L('Mañana', 'Morning', 'Ochtend', 'Früh', 'Matin', 'Mattino'),
  T: L('Tarde', 'Afternoon', 'Middag', 'Spät', 'Après-midi', 'Pomeriggio'),
  N: L('Noche', 'Night', 'Nacht', 'Nacht', 'Nuit', 'Notte'),
};

export const ARTICLES: Record<string, { name: T6; route: { res: string[]; setup: number; rate: number; step: 'inj' | 'asm' }[]; color: T6 }> = {
  'TAP-38': { name: L('Tapón rosca 38 mm PP', '38 mm PP screw cap', 'Schroefdop 38 mm PP', 'Schraubverschluss 38 mm PP', 'Bouchon à vis 38 mm PP', 'Tappo a vite 38 mm PP'), route: [{ res: ['INY-01', 'INY-02'], setup: 40, rate: 7200, step: 'inj' }], color: L('Blanco', 'White', 'Wit', 'Weiß', 'Blanc', 'Bianco') },
  'TAP-83': { name: L('Tapa abre-fácil 83 mm', '83 mm easy-open lid', 'Easy-open deksel 83 mm', 'Aufreißdeckel 83 mm', 'Couvercle à ouverture facile 83 mm', 'Coperchio a strappo 83 mm'), route: [{ res: ['INY-02', 'INY-01'], setup: 45, rate: 5760, step: 'inj' }], color: L('Natural', 'Natural', 'Naturel', 'Natur', 'Naturel', 'Naturale') },
  'TAR-500': { name: L('Tarrina 500 ml PP transparente', '500 ml clear PP tub', 'Bakje 500 ml PP transparant', 'Becher 500 ml PP transparent', 'Pot 500 ml PP transparent', 'Vaschetta 500 ml PP trasparente'), route: [{ res: ['INY-03', 'INY-04'], setup: 50, rate: 1920, step: 'inj' }], color: L('Transparente', 'Clear', 'Transparant', 'Transparent', 'Transparent', 'Trasparente') },
  'TAR-250': { name: L('Tarrina 250 ml PP blanca', '250 ml white PP tub', 'Bakje 250 ml PP wit', 'Becher 250 ml PP weiß', 'Pot 250 ml PP blanc', 'Vaschetta 250 ml PP bianca'), route: [{ res: ['INY-04', 'INY-03'], setup: 50, rate: 2400, step: 'inj' }], color: L('Blanco', 'White', 'Wit', 'Weiß', 'Blanc', 'Bianco') },
  'CUB-5L': { name: L('Cubo 5 L con asa metálica', '5 L pail with metal handle', 'Emmer 5 L met metalen hengsel', 'Eimer 5 L mit Metallbügel', 'Seau 5 L anse métallique', 'Secchio 5 L con manico metallico'), route: [{ res: ['INY-05'], setup: 60, rate: 180, step: 'inj' }, { res: ['MON-01'], setup: 15, rate: 400, step: 'asm' }], color: L('Azul', 'Blue', 'Blauw', 'Blau', 'Bleu', 'Blu') },
  'CUB-10L': { name: L('Cubo 10 L apilable', '10 L stackable pail', 'Stapelbare emmer 10 L', 'Eimer 10 L stapelbar', 'Seau 10 L empilable', 'Secchio 10 L impilabile'), route: [{ res: ['INY-06'], setup: 60, rate: 144, step: 'inj' }, { res: ['MON-01'], setup: 15, rate: 350, step: 'asm' }], color: L('Blanco', 'White', 'Wit', 'Weiß', 'Blanc', 'Bianco') },
  'BOT-1L': { name: L('Bote 1 L HDPE', '1 L HDPE jar', 'Pot 1 L HDPE', 'Dose 1 L HDPE', 'Flacon 1 L PEHD', 'Barattolo 1 L HDPE'), route: [{ res: ['INY-07'], setup: 45, rate: 600, step: 'inj' }], color: L('Natural', 'Natural', 'Naturel', 'Natur', 'Naturel', 'Naturale') },
  'TAP-CUB': { name: L('Tapa para cubo 5 L', 'Lid for 5 L pail', 'Deksel voor emmer 5 L', 'Deckel für 5-L-Eimer', 'Couvercle pour seau 5 L', 'Coperchio per secchio 5 L'), route: [{ res: ['INY-08', 'INY-05'], setup: 40, rate: 360, step: 'inj' }], color: L('Azul', 'Blue', 'Blauw', 'Blau', 'Bleu', 'Blu') },
};

export function demoResources(lang: Lang) {
  const inj = (n: number, tons: number, line: T6, cal: string, eff: number) => ({
    code: `INY-0${n}`, name: `${INJ[lang]} ${String(n).padStart(2, '0')} · ${tons} t`, kind: 'maquina', line: line[lang], calendarCode: cal, efficiency: eff, ritmia: true, sort: n,
  });
  return [
    inj(1, 250, LINE_A, 'C24', 0.88), inj(2, 250, LINE_A, 'C24', 0.86), inj(3, 350, LINE_A, 'C24', 0.8), inj(4, 350, LINE_A, 'C24', 0.85),
    inj(5, 450, LINE_B, 'C24', 0.85), inj(6, 650, LINE_B, 'C24', 0.72), inj(7, 450, LINE_B, 'C24', 0.84), inj(8, 300, LINE_B, 'C24', 0.8),
    { code: 'MON-01', name: ASSEMBLY[lang], kind: 'puesto', line: LINE_B[lang], calendarCode: 'C2T', efficiency: 0.9, ritmia: false, sort: 9 },
  ];
}

export function demoCalendars(lang: Lang) {
  const all = [1, 2, 3, 4, 5, 6, 7];
  const wk = [1, 2, 3, 4, 5];
  const holidays = ['2026-12-08', '2026-12-25', '2027-01-01', '2027-01-06'];
  const s = (k: 'M' | 'T' | 'N', start: string, end: string, days: number[]) => ({ name: SHIFT_NAMES[k][lang], start, end, days });
  return [
    { code: 'C24', name: CAL.C24.name[lang], shifts: [s('M', '06:00', '14:00', all), s('T', '14:00', '22:00', all), s('N', '22:00', '06:00', all)], holidays: [] },
    { code: 'C5S', name: CAL.C5S.name[lang], shifts: [s('M', '06:00', '14:00', [...wk, 6]), s('T', '14:00', '22:00', wk), s('N', '22:00', '06:00', [1, 2, 3, 4])], holidays },
    { code: 'C2T', name: CAL.C2T.name[lang], shifts: [s('M', '06:00', '14:00', wk), s('T', '14:00', '22:00', wk)], holidays },
  ];
}

export function demoArticles(lang: Lang) {
  return Object.entries(ARTICLES).map(([code, a]) => ({
    code,
    name: a.name[lang],
    route: a.route.map((r, i) => ({ seq: (i + 1) * 10, name: (r.step === 'inj' ? STEP_INJ : STEP_ASM)[lang], resources: r.res, setupMin: r.setup, ratePerHour: r.rate })),
  }));
}

export const CLIENTS = ['Conservas Ribera, S.A.', 'Lácteos La Safor, S.L.', 'Pinturas Levante, S.L.', 'Droguería Turia, S.L.', 'Helados Albufera, S.L.', 'Químicas del Camp, S.A.'];

/** Número de Sensobox de la primera orden de la demo (OF-26001): Lotea y Planta 3D tienen los lotes de 26001… */
export const DEMO_FIRST_ORDER = 26001;

// [artículo, cantidad, entrega (horas desde ahora), prioridad, estado Sensobox (1 pendiente, 2 en proceso), horas que lleva en marcha]
export const DEMO_ORDERS: [string, number, number, number, number, number][] = [
  ['TAP-38', 160000, 30, 3, 2, 6], ['TAP-38', 120000, 70, 3, 1, 0], ['TAP-83', 90000, 40, 3, 2, 4], ['TAP-83', 110000, 96, 3, 1, 0],
  ['TAR-500', 60000, 30, 3, 2, 5], ['TAR-500', 45000, 120, 3, 1, 0], ['TAR-250', 70000, 28, 3, 2, 3], ['TAR-250', 50000, 110, 3, 1, 0],
  ['CUB-5L', 5000, 52, 3, 2, 8], ['CUB-5L', 6000, 140, 3, 1, 0], ['CUB-10L', 3000, 46, 2, 2, 7], ['CUB-10L', 2500, 160, 3, 1, 0],
  ['BOT-1L', 14000, 36, 3, 2, 9], ['BOT-1L', 12000, 100, 3, 1, 0], ['TAP-CUB', 8000, 34, 3, 2, 5], ['TAP-CUB', 9000, 90, 3, 1, 0],
  ['TAP-38', 200000, 170, 3, 1, 0], ['TAR-500', 30000, 80, 2, 1, 0],
];

export const demoText = { workType: STEP_INJ, noFinish: NO_FINISH, assembly: STEP_ASM };
