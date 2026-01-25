import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CqrsModule } from '@nestjs/cqrs';
import { OrderModel, IOrder, OrderSchema } from './domain/schemas/order.schema';
import { OrderController } from './infrastructure/api/order.controller';
import { OrderRepository } from './infrastructure/persistence/order.repository';
import { CreateOrderHandler } from './application/handlers/create-order.handler';
import { GetAllOrdersHandler } from './application/handlers/get-all-orders.handler';
import { GetOrderByIdHandler } from './application/handlers/get-order-by-id.handler';
import { UpdateOrderHandler } from './application/handlers/update-order.handler';
import { DeleteOrderHandler } from './application/handlers/delete-order.handler';
import { GetOrderStatsHandler } from './application/handlers/get-order-stats.handler';
import { GetWeeklyOrderGraphHandler } from './application/handlers/get-order-weekly-graph.handler';

import { UpdateOpiInitialHandler } from './application/handlers/update-opi-initial.handler';
import { UpdateOpiFinalHandler } from './application/handlers/update-opi-final.handler';
import { GetOrderProcessingStatsHandler } from './application/handlers/get-order-processing-stats.handler';
import { GetOrderStatsLastMonthHandler } from './application/handlers/get-order-stats-last-month.handler';
import { GetOrderStatsLastYearHandler } from './application/handlers/get-order-stats-last-year.handler';
import { GetPendingOrdersHandler } from './application/handlers/get-pending-orders.handler';
import { GeneratePdfHandler } from './application/handlers/get-generate-pdf.handler';
import { GetEcoEmissionsHandler } from './application/handlers/get-eco-emissions.handler';
//  import { DatabaseModule } from './infrastructure/config/database.module';
// import { DatabaseModule } from '../config/database.module';
import { AuthModule as UserModule } from '../auth/auth.module'; // Importa el módulo que contiene UserRepository
// import { UserRepository } from '../auth/infrastructure/persistence/user.repository'; // Asegúrate de importar UserRepository desde su ubicación correcta
import { UpdateMaterialInfoHandler } from './application/handlers/update-material-info.handler'; // Importa el nuevo manejador
import { UpdateQuantityProcessedHandler } from './application/handlers/update-quantity-processed.handler';
import { GetOrdersByCompanyNameHandler } from './application/handlers/get-orders-by-company-name.handler';
import { GetAllOrdersTechnicianHandler } from './application/handlers/get-all-orders-technician.handler';

//console.log("'Order'",'Order')
// const MONGO_URI = "mongodb://localhost:27017/sensobox"
import * as dotenv from 'dotenv';
dotenv.config();
const MONGO_URI = process.env.MONGODB_URL
// const MONGO_URI = "mongodb+srv://ortirafael8:4Af3QWOC90uEbExk@cluster0.l7wwmea.mongodb.net/sensobox?retryWrites=true&w=majority&appName=Cluster0/sensobox";
@Module({
  imports: [
    MongooseModule.forRoot(MONGO_URI),
    MongooseModule.forFeature([{ name: 'Order', schema: OrderSchema }]),
    CqrsModule,
    UserModule,
    // DatabaseModule,
  ],
  controllers: [OrderController],
  providers: [
    OrderRepository,
    CreateOrderHandler,
    GetAllOrdersHandler,
    GetOrderByIdHandler,
    UpdateOrderHandler,
    UpdateOpiInitialHandler,
    UpdateOpiFinalHandler,
    GetOrderStatsHandler,
    DeleteOrderHandler,
    GetOrderProcessingStatsHandler,
    GetOrderStatsLastMonthHandler,
    GetOrderStatsLastYearHandler,
    GetPendingOrdersHandler,
    GetWeeklyOrderGraphHandler,
    GeneratePdfHandler,
    GetEcoEmissionsHandler,
    UpdateMaterialInfoHandler,
    UpdateQuantityProcessedHandler,
    GetOrdersByCompanyNameHandler,
    GetAllOrdersTechnicianHandler,
  ],
})
export class OrderModule {}
