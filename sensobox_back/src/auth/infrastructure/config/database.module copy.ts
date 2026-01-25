// import { Module } from '@nestjs/common';
// import { MongooseModule } from '@nestjs/mongoose';
// import { UserSchema } from '../../domain/schemas/user.schema'; // Importa el esquema y el modelo de User

// // Utiliza variables de entorno para configurar la URI de MongoDB
// // const MONGO_URI = `mongodb://${process.env.MONGODB_HOST}:${process.env.MONGODB_PORT || 27017}/${process.env.MONGODB_DATABASE}`;


// const MONGO_URI = "mongodb://localhost:27017/sensobox"
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
