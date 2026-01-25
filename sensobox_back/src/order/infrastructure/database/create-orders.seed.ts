// // src/database/seeds/create-orders.seed.ts
// import { Factory, Seeder } from 'typeorm-seeding';
// import { Connection } from 'typeorm';
// import { Order } from '../../domain/schemas/order.schema';

// export default class CreateOrders implements Seeder {
//   public async run(factory: Factory, connection: Connection): Promise<any> {
//     await factory(Order)().createMany(50); // Genera 50 órdenes
//   }
// }
