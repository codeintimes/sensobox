// Formatos de número y fecha según el idioma activo (es-ES, en-GB, nl-NL, de-DE, fr-FR).
import { currentLocale } from "../i18n";

export const nf = (n, d = 0) => Number(n || 0).toLocaleString(currentLocale(), { minimumFractionDigits: d, maximumFractionDigits: d });
// Porcentaje con el espacio y el signo que usa cada idioma (es/de/fr/nl: «5,1 %»; en: «5.1%»)
export const pct = (n, d = 1, signed = false) => {
  const v = Number(n || 0);
  const s = (signed && v >= 0 ? "+" : "") + nf(v, d);
  return currentLocale().startsWith("en") ? `${s}%` : `${s} %`;
};
export const fmtDate = (d) => (d ? new Date(d).toLocaleDateString(currentLocale(), { day: "numeric", month: "short" }) : "—");
export const fmtDayMonth = fmtDate;
export const fmtDateTime = (d) => (d ? new Date(d).toLocaleString(currentLocale(), { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "—");
export const fmtWeekdayDateTime = (d) => (d ? new Date(d).toLocaleString(currentLocale(), { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "—");
export const fmtLongDate = (d) => {
  const s = new Date(d).toLocaleDateString(currentLocale(), { weekday: "long", day: "numeric", month: "long" });
  return s.charAt(0).toUpperCase() + s.slice(1);
};
export const fmtNumericDate = (d) => (d ? new Date(d).toLocaleDateString(currentLocale(), { day: "2-digit", month: "2-digit", year: "numeric" }) : "—");
