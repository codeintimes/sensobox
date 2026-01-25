import { Test, TestingModule } from '@nestjs/testing';
import { GetOrderStatsHandler } from './get-order-stats.handler';
import { GetOrderStatsQuery } from '../queries/get-order-stats.query';
import { Model } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';
import { IOrder } from '../../domain/schemas/order.schema';
import { OrderStatsDTO } from '../dto/order-stats.dto';

describe('GetOrderStatsHandler', () => {
  let handler: GetOrderStatsHandler;
  let orderModel: Model<IOrder>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetOrderStatsHandler,
        {
          provide: getModelToken('Order'),
          useValue: {
            find: jest.fn(),
          },
        },
      ],
    }).compile();

    handler = module.get<GetOrderStatsHandler>(GetOrderStatsHandler);
    orderModel = module.get<Model<IOrder>>(getModelToken('Order'));
  });

  it('should fetch order stats successfully', async () => {
    const query = new GetOrderStatsQuery('2023-01-01', 'Company1', 'Client1');
    const mockOrders = [
      {
        createdAt: new Date('2023-01-02'),
        finalQuantity: 100,
        quantityRate: 90,
        initialQuantity: 110,
        companyName: 'Company1',
        clientName: 'Client1',
      },
      {
        createdAt: new Date('2023-01-02'),
        finalQuantity: 200,
        quantityRate: 85,
        initialQuantity: 235,
        companyName: 'Company1',
        clientName: 'Client1',
      },
    ];

    jest.spyOn(orderModel, 'find').mockReturnValue({
      sort: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockOrders),
      }),
    } as any);

    const result = await handler.execute(query);

    const expectedResult: OrderStatsDTO[] = [
      {
        finalQuantity: 100,
        quantityRate: 90,
        initialQuantity: 110,
        createdAt: mockOrders[0].createdAt.toISOString(),
      },
      {
        finalQuantity: 200,
        quantityRate: 85,
        initialQuantity: 235,
        createdAt: mockOrders[1].createdAt.toISOString(),
      },
    ];

    expect(result).toEqual(expectedResult);
    expect(orderModel.find).toHaveBeenCalledWith({
      createdAt: { $gte: query.fromDate, $lte: expect.any(Date) },
      finalQuantity: { $ne: null },
      quantityRate: { $ne: null },
      initialQuantity: { $ne: null },
      companyName: 'Company1',
      clientName: 'Client1',
    });
  });

  it('should return an empty array if no orders are found', async () => {
    const query = new GetOrderStatsQuery('2023-01-01', 'Company1', 'Client1');

    jest.spyOn(orderModel, 'find').mockReturnValue({
      sort: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue([]),
      }),
    } as any);

    const result = await handler.execute(query);

    expect(result).toEqual([]);
    expect(orderModel.find).toHaveBeenCalledWith({
      createdAt: { $gte: query.fromDate, $lte: expect.any(Date) },
      finalQuantity: { $ne: null },
      quantityRate: { $ne: null },
      initialQuantity: { $ne: null },
      companyName: 'Company1',
      clientName: 'Client1',
    });
  });

  it('should handle unexpected errors gracefully', async () => {
    const query = new GetOrderStatsQuery('2023-01-01', 'Company1', 'Client1');

    jest.spyOn(orderModel, 'find').mockReturnValue({
      sort: jest.fn().mockReturnValue({
        exec: jest.fn().mockRejectedValue(new Error('Unexpected error')),
      }),
    } as any);

    await expect(handler.execute(query)).rejects.toThrow(Error);
    expect(orderModel.find).toHaveBeenCalledWith({
      createdAt: { $gte: query.fromDate, $lte: expect.any(Date) },
      finalQuantity: { $ne: null },
      quantityRate: { $ne: null },
      initialQuantity: { $ne: null },
      companyName: 'Company1',
      clientName: 'Client1',
    });
  });
});
