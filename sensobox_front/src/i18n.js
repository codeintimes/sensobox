// Traducciones de Sensobox: español (por defecto), inglés, neerlandés, alemán, francés e italiano.
// El idioma se elige así: el que el usuario escogió en el selector (guardado en localStorage),
// si no, el del navegador, y si no es uno de los seis, español.
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import axios from "axios";
import es from "./locales/es.json";
import en from "./locales/en.json";
import nl from "./locales/nl.json";
import de from "./locales/de.json";
import fr from "./locales/fr.json";
import it from "./locales/it.json";

export const LANGUAGES = [
  { code: "es", label: "Español", locale: "es-ES" }, // i18n-ignore (nombre del idioma en su lengua)
  { code: "en", label: "English", locale: "en-GB" }, // i18n-ignore (nombre del idioma en su lengua)
  { code: "nl", label: "Nederlands", locale: "nl-NL" }, // i18n-ignore (nombre del idioma en su lengua)
  { code: "de", label: "Deutsch", locale: "de-DE" }, // i18n-ignore (nombre del idioma en su lengua)
  { code: "fr", label: "Français", locale: "fr-FR" }, // i18n-ignore (nombre del idioma en su lengua)
  { code: "it", label: "Italiano", locale: "it-IT" }, // i18n-ignore (nombre del idioma en su lengua)
];
export const LANG_STORAGE_KEY = "sensobox.lang";

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: { es: { translation: es }, en: { translation: en }, nl: { translation: nl }, de: { translation: de }, fr: { translation: fr }, it: { translation: it } },
    supportedLngs: LANGUAGES.map((l) => l.code),
    nonExplicitSupportedLngs: true,
    load: "languageOnly",
    fallbackLng: "es",
    interpolation: { escapeValue: false },
    detection: { order: ["localStorage", "navigator"], lookupLocalStorage: LANG_STORAGE_KEY, caches: ["localStorage"] },
    react: { useSuspense: false },
  });

// Idioma activo normalizado a uno de los seis («de-AT» → «de»)
export const currentLang = () => {
  const l = (i18n.resolvedLanguage || i18n.language || "es").slice(0, 2);
  return LANGUAGES.some((x) => x.code === l) ? l : "es";
};
export const currentLocale = () => LANGUAGES.find((x) => x.code === currentLang()).locale;

const apply = () => {
  document.documentElement.lang = currentLang();
  // El backend traduce errores y PDF según esta cabecera
  axios.defaults.headers.common["Accept-Language"] = currentLang();
};
apply();
i18n.on("languageChanged", apply);

export default i18n;
