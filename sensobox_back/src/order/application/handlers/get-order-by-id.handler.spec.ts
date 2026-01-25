import { Test, TestingModule } from '@nestjs/testing';
import { GetOrderByIdHandler } from './get-order-by-id.handler';
import { GetOrderByIdQuery } from '../queries/get-order-by-id.query';
import { OrderRepository } from '../../infrastructure/persistence/order.repository';
import { Logger, NotFoundException } from '@nestjs/common';
const mongoose = require('mongoose');

describe('GetOrderByIdHandler', () => {
  let handler: GetOrderByIdHandler;
  let orderRepository: OrderRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetOrderByIdHandler,
        {
          provide: OrderRepository,
          useValue: {
            findById: jest.fn(),
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

    handler = module.get<GetOrderByIdHandler>(GetOrderByIdHandler);
    orderRepository = module.get<OrderRepository>(OrderRepository);
  });

  it('should fetch an order by ID successfully', async () => {
    const query = new GetOrderByIdQuery('orderId');
    
    const mockOrder = new mongoose.Document({
      _id: 'orderId',
      clientName: 'Client1',
      companyName: 'Company1',
      orderNumber: 123, // Note: make sure this is a number if the interface requires it
      workName: 'WorkX',
      workType: 'TypeY',
      productionQuantity: 100,
      colors: 'Red, Blue',
      processes: 'Printing, Cutting',
      specialFinishes: 'Glossy Finish',
      palletsNumber: 10,
      technician: 'Tech1',
      processingDate: new Date(),
      processingTime: 120,
      initialQuantity: 1000,
      processingDateInitial: new Date(),
      finalQuantity: 950,
      finalQuantityDifference: 50,
      quantityRate: 95,
      processingDateFinal: new Date(),
      processingTimeFinal: 115,
      processingTimeDifference: 5,
      processingTimeRate: 0.96,
      materialWeight: 150.5,
      materialArea: 75.25,
      status: 2,
      quantityProcessed: 920,
      updatedAt: new Date(),
      createdAt: new Date()
    })
    
    jest.spyOn(orderRepository, 'findById').mockResolvedValue(mockOrder);

    const result = await handler.execute(query);

    expect(result).toEqual(mockOrder);
    expect(orderRepository.findById).toHaveBeenCalledWith('orderId');
    expect(Logger.prototype.log).toHaveBeenCalledWith('Attempting to fetch Order with ID: orderId');
    expect(Logger.prototype.log).toHaveBeenCalledWith('Order with ID orderId found successfully');
  });

  it('should throw NotFoundException if order is not found', async () => {
    const query = new GetOrderByIdQuery('orderId');

    jest.spyOn(orderRepository, 'findById').mockResolvedValue(null);

    await expect(handler.execute(query)).rejects.toThrow(NotFoundException);
    expect(orderRepository.findById).toHaveBeenCalledWith('orderId');
    expect(Logger.prototype.warn).toHaveBeenCalledWith('Order with ID orderId not found');
  });

  it('should handle unexpected errors gracefully', async () => {
    const query = new GetOrderByIdQuery('orderId');

    jest.spyOn(orderRepository, 'findById').mockRejectedValue(new Error('Unexpected error'));

    await expect(handler.execute(query)).rejects.toThrow(NotFoundException);
    expect(orderRepository.findById).toHaveBeenCalledWith('orderId');
    expect(Logger.prototype.error).toHaveBeenCalledWith('Failed to fetch Order with ID orderId', expect.any(Error));
  });
});
