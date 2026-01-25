import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { OrderModel, IOrder } from '../../domain/schemas/order.schema';
import { GetOrderStatsLastYearQuery } from '../queries/get-order-stats-last-year.query';
import { OrderStatisticsDTO } from '../dto/order-statistics.dto';

@QueryHandler(GetOrderStatsLastYearQuery)
export class GetOrderStatsLastYearHandler implements IQueryHandler<GetOrderStatsLastYearQuery> {
  constructor(
    @InjectModel('Order') private readonly orderModel: Model<IOrder>
  ) {}

  async execute(query: GetOrderStatsLastYearQuery): Promise<OrderStatisticsDTO> {
    const { companyName } = query; // Obtiene el companyName del query

    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    // Filtra las órdenes por companyName y la fecha del último año
    const orders = await this.orderModel.find({
      companyName: companyName,
      createdAt: { $gt: oneYearAgo }
    }).exec();

    const aggregatedResults = await this.orderModel.aggregate([
      { $match: { companyName: companyName, createdAt: { $gt: oneYearAgo } } }, // Filtra por companyName y la fecha del último año
      {
        $facet: {
          totalOrdersByCompany: [
            {
              $group: {
                _id: "$clientName",
                totalOrders: { $sum: 1 }
              }
            },
            { $sort: { totalOrders: -1 } },
            { $limit: 7 }
          ],
          totalProductionByCompany: [
            {
              $group: {
                _id: "$clientName",
                totalProductionQuantity: { $sum: "$productionQuantity" }
              }
            },
            { $sort: { totalProductionQuantity: -1 } },
            { $limit: 7 }
          ]
        }
      }
    ]).exec();

//console.log("aggregatedResults[0].totalOrdersByCompany",aggregatedResults[0].totalOrdersByCompany)
    // Extracting results from the facets
    const totalOrdersByCompany = aggregatedResults[0].totalOrdersByCompany.map(item => ({
      id: item._id,
      label: item.clientName,
      value: item.totalOrders
    }));
    //console.log("totalProductionByCompany1", aggregatedResults[0].totalProductionByCompany)
    const totalProductionByCompany = aggregatedResults[0].totalProductionByCompany.map(item => ({
      id: item._id,
      label: item._id,
      value: item.totalProductionQuantity
    }));

    //console.log("totalProductionByCompany2", orders)

    const statistics = new OrderStatisticsDTO();
    statistics.totalOrdersByCompany = totalOrdersByCompany,
    statistics.totalProductionByCompany = totalProductionByCompany
    statistics.totalProductionQuantityLastYear = orders.reduce((sum, order) => sum + order.productionQuantity, 0) / 12  || 0;
    statistics.orderCountLastYear = orders.length / 12  || 0;
    statistics.totalProcessingTimeDifferenceLastYear = orders.reduce((sum, order) => sum + (order.processingTimeDifference || 0), 0)  / orders.length  || 0;
    statistics.totalFinalQuantityDifferenceLastYear = orders.reduce((sum, order) => sum + (order.finalQuantityDifference || 0), 0) / orders.length  || 0;
    // statistics.totalProcessingDateDifferenceLastYear = orders.reduce((sum, order) => sum + (order.processingDateRate || 0), 0) / orders.length;

    return statistics;
  }
}
