import { Test, TestingModule } from '@nestjs/testing';
import { UpdateOpiInitialHandler } from './update-opi-initial.handler';
import { UpdateOpiInitialCommand } from '../commands/update-opi-initial.command';
import { OrderRepository } from '../../infrastructure/persistence/order.repository';
import { Logger, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { IOrder } from '../../domain/schemas/order.schema';

describe('UpdateOpiInitialHandler', () => {
  let handler: UpdateOpiInitialHandler;
  let orderRepository: OrderRepository;
  let logger: Logger;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateOpiInitialHandler,
        {
          provide: OrderRepository,
          useValue: {
            orderExistsById: jest.fn(),
            updateInitialProcess: jest.fn(),
          },
        },
        {
          provide: Logger,
          useValue: {
            log: jest.fn(),
            warn: jest.fn(),
            error: jest.fn(),
          },
        },
      ],
    }).compile();

    handler = module.get<UpdateOpiInitialHandler>(UpdateOpiInitialHandler);
    orderRepository = module.get<OrderRepository>(OrderRepository);
    logger = module.get<Logger>(Logger);
  });

  it('should update initial process of OPI successfully', async () => {
    const command = new UpdateOpiInitialCommand('orderId', {
      initialQuantity: 1000,
      processingDateInitial: '2023-01-01T10:00:00Z',
    });

    const mockOrder: Partial<IOrder> = {
      orderNumber: 123,
      clientName: 'Test Client',
      companyName: 'Test Company',
      workName: 'Test Work',
      workType: 'Type1',
      productionQuantity: 1000,
      technician: 'Technician A',
      status: 1,
      updatedAt: new Date(),
      createdAt: new Date(),
      // other required IOrder properties...
    };

    jest.spyOn(orderRepository, 'orderExistsById').mockResolvedValue(true);
    jest.spyOn(orderRepository, 'updateInitialProcess').mockResolvedValue(mockOrder as IOrder);

    await handler.execute(command);

    expect(orderRepository.orderExistsById).toHaveBeenCalledWith('orderId');
    expect(orderRepository.updateInitialProcess).toHaveBeenCalledWith('orderId', {
      initialQuantity: 1000,
      processingDateInitial: new Date('2023-01-01T10:00:00Z'),
    });
    expect(logger.log).toHaveBeenCalledWith('Attempting to update initial process of OPI with ID: orderId');
    expect(logger.log).toHaveBeenCalledWith('Initial process of OPI with ID: orderId successfully updated');
  });

  // Other test cases remain unchanged...
});
