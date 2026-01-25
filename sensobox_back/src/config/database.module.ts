// // src/infrastructure/config/database.module.ts
// import { Module } from '@nestjs/common';
// import { MongooseModule } from '@nestjs/mongoose';
// import { OrderSchema } from '../order/domain/schemas/order.schema';
// // import { UserSchema } from '../auth/domain/schemas/user.schema';

// // src/domain/schemas/user.schema.ts
// import { Document, Schema, model } from 'mongoose';

// export interface IUser extends Document {
//   name: string;
//   email: string;
//   password: string;
//   role: string;
// }

// const UserSchema = new Schema<IUser>({
//     name: { type: String, required: true },
//     email: { type: String, required: true, unique: true },
//     password: { type: String, required: true },
//     role: { type: String, required: true }
//   });
  
  
// @Module({
//   imports: [
//     MongooseModule.forRoot("mongodb://localhost:27017/sensobox"),
//     MongooseModule.forFeature([
//       { name: 'Order', schema: OrderSchema },
//       { name: 'User', schema: UserSchema }
//     ]),
//   ],
// })
// export class DatabaseModule {}
