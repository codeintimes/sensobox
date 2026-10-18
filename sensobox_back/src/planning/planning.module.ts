import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OrderSchema } from '../order/domain/schemas/order.schema';
import { AuthModule } from '../auth/auth.module';
import { PlanningArticleSchema, PlanningCalendarSchema, PlanningOperationSchema, PlanningOrderSchema, PlanningResourceSchema } from './domain/schemas';
import { PlanningService } from './application/planning.service';
import { PlanningController } from './infrastructure/planning.controller';
import './i18n';

// Planifica: planificación de producción y capacidad dentro de Sensobox.
@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([
      { name: 'Order', schema: OrderSchema },
      { name: 'PlanningResource', schema: PlanningResourceSchema },
      { name: 'PlanningCalendar', schema: PlanningCalendarSchema },
      { name: 'PlanningArticle', schema: PlanningArticleSchema },
      { name: 'PlanningOrder', schema: PlanningOrderSchema },
      { name: 'PlanningOperation', schema: PlanningOperationSchema },
    ]),
  ],
  controllers: [PlanningController],
  providers: [PlanningService],
})
export class PlanningModule {}
