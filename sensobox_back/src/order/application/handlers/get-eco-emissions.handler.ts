import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { CalculateEcoEmissionsQuery } from '../queries/get-eco-emissions.query'; // Actualizado
import { OrderRepository } from '../../infrastructure/persistence/order.repository'; // Actualizado
import { IOrder } from '../../domain/schemas/order.schema'; // Actualizado
import { Logger, InternalServerErrorException } from '@nestjs/common';
import { IUser } from '../../../auth/domain/schemas/user.schema';
import { UserRepository } from '../../../auth/infrastructure/persistence/user.repository';

@QueryHandler(CalculateEcoEmissionsQuery)
export class GetEcoEmissionsHandler implements IQueryHandler<CalculateEcoEmissionsQuery> {
  private readonly logger = new Logger(GetEcoEmissionsHandler.name);

  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly userRepository: UserRepository,
  ) { }

  async execute(query: CalculateEcoEmissionsQuery): Promise<IOrder[]> {
    const { companyName } = query;
    this.logger.log(`Fetching eco orders for company: ${companyName || 'all companies'}`);

    try {
      let users: IUser[];
      if (companyName) {
        // Si se proporciona un companyName en la consulta, filtramos los usuarios por companyName
        users = await this.userRepository.findUsersByCompanyName(companyName);
      } 
      // else {
      //   // Si no se proporciona companyName, obtenemos todos los usuarios
      //   users = await this.userRepository.findUsersRole();
      // }

      let ecoOrders: any[];
      if (companyName) {
        // Si se proporciona un companyName en la consulta, filtramos las órdenes por companyName
        ecoOrders = await this.orderRepository.getTotalQuantityByCompany(companyName);
      } 
      // else {
      //   // Si no se proporciona companyName, obtenemos todas las órdenes
      //   ecoOrders = await this.orderRepository.getTotalQuantityByCompany();
      // }

      // Manipular los resultados para agregar ecoEmissions y totalEmissions

      const results = ecoOrders.map(order => {
        const user = users.find(u => u.clientName === order.clientName);
        // //console.log(user,'233333',order)
        if (user) {
          order._id = user._id;
          order.eco = user.eco;
          order.ecoEmissions = user.ecoEmissions;
          order.totalEmissions = order.totalQuantity * user.ecoEmissions;
          return order;
        } else {
          return null; // Si no se encuentra el usuario, retornamos null
        }
      })
      .filter(order => order !== null); 
// console.log("333",results)
      this.logger.log(`Successfully fetched ${results.length} eco orders`);
      return results;
    } catch (error) {
      this.logger.error('Failed to fetch Orders', error.stack);
      throw new InternalServerErrorException('Failed to fetch eco orders');
    }
  }
}
