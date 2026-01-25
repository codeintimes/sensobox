import { Test, TestingModule } from '@nestjs/testing';
import { GetWeeklyOrderGraphHandler } from './get-order-weekly-graph.handler';
import { GetWeeklyOrderGraphQuery } from '../queries/get-order-weekly-graph.query';
import { Model } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';
import { IOrder } from '../../domain/schemas/order.schema';

describe('GetWeeklyOrderGraphHandler', () => {
  let handler: GetWeeklyOrderGraphHandler;
  let orderModel: Model<IOrder>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetWeeklyOrderGraphHandler,
        {
          provide: getModelToken('Order'),
          useValue: {
            aggregate: jest.fn(),
          },
        },
      ],
    }).compile();

    handler = module.get<GetWeeklyOrderGraphHandler>(GetWeeklyOrderGraphHandler);
    orderModel = module.get<Model<IOrder>>(getModelToken('Order'));
  });

  it('should fetch weekly order graph successfully', async () => {
    const query = new GetWeeklyOrderGraphQuery('Company1');
    const mockAggregatedOrders = [
      {
        _id: { year: 2023, week: 1 },
        ordersNumber: 10,
        createdAt: new Date('2023-01-01'),
      },
      {
        _id: { year: 2023, week: 2 },
        ordersNumber: 15,
        createdAt: new Date('2023-01-08'),
      },
    ];

    jest.spyOn(orderModel, 'aggregate').mockResolvedValue(mockAggregatedOrders as any);

    const result = await handler.execute(query);

    const expectedResult = [
      {
        ordersNumber: 10,
        createdAt: mockAggregatedOrders[0].createdAt.toISOString(),
      },
      {
        ordersNumber: 15,
        createdAt: mockAggregatedOrders[1].createdAt.toISOString(),
      },
    ];

    expect(result).toEqual(expectedResult);
    expect(orderModel.aggregate).toHaveBeenCalledWith([
      {
        $match: {
          createdAt: { $gte: expect.any(Date) },
          companyName: 'Company1',
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            week: { $week: '$createdAt' },
          },
          ordersNumber: { $sum: 1 },
          createdAt: { $first: '$createdAt' },
        },
      },
      {
        $sort: { '_id.year': 1, '_id.week': 1 },
      },
    ]);
  });

  it('should handle unexpected errors gracefully', async () => {
    const query = new GetWeeklyOrderGraphQuery('Company1');

    jest.spyOn(orderModel, 'aggregate').mockRejectedValue(new Error('Unexpected error'));

    await expect(handler.execute(query)).rejects.toThrow(Error);
    expect(orderModel.aggregate).toHaveBeenCalledWith([
      {
        $match: {
          createdAt: { $gte: expect.any(Date) },
          companyName: 'Company1',
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            week: { $week: '$createdAt' },
          },
          ordersNumber: { $sum: 1 },
          createdAt: { $first: '$createdAt' },
        },
      },
      {
        $sort: { '_id.year': 1, '_id.week': 1 },
      },
    ]);
  });
});
