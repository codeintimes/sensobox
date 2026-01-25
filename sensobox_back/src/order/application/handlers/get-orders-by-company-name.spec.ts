import { Test, TestingModule } from '@nestjs/testing';
import { GetOrdersByCompanyNameHandler } from './get-orders-by-company-name.handler';
import { OrderRepository } from '../../infrastructure/persistence/order.repository';
import { GetOrdersByCompanyNameQuery } from '../queries/get-orders-by-company-name.query';
import { NotFoundException } from '@nestjs/common';
import { IOrder } from '../../domain/schemas/order.schema';

describe('GetOrdersByCompanyNameHandler', () => {
  let handler: GetOrdersByCompanyNameHandler;
  let repository: OrderRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetOrdersByCompanyNameHandler,
        {
          provide: OrderRepository,
          useValue: {
            findAll: jest.fn(),
          },
        },
      ],
    }).compile();

    handler = module.get<GetOrdersByCompanyNameHandler>(GetOrdersByCompanyNameHandler);
    repository = module.get<OrderRepository>(OrderRepository);
  });

  it('should return orders successfully', async () => {
    const companyName = 'Test Company';
    const clientName = 'Test Client';
    const query = new GetOrdersByCompanyNameQuery(companyName, clientName);

    const orders: Partial<IOrder>[] = [
      {
        orderNumber: 123,
        clientName,
        companyName,
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
        initialQuantity: 1000,
        processingDateInitial: new Date(),
        finalQuantity: 950,
        finalQuantityDifference: 50,
        quantityRate: 95,
        processingDateFinal: new Date(),
        processingTimeFinal: 130,
        processingTimeDifference: 10,
        processingTimeRate: 98,
        materialWeight: 30,
        materialArea: 50,
        quantityProcessed: 0,
        status: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
    ];

    (repository.findAll as jest.Mock).mockResolvedValue(orders);

    const result = await handler.execute(query);

    expect(repository.findAll).toHaveBeenCalledWith({ companyName, clientName });
    expect(result).toEqual(orders);
  });

  it('should throw NotFoundException if no orders found', async () => {
    const companyName = 'Test Company';
    const clientName = 'Test Client';
    const query = new GetOrdersByCompanyNameQuery(companyName, clientName);

    (repository.findAll as jest.Mock).mockResolvedValue([]);

    await expect(handler.execute(query)).rejects.toThrow(NotFoundException);
    expect(repository.findAll).toHaveBeenCalledWith({ companyName, clientName });
  });

  it('should throw NotFoundException if no orders found and clientName is not provided', async () => {
    const companyName = 'Test Company';
    const query = new GetOrdersByCompanyNameQuery(companyName);

    (repository.findAll as jest.Mock).mockResolvedValue([]);

    await expect(handler.execute(query)).rejects.toThrow(NotFoundException);
    expect(repository.findAll).toHaveBeenCalledWith({ companyName });
  });

  it('should throw an error on unexpected error', async () => {
    const companyName = 'Test Company';
    const clientName = 'Test Client';
    const query = new GetOrdersByCompanyNameQuery(companyName, clientName);

    (repository.findAll as jest.Mock).mockRejectedValue(new Error('Unexpected error'));

    await expect(handler.execute(query)).rejects.toThrow(Error);
    expect(repository.findAll).toHaveBeenCalledWith({ companyName, clientName });
  });
});
