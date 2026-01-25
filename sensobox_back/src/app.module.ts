// src/app.module.ts

import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
// import {OpiModule}  from './opi/opi.module'; // Asegúrate de que la ruta sea correcta
import { OrderModule } from './order/order.module'; // Asegúrate de que la ruta sea correcta

@Module({
  imports: [
    AuthModule,
    // OpiModule,
    OrderModule,
  ],
})
export class AppModule {}
