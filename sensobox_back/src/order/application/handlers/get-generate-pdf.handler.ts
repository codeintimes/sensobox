import { join } from 'path';
import { Injectable } from '@nestjs/common';
import { ICommandHandler, CommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as PDFDocument from 'pdfkit';
import { GeneratePdfCommand } from '../commands/generate-pdf.command';
import { IOrder } from '../../domain/schemas/order.schema';
import { readFileSync } from 'fs';

const loadTheme = () => {
    const themePath = join(__dirname, '../../../assets/theme.json');
    const themeJSON = readFileSync(themePath, 'utf8');
    return JSON.parse(themeJSON);
};

@CommandHandler(GeneratePdfCommand)
@Injectable()
export class GeneratePdfHandler implements ICommandHandler<GeneratePdfCommand> {
    constructor(
        @InjectModel('Order') private readonly orderModel: Model<IOrder>
    ) {}

    async execute(command: GeneratePdfCommand): Promise<Buffer> {
        return new Promise<Buffer>((resolve, reject) => {
            this.orderModel.findById(command.orderId).exec()
                .then((order) => {
                    if (!order) {
                        reject(new Error('Order not found'));
                        return;
                    }

                    const themeColors = loadTheme();

                    const doc = new PDFDocument();
                    let buffers: Buffer[] = [];
                    doc.on('data', data => buffers.push(data));
                    doc.on('end', () => resolve(Buffer.concat(buffers)));
                    doc.on('error', err => reject(err));

                    // Configura los colores del tema
                    const backgroundColor = themeColors.primary['500']; // Por ejemplo, el color principal
                    const textColor = themeColors.grey[400]; // Por ejemplo, el color de texto de alto contraste

                    // Carga la imagen del logo y la imagen de fondo
                    const logoPath = join(__dirname, '../../../assets/images/logo.jpg');
                    const backgroundImagePath = join(__dirname, '../../../assets/images/background.jpg');
                    const logoBuffer = readFileSync(logoPath);
                    const backgroundImageBuffer = readFileSync(backgroundImagePath);

                    // Establece el tamaño del PDF según el tamaño de la imagen de fondo
                    doc.image(backgroundImageBuffer, 0, 0, { width: doc.page.width, height: doc.page.height });

                    // Encabezado del PDF
                    const headerText = 'Resumen del Pedido';
                    const headerWidth = doc.widthOfString(headerText);
                    const headerX = (doc.page.width - headerWidth) / 2;
                    doc.image(logoBuffer, 50, 70, { width: 100 }); // Ajusta la posición del logo
                    doc.fillColor(textColor).fontSize(30).text(headerText, headerX, 120); // Ajusta la posición del texto del encabezado
                    
                    // Contenido del PDF
                    doc.moveDown(2.1); // Ajusta la distancia del contenido desde el encabezado
                    
                    // Texto de la orden
                    doc.fillColor(textColor).fontSize(14);
                    Object.keys(order.toObject()).forEach(key => {
                        if (key !== '__v') {
                            const value = order[key];
                            if (typeof value !== 'object' || value === null) {
                                doc.fillColor(textColor).text(`${key}: ${value}`, { 
                                    width: 400, // Ajusta el ancho y añade un margen izquierdo
                                    align: 'left' // Centra el texto
                                }); 
                            }
                        }
                    });
                    
                    // Finaliza el documento
                    doc.end();
                })
                .catch((error) => {
                    reject(error);
                });
        });
    }
}
