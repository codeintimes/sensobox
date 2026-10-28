// Demo · órdenes de fabricación ya cerradas de Fornival Hornos Industriales (Quart de Poblet), otra empresa que usa
// Sensobox: los hornos que hoy atiende su servicio técnico en Averix (mismos números de serie) y que Planta 3D enseña en
// Cerámicas Millars. Numeración de Sensobox AANNN: «OF-2025-0042» de Averix es la orden 25042.
// Van cerradas (estado 3): no entran en Planifica ni en la facturación de Envases Turia (cada empresa ve las suyas).
import { Lang } from '../../i18n/messages';

type T6 = Record<Lang, string>;
const L = (es: string, en: string, nl: string, de: string, fr: string, it: string): T6 => ({ es, en, nl, de, fr, it });

export const FORNIVAL = { name: 'Fornival Hornos Industriales, S.L.', technician: 'Ximo Peris' };

const MODELOS: Record<string, { name: T6; process: T6; hours: number; kg: number }> = {
  'FT-1200': {
    name: L('Horno túnel de cinta FT-1200', 'FT-1200 belt tunnel oven', 'Bandtunneloven FT-1200', 'Durchlauf-Tunnelofen FT-1200', 'Four tunnel à bande FT-1200', 'Forno a tunnel a nastro FT-1200'),
    process: L('Corte láser + plegado + soldadura TIG + montaje + prueba en caliente', 'Laser cutting + bending + TIG welding + assembly + hot test', 'Lasersnijden + zetten + TIG-lassen + montage + warmtest', 'Laserschneiden + Kanten + WIG-Schweißen + Montage + Warmprobe', 'Découpe laser + pliage + soudure TIG + montage + essai à chaud', 'Taglio laser + piegatura + saldatura TIG + montaggio + prova a caldo'),
    hours: 1450, kg: 9200,
  },
  'FC-10': {
    name: L('Horno de convección de carro FC-10', 'FC-10 rack convection oven', 'Rekoven met convectie FC-10', 'Stikkenofen mit Konvektion FC-10', 'Four à convection à chariot FC-10', 'Forno a convezione a carrello FC-10'),
    process: L('Corte láser + plegado + montaje + prueba en caliente', 'Laser cutting + bending + assembly + hot test', 'Lasersnijden + zetten + montage + warmtest', 'Laserschneiden + Kanten + Montage + Warmprobe', 'Découpe laser + pliage + montage + essai à chaud', 'Taglio laser + piegatura + montaggio + prova a caldo'),
    hours: 210, kg: 1350,
  },
  'FP-4': {
    name: L('Horno de pisos modular FP-4', 'FP-4 modular deck oven', 'Modulaire etageoven FP-4', 'Modularer Etagenofen FP-4', 'Four à soles modulaire FP-4', 'Forno a platea modulare FP-4'),
    process: L('Corte láser + plegado + montaje + prueba en caliente', 'Laser cutting + bending + assembly + hot test', 'Lasersnijden + zetten + montage + warmtest', 'Laserschneiden + Kanten + Montage + Warmprobe', 'Découpe laser + pliage + montage + essai à chaud', 'Taglio laser + piegatura + montaggio + prova a caldo'),
    hours: 260, kg: 1800,
  },
  'FR-2400': {
    name: L('Horno de rodillos para cerámica FR-2400', 'FR-2400 ceramic roller kiln', 'Rollenoven voor keramiek FR-2400', 'Rollenofen für Keramik FR-2400', 'Four à rouleaux pour céramique FR-2400', 'Forno a rulli per ceramica FR-2400'),
    process: L('Calderería + refractario + quemadores + montaje en obra + puesta en marcha', 'Plate work + refractory + burners + site assembly + commissioning', 'Plaatwerk + vuurvast + branders + montage ter plaatse + inbedrijfstelling', 'Blechbau + Feuerfest + Brenner + Montage vor Ort + Inbetriebnahme', 'Chaudronnerie + réfractaire + brûleurs + montage sur site + mise en service', 'Carpenteria + refrattario + bruciatori + montaggio in loco + avviamento'),
    hours: 5200, kg: 86000,
  },
  'FS-600': {
    name: L('Secadero vertical FS-600', 'FS-600 vertical dryer', 'Verticale droger FS-600', 'Vertikaltrockner FS-600', 'Séchoir vertical FS-600', 'Essiccatoio verticale FS-600'),
    process: L('Calderería + montaje en obra + puesta en marcha', 'Plate work + site assembly + commissioning', 'Plaatwerk + montage ter plaatse + inbedrijfstelling', 'Blechbau + Montage vor Ort + Inbetriebnahme', 'Chaudronnerie + montage sur site + mise en service', 'Carpenteria + montaggio in loco + avviamento'),
    hours: 1900, kg: 24000,
  },
};

