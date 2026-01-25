import { DataSource } from 'typeorm';
import { UserModel } from '../auth/domain/schemas/user.schema';
import { OrderModel } from '../order/domain/schemas/order.schema';
import { join } from 'path';

const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.MYSQL_HOST, 
  port: parseInt(process.env.MYSQL_PORT), 
  username: process.env.MYSQL_USERNAME, 
  password: process.env.MYSQL_PASSWORD, 
  database: process.env.MYSQL_DATABASE, 
  logging: false,
  entities: [UserModel,OrderModel],
  synchronize: true,
  migrations: [join(__dirname, '/../../', 'database/migrations/**/*{.ts,.js}')],
  migrationsTableName: 'user',
  migrationsRun: true,
});

export default AppDataSource;
