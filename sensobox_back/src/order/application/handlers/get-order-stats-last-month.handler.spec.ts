import { Test, TestingModule } from '@nestjs/testing';
import { GetOrderStatsLastMonthHandler } from './get-order-stats-last-month.handler';
import { GetOrderStatsLastMonthQuery } from '../queries/get-order-stats-last-month.query';
import { Model } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';
import { IOrder } from '../../domain/schemas/order.schema';
import { OrderStatisticsDTO } from '../dto/order-statistics.dto';

describe('GetOrderStatsLastMonthHandler', () => {
  let handler: GetOrderStatsLastMonthHandler;
  let orderModel: Model<IOrder>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetOrderStatsLastMonthHandler,
        {
          provide: getModelToken('Order'),
          useValue: {
            find: jest.fn(),
          },
        },
      ],
    }).compile();

    handler = module.get<GetOrderStatsLastMonthHandler>(GetOrderStatsLastMonthHandler);
    orderModel = module.get<Model<IOrder>>(getModelToken('Order'));
  });

  it('should fetch order stats for the last month successfully', async () => {
    const query = new GetOrderStatsLastMonthQuery('Company1');
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    const mockOrders = [
      {
        createdAt: new Date(),
        productionQuantity: 100,
        processingTimeDifference: 10,
        finalQuantityDifference: 5,
        companyName: 'Company1',
      },
      {
        createdAt: new Date(),
        productionQuantity: 200,
        processingTimeDifference: 20,
        finalQuantityDifference: 10,
        companyName: 'Company1',
      },
    ];

    jest.spyOn(orderModel, 'find').mockResolvedValue(mockOrders as any);

    const result = await handler.execute(query);

    const expectedResult: OrderStatisticsDTO = {
      totalProductionQuantityLastMonth: 300,
      orderCountLastMonth: 2,
      totalProcessingTimeDifferenceLastMonth: 15,
      totalFinalQuantityDifferenceLastMonth: 7.5,
      totalProductionQuantityLastYear: 0, // Assuming no data available for last year, default to 0 or calculate as needed
      orderCountLastYear: 0,
      totalProcessingTimeDifferenceLastYear: 0,
      totalFinalQuantityDifferenceLastYear: 0,
      totalOrdersByCompany: 2, // Assuming this is to count the total orders by the company, you might need actual data here
      totalProductionByCompany: 300, // Total production for the company; adjust based on real data
      allPending: {}, // Assuming no data available, default to an empty object or provide real pending order details
      futurePending: {} // Same as above, adjust based on actual data or business logic
    };
    

    expect(result).toEqual(expectedResult);
    expect(orderModel.find).toHaveBeenCalledWith({
      companyName: 'Company1',
      createdAt: { $gt: oneMonthAgo },
    });
  });

  it('should handle unexpected errors gracefully', async () => {
    const query = new GetOrderStatsLastMonthQuery('Company1');

    jest.spyOn(orderModel, 'find').mockRejectedValue(new Error('Unexpected error'));

    await expect(handler.execute(query)).rejects.toThrow(Error);
    expect(orderModel.find).toHaveBeenCalledWith({
      companyName: 'Company1',
      createdAt: { $gt: expect.any(Date) },
    });
  });
});
