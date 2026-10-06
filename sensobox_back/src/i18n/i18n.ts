import { LANGS, LOCALES, Lang, MESSAGES } from './messages';

export { Lang, LANGS, LOCALES };

// Idioma a partir de la cabecera Accept-Language («de-DE,de;q=0.9,en;q=0.8» → «de»). Por defecto, español.
export function resolveLang(header?: string | string[]): Lang {
  const value = Array.isArray(header) ? header[0] : header;
  if (!value) return 'es';
  const ranked = value
    .split(',')
    .map((part) => {
      const [tag, q] = part.trim().split(';q=');
      return { lang: tag.slice(0, 2).toLowerCase(), q: q ? Number(q) : 1 };
    })
    .sort((a, b) => b.q - a.q);
  const hit = ranked.find((r) => (LANGS as string[]).includes(r.lang));
  return (hit ? hit.lang : 'es') as Lang;
}

export function t(lang: Lang, key: string, params: Record<string, unknown> = {}): string {
  const text = MESSAGES[lang]?.[key] ?? MESSAGES.es[key] ?? key;
  return text.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, k) => (params[k] === undefined ? '' : String(params[k])));
}

// Cuerpo de una excepción traducible: el filtro global lo traduce al idioma de la petición.
// El campo «message» lleva el texto en español por si alguien lo lee sin pasar por el filtro.
export function tr(key: string, params: Record<string, unknown> = {}) {
  return { messageKey: key, params, message: t('es', key, params) };
}

export const fmtNumber = (lang: Lang, n: number, digits = 0) =>
  Number(n || 0).toLocaleString(LOCALES[lang], { minimumFractionDigits: digits, maximumFractionDigits: digits });

export const fmtDateTime = (lang: Lang, d?: Date | string | null) =>
  d ? new Date(d).toLocaleString(LOCALES[lang], { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Madrid' }) : '—';

export const fmtPercent = (lang: Lang, n: number, digits = 1) =>
  lang === 'en' || lang === 'it' ? `${fmtNumber(lang, n, digits)}%` : `${fmtNumber(lang, n, digits)} %`;
