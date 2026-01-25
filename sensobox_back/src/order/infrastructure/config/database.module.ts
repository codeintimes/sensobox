// import { Module } from '@nestjs/common';
// import { MongooseModule } from '@nestjs/mongoose';
//  // Importa el esquema y el modelo de User
//  // Importa el esquema y el modelo de Order
// import { OrderSchema } from '../../domain/schemas/order.schema';
// // Utiliza variables de entoimport { Order } from '../order/domain/schemas/order.schema';rno para configurar la URI de MongoDB
// // const MONGO_URI = `mongodb://${process.env.MONGODB_HOST}:${process.env.MONGODB_PORT || 27017}/${process.env.MONGODB_DATABASE}`;


// const MONGO_URI = "mongodb://localhost:27017/sensobox"
// @Module({
//   imports: [
//     MongooseModule.forRoot(MONGO_URI, {
//     }),
//     MongooseModule.forFeature([
//       { name: 'Order', schema: OrderSchema }, // Registra el esquema de Order
//     ]),
//   ],
  
// })
// export class DatabaseModule {}