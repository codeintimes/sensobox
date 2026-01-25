// import { Module } from '@nestjs/common';
// import { MongooseModule } from '@nestjs/mongoose';
// // import { UserSchema } from '../../domain/schemas/user.schema'; // Importa el esquema y el modelo de User

// // Utiliza variables de entorno para configurar la URI de MongoDB
// // const MONGO_URI = `mongodb://${process.env.MONGODB_HOST}:${process.env.MONGODB_PORT || 27017}/${process.env.MONGODB_DATABASE}`;


// // src/domain/schemas/user.schema.ts
// import { Document, Schema, model } from 'mongoose';

// export interface IUser extends Document {
//   name: string;
//   email: string;
//   password: string;
//   role: string;
// }


// const UserSchema = new Schema<IUser>({
//   name: { type: String, required: true },
//   email: { type: String, required: true, unique: true },
//   password: { type: String, required: true },
//   role: { type: String, required: true }
// });




// const MONGO_URI = "mongodb://localhost:27017/sensobox/user"
// @Module({
//   imports: [
//     MongooseModule.forRoot(MONGO_URI, {
//     }),
//     MongooseModule.forFeature([
//       { name: 'User', schema: UserSchema }, // Registra el esquema de User
//     ]),
//   ],
  
// })
// export class DatabaseModule {}
