import { Test, TestingModule } from '@nestjs/testing';
import { GetPendingOrdersHandler } from './get-pending-orders.handler';
import { GetPendingOrdersFromQuery } from '../queries/get-pending-orders.query';
import { Model } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';
import { IOrder } from '../../domain/schemas/order.schema';
import { OrderStatisticsDTO } from '../dto/order-statistics.dto';


describe('GetPendingOrdersHandler', () => {
  let handler: GetPendingOrdersHandler;
  let orderModel: Model<IOrder>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetPendingOrdersHandler,
        {
          provide: getModelToken('Order'),
          useValue: {
            find: jest.fn(),
          },
        },
      ],
    }).compile();

    handler = module.get<GetPendingOrdersHandler>(GetPendingOrdersHandler);
    orderModel = module.get<Model<IOrder>>(getModelToken('Order'));
  });

  it('should fetch pending orders successfully', async () => {
    const query = new GetPendingOrdersFromQuery('Company1');
    const currentDate = new Date();

    const mockOrders = [
      {
        companyName: 'Company1',
        status: 1,
        processingDate: new Date(currentDate.getTime() + 10000), // Future date
      },
      {
        companyName: 'Company1',
        status: 1,
        processingDate: new Date(currentDate.getTime() - 10000), // Past date
      },
    ];

    jest.spyOn(orderModel, 'find').mockResolvedValue(mockOrders as any);

    const result = await handler.execute(query);
    const expectedResult: OrderStatisticsDTO = {
      totalProductionQuantityLastMonth: 1000,
      orderCountLastMonth: 50,
      totalProcessingTimeDifferenceLastMonth: 300,
      totalFinalQuantityDifferenceLastMonth: 200,
      
      totalProductionQuantityLastYear: 12000,
      orderCountLastYear: 600,
      totalProcessingTimeDifferenceLastYear: 3600,
      totalFinalQuantityDifferenceLastYear: 2400,
      
      totalOrdersByCompany: 500,
      totalProductionByCompany: 10000,
    
      allPending: [
        {
          companyName: 'Company A',
          status: 1,
          processingDate: new Date('2024-05-28T00:00:00Z'),
        },
        {
          companyName: 'Company B',
          status: 2,
          processingDate: new Date('2024-06-01T00:00:00Z'),
        },
      ],
      futurePending: [
        {
          companyName: 'Company C',
          status: 1,
          processingDate: new Date('2024-06-15T00:00:00Z'),
        },
        {
          companyName: 'Company D',
          status: 2,
          processingDate: new Date('2024-07-01T00:00:00Z'),
        },
      ],
    };

    expect(result).toEqual(expectedResult);
    expect(orderModel.find).toHaveBeenCalledWith({
      companyName: 'Company1',
      status: 1,
    });
  });

  it('should return an empty array if no pending orders are found', async () => {
    const query = new GetPendingOrdersFromQuery('Company1');

    jest.spyOn(orderModel, 'find').mockResolvedValue([]);

    const result = await handler.execute(query);

    const expectedResult: OrderStatisticsDTO = {
      totalProductionQuantityLastMonth: 1000,
      orderCountLastMonth: 50,
      totalProcessingTimeDifferenceLastMonth: 300,
      totalFinalQuantityDifferenceLastMonth: 200,
      
      totalProductionQuantityLastYear: 12000,
      orderCountLastYear: 600,
      totalProcessingTimeDifferenceLastYear: 3600,
      totalFinalQuantityDifferenceLastYear: 2400,
      
      totalOrdersByCompany: 500,
      totalProductionByCompany: 10000,
    
      allPending: [
        {
          companyName: 'Company A',
          status: 1,
          processingDate: new Date('2024-05-28T00:00:00Z'),
        },
        {
          companyName: 'Company B',
          status: 2,
          processingDate: new Date('2024-06-01T00:00:00Z'),
        },
      ],
      futurePending: [
        {
          companyName: 'Company C',
          status: 1,
          processingDate: new Date('2024-06-15T00:00:00Z'),
        },
        {
          companyName: 'Company D',
          status: 2,
          processingDate: new Date('2024-07-01T00:00:00Z'),
        },
      ],
    };

    expect(result).toEqual(expectedResult);
    expect(orderModel.find).toHaveBeenCalledWith({
      companyName: 'Company1',
      status: 1,
    });
  });

  it('should handle unexpected errors gracefully', async () => {
    const query = new GetPendingOrdersFromQuery('Company1');

    jest.spyOn(orderModel, 'find').mockRejectedValue(new Error('Unexpected error'));

    await expect(handler.execute(query)).rejects.toThrow(Error);
    expect(orderModel.find).toHaveBeenCalledWith({
      companyName: 'Company1',
      status: 1,
    });
  });
});
