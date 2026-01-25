import { Test, TestingModule } from '@nestjs/testing';
import { UpdateOpiFinalHandler } from './update-opi-final.handler';
import { UpdateOpiFinalCommand } from '../commands/update-opi-final.command';
import { OrderRepository } from '../../infrastructure/persistence/order.repository';
import { Logger, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { IOrder } from '../../domain/schemas/order.schema';

describe('UpdateOpiFinalHandler', () => {
  let handler: UpdateOpiFinalHandler;
  let orderRepository: OrderRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateOpiFinalHandler,
        {
          provide: OrderRepository,
          useValue: {
            findById: jest.fn(),
            updateFinalProcess: jest.fn(),
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

    handler = module.get<UpdateOpiFinalHandler>(UpdateOpiFinalHandler);
    orderRepository = module.get<OrderRepository>(OrderRepository);
  });

  it('should update final process of OPI successfully', async () => {
    const command = new UpdateOpiFinalCommand('orderId', {
      finalQuantity: 500,
      processingDateFinal: new Date('2023-01-01T10:00:00Z'),
    });
    const mockOrder: Partial<IOrder> = {
      id: 'orderId',
      initialQuantity: 1000,
      processingTime: 8, // in hours
      processingDateInitial: new Date('2023-01-01T02:00:00Z'),
    };

    jest.spyOn(orderRepository, 'findById').mockResolvedValue(mockOrder as IOrder);
    jest.spyOn(orderRepository, 'updateFinalProcess').mockResolvedValue(mockOrder as IOrder);

    await handler.execute(command);

    expect(orderRepository.findById).toHaveBeenCalledWith('orderId');
    expect(orderRepository.updateFinalProcess).toHaveBeenCalledWith('orderId', {
      finalQuantity: 500,
      processingDateFinal: new Date('2023-01-01T10:00:00Z'),
      quantityRate: 0.5,
      processingTimeRate: 1,
      processingTimeFinal: 8,
      processingTimeDifference: 0,
      finalQuantityDifference: -500,
    });
    expect(Logger.prototype.log).toHaveBeenCalledWith('Attempting to update final process of OPI with ID: orderId');
    expect(Logger.prototype.log).toHaveBeenCalledWith('Final process of OPI with ID: orderId successfully updated');
  });

  it('should throw NotFoundException if order is not found', async () => {
    const command = new UpdateOpiFinalCommand('orderId', {
      finalQuantity: 500,
      processingDateFinal: new Date('2023-01-01T10:00:00Z'),
    });

    jest.spyOn(orderRepository, 'findById').mockResolvedValue(null);

    await expect(handler.execute(command)).rejects.toThrow(NotFoundException);
    expect(orderRepository.findById).toHaveBeenCalledWith('orderId');
    expect(Logger.prototype.error).toHaveBeenCalledWith('OPI with ID: orderId not found');
  });

  it('should handle unexpected errors gracefully', async () => {
    const command = new UpdateOpiFinalCommand('orderId', {
      finalQuantity: 500,
      processingDateFinal: new Date('2023-01-01T10:00:00Z'),
    });
    const mockOrder: Partial<IOrder> = {
      id: 'orderId',
      initialQuantity: 1000,
      processingTime: 8, // in hours
      processingDateInitial: new Date('2023-01-01T02:00:00Z'),
    };

    jest.spyOn(orderRepository, 'findById').mockResolvedValue(mockOrder as IOrder);
    jest.spyOn(orderRepository, 'updateFinalProcess').mockRejectedValue(new Error('Unexpected error'));

    await expect(handler.execute(command)).rejects.toThrow(InternalServerErrorException);
    expect(orderRepository.findById).toHaveBeenCalledWith('orderId');
    expect(orderRepository.updateFinalProcess).toHaveBeenCalledWith('orderId', {
      finalQuantity: 500,
      processingDateFinal: new Date('2023-01-01T10:00:00Z'),
      quantityRate: 0.5,
      processingTimeRate: 1,
      processingTimeFinal: 8,
      processingTimeDifference: 0,
      finalQuantityDifference: -500,
    });
    expect(Logger.prototype.error).toHaveBeenCalledWith('Error during final process update of OPI with ID: orderId', expect.any(Error));
  });
});
