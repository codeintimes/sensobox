import { Test, TestingModule } from '@nestjs/testing';
import { GetOrderProcessingStatsHandler } from './get-order-processing-stats.handler';
import { GetOrderProcessingStatsQuery } from '../queries/get-order-processing-stats.query';
import { Model } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';
import { IOrder } from '../../domain/schemas/order.schema';
import { OrderProcessingStatsDTO } from '../dto/order-processing-stats.dto';

describe('GetOrderProcessingStatsHandler', () => {
  let handler: GetOrderProcessingStatsHandler;
  let orderModel: Model<IOrder>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetOrderProcessingStatsHandler,
        {
          provide: getModelToken('Order'),
          useValue: {
            find: jest.fn(),
          },
        },
      ],
    }).compile();

    handler = module.get<GetOrderProcessingStatsHandler>(GetOrderProcessingStatsHandler);
    orderModel = module.get<Model<IOrder>>(getModelToken('Order'));
  });

  it('should fetch order processing stats successfully', async () => {
    const query = new GetOrderProcessingStatsQuery('2023-01-01', 'Company1');

    const mockOrders = [
      {
        createdAt: new Date('2023-01-02'),
        processingTime: 120,
        processingTimeFinal: 130,
        processingTimeRate: 95,
        companyName: 'Company1',
      },
    ];

    jest.spyOn(orderModel, 'find').mockReturnValue({
      sort: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockOrders),
      }),
    } as any);

    const result = await handler.execute(query);

    const expectedResult: OrderProcessingStatsDTO[] = [
      {
        createdAt: mockOrders[0].createdAt.toISOString(),
        processingTime: mockOrders[0].processingTime,
        processingTimeReal: mockOrders[0].processingTimeFinal,
        processingTimeRate: mockOrders[0].processingTimeRate,
      },
    ];

    expect(result).toEqual(expectedResult);
    expect(orderModel.find).toHaveBeenCalledWith({
      createdAt: { $gte: query.fromDate, $lte: expect.any(Date) },
      companyName: 'Company1',
    });
  });

  it('should handle unexpected errors gracefully', async () => {
    const query = new GetOrderProcessingStatsQuery('2023-01-01', 'Company1');


    jest.spyOn(orderModel, 'find').mockReturnValue({
      sort: jest.fn().mockReturnValue({
        exec: jest.fn().mockRejectedValue(new Error('Unexpected error')),
      }),
    } as any);

    await expect(handler.execute(query)).rejects.toThrow(Error);
    expect(orderModel.find).toHaveBeenCalledWith({
      createdAt: { $gte: query.fromDate, $lte: expect.any(Date) },
      companyName: 'Company1',
    });
  });
});
