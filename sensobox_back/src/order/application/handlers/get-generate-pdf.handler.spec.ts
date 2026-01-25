import { Test, TestingModule } from '@nestjs/testing';
import { GeneratePdfHandler } from './get-generate-pdf.handler';
import { GeneratePdfCommand } from '../commands/generate-pdf.command';
import { Model } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';
import { IOrder } from '../../domain/schemas/order.schema';
import { readFileSync } from 'fs';
import * as PDFDocument from 'pdfkit';
import { join } from 'path';

jest.mock('pdfkit');
jest.mock('fs', () => ({
    readFileSync: jest.fn()
}));

describe('GeneratePdfHandler', () => {
    let handler: GeneratePdfHandler;
    let orderModel: Model<IOrder>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                GeneratePdfHandler,
                {
                    provide: getModelToken('Order'),
                    useValue: {
                        findById: jest.fn(),
                    },
                },
            ],
        }).compile();

        handler = module.get<GeneratePdfHandler>(GeneratePdfHandler);
        orderModel = module.get<Model<IOrder>>(getModelToken('Order'));
    });

    it('should generate a PDF successfully', async () => {
        const command = new GeneratePdfCommand('orderId');
        const mockOrder = {
            _id: 'orderId',
            clientName: 'Client1',
            companyName: 'Company1',
            // otras propiedades...
        };
        
        jest.spyOn(orderModel, 'findById').mockResolvedValue(mockOrder as any);
        (readFileSync as jest.Mock).mockImplementation((path: string) => Buffer.from(''));
        
        const pdfBuffer = await handler.execute(command);

        expect(orderModel.findById).toHaveBeenCalledWith('orderId');
        expect(pdfBuffer).toBeInstanceOf(Buffer);
    });

    it('should throw an error if order is not found', async () => {
        const command = new GeneratePdfCommand('orderId');
        
        jest.spyOn(orderModel, 'findById').mockResolvedValue(null);

        await expect(handler.execute(command)).rejects.toThrow('Order not found');
        expect(orderModel.findById).toHaveBeenCalledWith('orderId');
    });

    it('should handle unexpected errors gracefully', async () => {
        const command = new GeneratePdfCommand('orderId');
        
        jest.spyOn(orderModel, 'findById').mockRejectedValue(new Error('Unexpected error'));

        await expect(handler.execute(command)).rejects.toThrow(Error);
        expect(orderModel.findById).toHaveBeenCalledWith('orderId');
    });
});
