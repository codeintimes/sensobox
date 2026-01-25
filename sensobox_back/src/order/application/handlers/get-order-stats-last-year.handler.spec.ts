import { Test, TestingModule } from '@nestjs/testing';
import { GetOrderStatsLastYearHandler } from './get-order-stats-last-year.handler';
import { GetOrderStatsLastYearQuery } from '../queries/get-order-stats-last-year.query';
import { Model } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';
import { IOrder } from '../../domain/schemas/order.schema';
import { OrderStatisticsDTO } from '../dto/order-statistics.dto';

class MockMongooseQuery {
  exec = jest.fn();

  constructor(private data: any) {
    this.exec.mockResolvedValue(data);
  }

  sort = jest.fn().mockReturnThis();
  limit = jest.fn().mockReturnThis();
  find = jest.fn().mockReturnThis();
  aggregate = jest.fn().mockReturnThis();
}

describe('GetOrderStatsLastYearHandler', () => {
  let handler: GetOrderStatsLastYearHandler;
  let model: Model<IOrder>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetOrderStatsLastYearHandler,
        {
          provide: getModelToken('Order'),
          useValue: {
            find: () => new MockMongooseQuery([
              { createdAt: new Date(), productionQuantity: 100, processingTimeDifference: 10, finalQuantityDifference: 5, companyName: 'Company1' },
              { createdAt: new Date(), productionQuantity: 200, processingTimeDifference: 20, finalQuantityDifference: 10, companyName: 'Company1' },
            ]),
            aggregate: () => new MockMongooseQuery([
              {
                totalOrdersByCompany: [
                  { _id: 'Client1', totalOrders: 5 },
                  { _id: 'Client2', totalOrders: 3 },
                ],
                totalProductionByCompany: [
                  { _id: 'Client1', totalProductionQuantity: 500 },
                  { _id: 'Client2', totalProductionQuantity: 300 },
                ],
              }
            ])
          },
        },
      ],
    }).compile();

    handler = module.get<GetOrderStatsLastYearHandler>(GetOrderStatsLastYearHandler);
    model = module.get<Model<IOrder>>(getModelToken('Order'));
  });

  it('should fetch order stats for the last year successfully', async () => {
    const query = new GetOrderStatsLastYearQuery('Company1');

    const result = await handler.execute(query);

    expect(result.totalProductionQuantityLastYear).toEqual(150);
    expect(result.orderCountLastYear).toEqual(0.16666666666666666); // Depending on the calculation logic
    expect(result.totalOrdersByCompany).toEqual([
      { id: 'Client1', label: 'Client1', value: 5 },
      { id: 'Client2', label: 'Client2', value: 3 }
    ]);
    expect(result.totalProductionByCompany).toEqual([
      { id: 'Client1', label: 'Client1', value: 500 },
      { id: 'Client2', label: 'Client2', value: 300 }
    ]);

    expect(model.find).toHaveBeenCalled();
    expect(model.aggregate).toHaveBeenCalled();
  });
});
