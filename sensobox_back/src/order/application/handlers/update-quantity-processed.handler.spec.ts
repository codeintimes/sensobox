import { Test, TestingModule } from '@nestjs/testing';
import { UpdateQuantityProcessedHandler } from './update-quantity-processed.handler';
import { UpdateQuantityProcessedCommand } from '../commands/update-quantity-processed.command';
import { OrderRepository } from '../../infrastructure/persistence/order.repository';
import { Logger, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { IOrder } from '../../domain/schemas/order.schema';
import { OrderDto } from '../dto/order.dto';

describe('UpdateQuantityProcessedHandler', () => {
  let handler: UpdateQuantityProcessedHandler;
  let orderRepository: OrderRepository;
  let logger: Logger;
  let mockOrder: IOrder;

  beforeEach(async () => {
    const orderDto: OrderDto = {
      orderNumber: 123,
      clientName: 'Test Client',
      companyName: 'Test Company',
      workName: 'Test Job',
      workType: 'Type A',
      productionQuantity: 100,
      colors: 'Red, Blue',
      processes: 'Process 1, Process 2',
      specialFinishes: 'Finish 1, Finish 2',
      palletsNumber: 5,
      technician: 'John Doe',
      processingDate: new Date(),
      processingTime: 120,
      materialArea: 50,
      materialWeight: 30,
      quantityProcessed: 0
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateQuantityProcessedHandler,
        {
          provide: OrderRepository,
          useValue: {
            findById: jest.fn().mockResolvedValue(orderDto),
            update: jest.fn().mockResolvedValue(undefined),
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

    handler = module.get<UpdateQuantityProcessedHandler>(UpdateQuantityProcessedHandler);
    orderRepository = module.get<OrderRepository>(OrderRepository);
    logger = module.get<Logger>(Logger);
  });

  it('should update quantityProcessed successfully', async () => {
    const command = new UpdateQuantityProcessedCommand('orderId', 500);
    await handler.execute(command);

    expect(orderRepository.findById).toHaveBeenCalledWith('orderId');
    expect(orderRepository.update).toHaveBeenCalledWith('orderId', { quantityProcessed: 500 });
    expect(logger.log).toHaveBeenCalledWith('Attempting to update quantityProcessed of OPI with ID: orderId');
    expect(logger.log).toHaveBeenCalledWith('quantityProcessed of OPI with ID: orderId successfully updated');
  });

  it('should throw NotFoundException if order is not found', async () => {
    const command = new UpdateQuantityProcessedCommand('orderId', 500);
    jest.spyOn(orderRepository, 'findById').mockResolvedValue(null);

    await expect(handler.execute(command)).rejects.toThrow(NotFoundException);
    expect(orderRepository.findById).toHaveBeenCalledWith('orderId');
    expect(logger.error).toHaveBeenCalledWith('OPI with ID: orderId not found');
  });

  it('should handle unexpected errors gracefully', async () => {
    const command = new UpdateQuantityProcessedCommand('orderId', 500);
    jest.spyOn(orderRepository, 'update').mockRejectedValue(new Error('Unexpected error'));

    await expect(handler.execute(command)).rejects.toThrow(InternalServerErrorException);
    expect(orderRepository.findById).toHaveBeenCalledWith('orderId');
    expect(orderRepository.update).toHaveBeenCalledWith('orderId', { quantityProcessed: 500 });
    expect(logger.error).toHaveBeenCalledWith('Error during quantityProcessed update of OPI with ID: orderId', expect.any(Error));
  });
});
