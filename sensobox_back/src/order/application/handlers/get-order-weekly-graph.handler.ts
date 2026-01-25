import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { OrderModel, IOrder } from '../../domain/schemas/order.schema';
import { GetWeeklyOrderGraphQuery } from '../queries/get-order-weekly-graph.query';
import { OrderStatsDTO } from '../dto/order-stats.dto';

@QueryHandler(GetWeeklyOrderGraphQuery)
export class GetWeeklyOrderGraphHandler implements IQueryHandler<GetWeeklyOrderGraphQuery> {
  constructor(
    @InjectModel('Order') private readonly orderModel: Model<IOrder>
  ) {}

  async execute(query: GetWeeklyOrderGraphQuery): Promise<any[]> {
    const { companyName } = query; // Obtén el companyName de la consulta

    const fromDate = new Date();
    fromDate.setFullYear(fromDate.getFullYear() - 1);

    // Agrupa los pedidos por semanas y cuenta los pedidos de cada semana
    const groupedOrders = await this.orderModel.aggregate([
      {
        $match: {
          createdAt: { $gte: fromDate }, // Filtra para obtener pedidos desde el año pasado hasta ahora
          companyName: companyName // Filtra por companyName
        }
      },
      {
        $group: {
          _id: {
            // Agrupa por año y semana
            year: { $year: "$createdAt" },
            week: { $week: "$createdAt" }
          },
          ordersNumber: { $sum: 1 }, // Cuenta los pedidos por grupo
          createdAt: { $first: "$createdAt" } // Mantiene la fecha del primer pedido del grupo
        }
      },
      {
        $sort: { "_id.year": 1, "_id.week": 1 } // Ordena los resultados por año y semana
      }
    ]);

    // Mapea los resultados al DTO esperado
    return groupedOrders.map(order => ({
      ordersNumber: order.ordersNumber,
      createdAt: order.createdAt.toISOString(), // Transforma la fecha a ISO string
    }));
  }
}
