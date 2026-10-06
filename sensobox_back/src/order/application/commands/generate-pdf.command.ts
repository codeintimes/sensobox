// generate-pdf.command.ts
import { Lang } from '../../../i18n/i18n';

export class GeneratePdfCommand {
  constructor(public readonly orderId: string, public readonly lang: Lang = 'es') {}
}