const SERIE = L('nº de serie', 'serial no.', 'serienr.', 'Seriennr.', 'nº de série', 'matricola');
const ACABADO = L('Acero inoxidable AISI 304', 'AISI 304 stainless steel', 'RVS AISI 304', 'Edelstahl AISI 304', 'Inox AISI 304', 'Acciaio inox AISI 304');
const TIPO = L('Fabricación a medida', 'Built to order', 'Maatwerk', 'Auftragsfertigung', 'Fabrication sur mesure', 'Produzione su commessa');

// [orden AANNN, serie, modelo, cliente, inicio, fin] — los mismos hornos que el parque de Averix
export const FORNIVAL_ORDERS: [number, string, string, string, string, string][] = [
  [22018, 'FT1200-22-0112', 'FT-1200', 'Bäckerei Hofmann GmbH', '2022-01-24', '2022-03-14'],
  [22094, 'FR2400-22-0016', 'FR-2400', 'Cerámicas Millars, S.A.', '2022-06-13', '2022-10-03'],
  [23047, 'FS600-23-0034', 'FS-600', 'Cerámicas Millars, S.A.', '2023-04-17', '2023-06-12'],
  [23061, 'FC10-23-0244', 'FC-10', 'Boulangerie Industrielle Lefèvre SAS', '2023-05-15', '2023-06-02'],
  [23088, 'FT1200-23-0128', 'FT-1200', 'Forn de Pa Ribera, S.L.', '2023-07-17', '2023-09-04'],
  [24012, 'FP4-24-0101', 'FP-4', 'Forn de Pa Ribera, S.L.', '2024-02-19', '2024-03-11'],
  [25042, 'FT1200-24-0187', 'FT-1200', 'Boulangerie Industrielle Lefèvre SAS', '2024-11-25', '2025-01-20'],
  [25067, 'FT1200-25-0203', 'FT-1200', 'Panificio Ferraro S.r.l.', '2025-04-14', '2025-06-10'],
];

/** Documentos de orden (cerrada) de los hornos de Fornival en el idioma de la demo. */
export function fornivalOrderDocs(lang: Lang) {
  return FORNIVAL_ORDERS.map(([orderNumber, serie, modelo, cliente, inicio, fin]) => {
    const m = MODELOS[modelo];
    return {
      orderNumber, clientName: cliente, companyName: FORNIVAL.name, workName: `${m.name[lang]} · ${SERIE[lang]} ${serie}`, workType: TIPO[lang],
      productionQuantity: 1, initialQuantity: 1, finalQuantity: 1, quantityProcessed: 1, finalQuantityDifference: 0, quantityRate: 100,
      colors: ACABADO[lang], processes: m.process[lang], specialFinishes: serie, technician: FORNIVAL.technician,
      processingDateInitial: new Date(`${inicio}T07:00:00Z`), processingDate: new Date(`${fin}T15:00:00Z`), processingDateFinal: new Date(`${fin}T15:00:00Z`),
      processingTime: m.hours, processingTimeFinal: m.hours, processingTimeDifference: 0, processingTimeRate: 100, materialWeight: m.kg, materialArea: 0, status: 3,
    };
  });
}
