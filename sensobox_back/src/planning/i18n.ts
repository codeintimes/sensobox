// Planifica · mensajes de error de la API en los seis idiomas de Sensobox (se suman al diccionario general).
import { MESSAGES, Lang } from '../i18n/messages';

const PLANNING: Record<Lang, Record<string, string>> = {
  es: {
    'errors.planning.notFound': 'No se ha encontrado en el plan.',
    'errors.planning.invalidData': 'Faltan datos o no son válidos.',
    'errors.planning.invalidResource': 'La operación no se puede hacer en {{resource}}.',
    'errors.planning.unknownArticle': 'El artículo {{code}} no tiene ruta de fabricación.',
    'errors.planning.integrationKey': 'Clave de integración no válida.',
  },
  en: {
    'errors.planning.notFound': 'Not found in the plan.',
    'errors.planning.invalidData': 'Some data is missing or invalid.',
    'errors.planning.invalidResource': 'This operation cannot run on {{resource}}.',
    'errors.planning.unknownArticle': 'Item {{code}} has no production routing.',
    'errors.planning.integrationKey': 'Invalid integration key.',
  },
  nl: {
    'errors.planning.notFound': 'Niet gevonden in de planning.',
    'errors.planning.invalidData': 'Er ontbreken gegevens of ze zijn ongeldig.',
    'errors.planning.invalidResource': 'Deze bewerking kan niet op {{resource}}.',
    'errors.planning.unknownArticle': 'Artikel {{code}} heeft geen productieroute.',
    'errors.planning.integrationKey': 'Ongeldige integratiesleutel.',
  },
  de: {
    'errors.planning.notFound': 'Im Plan nicht gefunden.',
    'errors.planning.invalidData': 'Daten fehlen oder sind ungültig.',
    'errors.planning.invalidResource': 'Dieser Arbeitsgang ist auf {{resource}} nicht möglich.',
    'errors.planning.unknownArticle': 'Artikel {{code}} hat keinen Arbeitsplan.',
    'errors.planning.integrationKey': 'Ungültiger Integrationsschlüssel.',
  },
  fr: {
    'errors.planning.notFound': 'Introuvable dans le plan.',
    'errors.planning.invalidData': 'Des données manquent ou ne sont pas valides.',
    'errors.planning.invalidResource': 'Cette opération ne peut pas se faire sur {{resource}}.',
    'errors.planning.unknownArticle': "L'article {{code}} n'a pas de gamme de fabrication.",
    'errors.planning.integrationKey': "Clé d'intégration non valide.",
  },
  it: {
    'errors.planning.notFound': 'Non trovato nel piano.',
    'errors.planning.invalidData': 'Mancano dati o non sono validi.',
    'errors.planning.invalidResource': "L'operazione non si può eseguire su {{resource}}.",
    'errors.planning.unknownArticle': "L'articolo {{code}} non ha un ciclo di lavorazione.",
    'errors.planning.integrationKey': 'Chiave di integrazione non valida.',
  },
};

for (const l of Object.keys(PLANNING) as Lang[]) Object.assign(MESSAGES[l], PLANNING[l]);
export const PLANNING_MESSAGES = PLANNING;
