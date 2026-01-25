// import { DataSource } from 'typeorm';
// import { User } from '../auth/domain/schemas/user.schema';
// import { Order } from '../order/domain/schemas/order.schema';
// import { join } from 'path';

// const AppDataSource = new DataSource({
//   type: 'mongodb',
//   host: process.env.MONGODB_HOST, 
//   port: parseInt(process.env.MONGODB_PORT), 
//   username: "", 
//   password: "", 
//   database: process.env.MONGODB_DATABASE,
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
//   logging: false,
//   entities: [User, Order],
//   synchronize: true, // Cuidado con esta opción en producción
//   migrations: [join(__dirname, '/../../', 'database/migrations/**/*{.ts,.js}')],
//   migrationsTableName: 'migrations', // Asegúrate de tener esto bien configurado para MongoDB
//   migrationsRun: true,
// });

// export default AppDataSource;

