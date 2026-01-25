// src/orders/repositories/Iorder.repository.ts

import { IOrder } from '../schemas/order.schema';

export interface IOrderRepository {
  findAll(): Promise<IOrder[]>;
  findById(id: string): Promise<IOrder | null>;
  orderExistsById(id: string): Promise<boolean>;
  create(orderData: {
    orderNumber: number;
    clientName: string;
    workName: string;
    workType: string;
    productionQuantity: number;
    colors: string;
    processes: string;
    specialFinishes: string;
    palletsNumber?: number;
    technician: string;
    processingDate?: Date;
    processingTime?: number;
  }): Promise<IOrder>;
  update(id: string, updateData: Partial<IOrder>): Promise<IOrder | null>; 
  delete(id: string): Promise<boolean>;
  findPendingOrders(): Promise<IOrder[]>;
  updateInitialProcess(id: string, initialProcessData: any): Promise<IOrder | null>;
  updateFinalProcess(id: string, finalProcessData: {
    finalQuantity: number;
    processingDateFinal: Date;
    quantityRate: number;
    processingTimeRate: number;
    processingTimeFinal: number;
    processingTimeDiffrence: number;
    finalQuantityDifference: number;
  }): Promise<IOrder | null>;
  updateMaterialInfo(id: string, updateData: {
    materialWeight: number;
    materialArea: number;
  }): Promise<IOrder | null>;
  getTotalQuantityByCompany(): Promise<any[]>;
}
