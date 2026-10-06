// PDF con el resumen de una orden, en el idioma de la petición (es, en, nl, de, fr):
// etiquetas, estado, fechas y números con el formato de cada idioma.
import { Injectable, NotFoundException } from '@nestjs/common';
import { ICommandHandler, CommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as PDFDocument from 'pdfkit';
import { GeneratePdfCommand } from '../commands/generate-pdf.command';
import { IOrder } from '../../domain/schemas/order.schema';
import { fmtDateTime, fmtNumber, fmtPercent, t, tr } from '../../../i18n/i18n';

const INDIGO = '#4F46E5';
const TEXT = '#111827';
const MUTED = '#6B7280';
const LINE = '#E5E7EB';

@CommandHandler(GeneratePdfCommand)
@Injectable()
export class GeneratePdfHandler implements ICommandHandler<GeneratePdfCommand> {
  constructor(@InjectModel('Order') private readonly orderModel: Model<IOrder>) {}

  async execute(command: GeneratePdfCommand): Promise<Buffer> {
    const lang = command.lang || 'es';
    const order = await this.orderModel.findById(command.orderId).exec().catch(() => null);
    if (!order) throw new NotFoundException(tr('errors.orderNotFound', { id: command.orderId }));
    const o: any = order.toObject();
    const L = (k: string) => t(lang, `pdf.f.${k}`);
    const num = (n: number, d = 0) => (n === undefined || n === null ? '—' : fmtNumber(lang, n, d));
    const units = (n: number) => (n === undefined || n === null ? '—' : `${num(n)} ${t(lang, 'pdf.unit.units')}`);
    const hours = (n: number) => (n === undefined || n === null ? '—' : `${num(n, Number.isInteger(n) ? 0 : 1)} ${t(lang, 'pdf.unit.hours')}`);
    const scrap = o.initialQuantity && o.finalQuantity ? fmtPercent(lang, ((o.initialQuantity - o.finalQuantity) / o.initialQuantity) * 100) : '—';

    const sections: [string, [string, string][]][] = [
      [t(lang, 'pdf.section.order'), [
        [L('clientName'), o.clientName], [L('companyName'), o.companyName], [L('workName'), o.workName], [L('workType'), o.workType],
        [L('technician'), o.technician], [L('status'), t(lang, `pdf.status.${o.status || 1}`)],
        [L('colors'), o.colors], [L('processes'), o.processes], [L('specialFinishes'), o.specialFinishes], [L('palletsNumber'), num(o.palletsNumber)],
      ]],
      [t(lang, 'pdf.section.production'), [
        [L('productionQuantity'), units(o.productionQuantity)], [L('quantityProcessed'), units(o.quantityProcessed)],
        [L('initialQuantity'), units(o.initialQuantity)], [L('finalQuantity'), units(o.finalQuantity)], [L('scrap'), scrap],
        [L('processingDate'), fmtDateTime(lang, o.processingDate)], [L('processingDateInitial'), fmtDateTime(lang, o.processingDateInitial)],
        [L('processingDateFinal'), fmtDateTime(lang, o.processingDateFinal)], [L('processingTime'), hours(o.processingTime)],
        [L('processingTimeFinal'), hours(o.processingTimeFinal)],
      ]],
      [t(lang, 'pdf.section.material'), [
        [L('materialArea'), o.materialArea ? `${num(o.materialArea, 1)} m²` : '—'], [L('materialWeight'), o.materialWeight ? `${num(o.materialWeight, 1)} kg` : '—'],
      ]],
    ];

    return new Promise<Buffer>((resolve, reject) => {
      const doc = new PDFDocument({ size: 'A4', margin: 50, info: { Title: `${t(lang, 'pdf.title')} · ${t(lang, 'pdf.order', { n: o.orderNumber })}` } });
      const buffers: Buffer[] = [];
      doc.on('data', (d) => buffers.push(d));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      const W = doc.page.width;
      // Cabecera: marca y título
      doc.rect(0, 0, W, 96).fill(INDIGO);
      doc.roundedRect(50, 30, 34, 34, 8).fill('#FFFFFF');
      doc.polygon([67, 37], [77, 43], [77, 54], [67, 60], [57, 54], [57, 43]).lineWidth(2).stroke(INDIGO);
      doc.fillColor('#FFFFFF').font('Helvetica-Bold').fontSize(20).text('Sensobox', 94, 37);
      doc.font('Helvetica').fontSize(10).fillColor('#E0E7FF').text(t(lang, 'pdf.generated', { date: fmtDateTime(lang, new Date()) }), 94, 62);

      doc.fillColor(MUTED).font('Helvetica').fontSize(11).text(t(lang, 'pdf.title'), 50, 122);
      doc.fillColor(TEXT).font('Helvetica-Bold').fontSize(22).text(t(lang, 'pdf.order', { n: o.orderNumber }), 50, 138);
      doc.font('Helvetica').fontSize(12).fillColor(TEXT).text(`${o.workName || ''} · ${o.clientName || ''}`, 50, 168, { width: W - 100 });

      let y = 204;
      const colW = (W - 100) / 2;
      for (const [title, rows] of sections) {
        doc.fillColor(INDIGO).font('Helvetica-Bold').fontSize(11).text(title.toUpperCase(), 50, y, { characterSpacing: 0.8 });
        y += 18;
        doc.moveTo(50, y).lineTo(W - 50, y).lineWidth(0.8).stroke(LINE);
        y += 8;
        rows.forEach(([label, value], i) => {
          const x = 50 + (i % 2) * colW;
          if (i % 2 === 0 && i > 0) y += 34;
          doc.fillColor(MUTED).font('Helvetica').fontSize(9).text(label, x, y, { width: colW - 12 });
          doc.fillColor(TEXT).font('Helvetica-Bold').fontSize(11.5).text(value === undefined || value === null || value === '' ? '—' : String(value), x, y + 12, { width: colW - 12, ellipsis: true, height: 16 });
        });
        y += 52;
      }
      doc.end();
    });
  }
}
