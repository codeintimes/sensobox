import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { OrderModel, IOrder } from '../../domain/schemas/order.schema';
import { GetPendingOrdersFromQuery } from '../queries/get-pending-orders.query';
import { OrderStatisticsDTO } from '../dto/order-statistics.dto';

@QueryHandler(GetPendingOrdersFromQuery)
@Injectable()
export class GetPendingOrdersHandler implements IQueryHandler<GetPendingOrdersFromQuery> {
  constructor(
    @InjectModel('Order') private readonly orderModel: Model<IOrder>
  ) {}

  async execute(query: GetPendingOrdersFromQuery): Promise<OrderStatisticsDTO> {
    const { companyName } = query; // Obtén el companyName del query
    const currentDate = new Date();
//console.log("companyName",companyName)
    // Filtra las órdenes pendientes por companyName
    const orders = await this.orderModel.find({
      companyName: companyName,
      status: 1
    }).exec();
    //console.log("orders",orders[0],currentDate)
    // Filtra las órdenes pendientes donde processingDate está en el futuro y por companyName

    // Filtrar las órdenes pendientes con fecha de procesamiento posterior a la fecha actual
    const allPending = orders.filter(order => new Date(order.processingDate) > currentDate);
    
    // Filtrar las órdenes pendientes con fecha de procesamiento anterior a la fecha actual
    const futurePending = orders.filter(order => new Date(order.processingDate) < currentDate);
    const statistics = new OrderStatisticsDTO();
    statistics.allPending = allPending;
    statistics.futurePending = futurePending;

    return statistics;
  }
}
