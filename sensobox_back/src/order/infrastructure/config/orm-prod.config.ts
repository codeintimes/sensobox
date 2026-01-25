// import { DataSource } from 'typeorm';
// import { Order } from '../../domain/schemas/order.schema';
// import { join } from 'path';

// const AppDataSource = new DataSource({
//   type: 'mysql',
//   host: process.env.MYSQL_HOST, 
//   port: parseInt(process.env.MYSQL_PORT), 
//   username: process.env.MYSQL_USERNAME, 
//   password: process.env.MYSQL_PASSWORD, 
//   database: process.env.MYSQL_DATABASE, 
//   logging: true,
//   entities: [Order],
//   synchronize: true,
//   migrations: [join(__dirname, '/../../', 'database/migrations/**/*{.ts,.js}')],
//   migrationsTableName: 'opi',
//   migrationsRun: true,
// });

// export default AppDataSource;
