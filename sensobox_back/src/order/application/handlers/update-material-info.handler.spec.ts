import { Test, TestingModule } from '@nestjs/testing';
import { UpdateMaterialInfoHandler } from './update-material-info.handler';
import { UpdateMaterialInfoCommand } from '../commands/update-material-info.command';
import { OrderRepository } from '../../infrastructure/persistence/order.repository';
import { Logger, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { IOrder } from '../../domain/schemas/order.schema';

describe('UpdateMaterialInfoHandler', () => {
  let handler: UpdateMaterialInfoHandler;
  let orderRepository: OrderRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateMaterialInfoHandler,
        {
          provide: OrderRepository,
          useValue: {
            findById: jest.fn(),
            update: jest.fn(),
          },
        },
        {
          provide: Logger,
          useValue: {
            log: jest.fn(),
            error: jest.fn(),
          },
        },
      ],
    }).compile();

    handler = module.get<UpdateMaterialInfoHandler>(UpdateMaterialInfoHandler);
    orderRepository = module.get<OrderRepository>(OrderRepository);
  });

  it('should update material info successfully', async () => {
    const command = new UpdateMaterialInfoCommand('orderId', 500, 300);

    const mockOrder: Partial<IOrder> = {
      id: 'orderId',
      orderNumber: 123,
      clientName: 'Client A',
      companyName: 'Company A',
      workName: 'Work A',
      workType: 'Type A',
      productionQuantity: 1000,
      colors: 'Red',
      processes: 'Process A',
      specialFinishes: 'Finish A',
      technician: 'Tech A',
      materialWeight: 100,
      materialArea: 50,
      quantityProcessed: 500,
      processingTime: 120,
      initialQuantity: 100,
      finalQuantity: 90,
      finalQuantityDifference: 10,
      quantityRate: 1.1,
      processingDateInitial: new Date(),
      processingDateFinal: new Date(),
      processingTimeFinal: 150,
      processingTimeDifference: 30,
      processingTimeRate: 1.2,
      status: 1,
      updatedAt: new Date(),
      createdAt: new Date(),
    };

    jest.spyOn(orderRepository, 'findById').mockResolvedValue(mockOrder as IOrder);
    jest.spyOn(orderRepository, 'update').mockResolvedValue(mockOrder as IOrder);

    await handler.execute(command);

    expect(orderRepository.findById).toHaveBeenCalledWith('orderId');
    expect(orderRepository.update).toHaveBeenCalledWith('orderId', { materialWeight: 500, materialArea: 300 });
    expect(Logger.prototype.log).toHaveBeenCalledWith('Attempting to update material info of OPI with ID: orderId');
    expect(Logger.prototype.log).toHaveBeenCalledWith('Material info of OPI with ID: orderId successfully updated');
  });

  it('should throw NotFoundException if order is not found', async () => {
    const command = new UpdateMaterialInfoCommand('orderId', 500, 300);

    jest.spyOn(orderRepository, 'findById').mockResolvedValue(null);

    await expect(handler.execute(command)).rejects.toThrow(NotFoundException);
    expect(orderRepository.findById).toHaveBeenCalledWith('orderId');
    expect(Logger.prototype.error).toHaveBeenCalledWith('OPI with ID: orderId not found');
  });

  it('should handle unexpected errors gracefully', async () => {
    const command = new UpdateMaterialInfoCommand('orderId', 500, 300);

    const mockOrder: Partial<IOrder> = {
      id: 'orderId',
      orderNumber: 123,
      clientName: 'Client A',
      companyName: 'Company A',
      workName: 'Work A',
      workType: 'Type A',
      productionQuantity: 1000,
      colors: 'Red',
      processes: 'Process A',
      specialFinishes: 'Finish A',
      technician: 'Tech A',
      materialWeight: 100,
      materialArea: 50,
      quantityProcessed: 500,
      processingTime: 120,
      initialQuantity: 100,
      finalQuantity: 90,
      finalQuantityDifference: 10,
      quantityRate: 1.1,
      processingDateInitial: new Date(),
      processingDateFinal: new Date(),
      processingTimeFinal: 150,
      processingTimeDifference: 30,
      processingTimeRate: 1.2,
      status: 1,
      updatedAt: new Date(),
      createdAt: new Date(),
    };

    jest.spyOn(orderRepository, 'findById').mockResolvedValue(mockOrder as IOrder);
    jest.spyOn(orderRepository, 'update').mockRejectedValue(new Error('Unexpected error'));

    await expect(handler.execute(command)).rejects.toThrow(InternalServerErrorException);
    expect(orderRepository.findById).toHaveBeenCalledWith('orderId');
    expect(orderRepository.update).toHaveBeenCalledWith('orderId', { materialWeight: 500, materialArea: 300 });
    expect(Logger.prototype.error).toHaveBeenCalledWith(
      'Error during material info update of OPI with ID: orderId',
      expect.any(Error)
    );
  });
});
