
import { IOrderRepository } from '../../domain/repositories/Iorder.repository';
import { differenceInMilliseconds } from 'date-fns';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { OrderModel, IOrder } from '../../domain/schemas/order.schema';
import { FilterQuery } from 'mongoose';


@Injectable()
export class OrderRepository implements IOrderRepository {
  constructor(
    @InjectModel('Order') private orderModel: Model<IOrder>
  ) { }

  // async findAll(): Promise<IOrder[]> {
  //   //console.log(this.orderModel.find().exec(), "eeeeee")
  //   return this.orderModel.find().exec();
  // }

  async findAll(filters?: Partial<IOrder>): Promise<IOrder[]> {
    const filterQuery: FilterQuery<IOrder> = {};
    if (filters) {
      // Filtrar solo las claves definidas en filters y asignarlas a filterQuery
      Object.keys(filters).forEach(key => {
        filterQuery[key as keyof IOrder] = filters[key] as any;
      });
    }
    return this.orderModel.find(filterQuery).sort({ createdAt: -1 }).exec();
  }

  async findById(id: string): Promise<IOrder | null> {
    return this.orderModel.findById(id).exec();
  }

  async orderExistsById(id: string): Promise<boolean> {
    const count = await this.orderModel.countDocuments({ _id: id }).exec();
    return count > 0;
  }

  async create(orderData: Partial<IOrder>): Promise<IOrder> {
    //console.log("Creating order:", orderData);
    const newOrder = await this.orderModel.create(orderData);
    //console.log("Order created:", newOrder);
    return newOrder;
  }

  async update(id: string, updateData: Partial<IOrder>): Promise<IOrder | null> {
    const updatedOrder = await this.orderModel.findByIdAndUpdate(id, { $set: updateData }, { new: true }).exec();
    return updatedOrder;
  }  

  async updateInitialProcess(id: string, initialProcessData: any): Promise<IOrder | null> {
    if (isNaN(new Date(initialProcessData.processingDateInitial).getTime())) {
      throw new Error('Invalid date format for initial processing date');
    }
    const updatedOrder = await this.orderModel.findByIdAndUpdate(id, {
      $set: {
        initialQuantity: initialProcessData.initialQuantity,
        processingDateInitial: initialProcessData.processingDateInitial,
        status: 2
        // processingDateRate: differenceInMilliseconds(new Date(), new Date(initialProcessData.processingDateInitial))
      }
    }, { new: true }).exec();

    return updatedOrder;
  }

  async updateFinalProcess(id: string, finalProcessData: any): Promise<IOrder | null> {
    const updatedOrder = await this.orderModel.findByIdAndUpdate(id, {
      $set: {
        ...finalProcessData,
        status: 3
      }
    }, { new: true }).exec();
  
    return updatedOrder;
  }
  

  async updateMaterialInfo(id: string, update: { materialWeight: number; materialArea: number; }): Promise<IOrder | null> {
    //console.log(update)
    const updatedOrder = await OrderModel.findByIdAndUpdate(id, {
      $set: {
        materialWeight: update.materialWeight,
        materialArea: update.materialArea
      }
    }, { new: true }).exec();
    

    return updatedOrder;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.orderModel.deleteOne({ _id: id }).exec();
    return result.deletedCount > 0;
  }

  async findPendingOrders(): Promise<IOrder[]> {
    return this.orderModel.find({ status: 1 }).exec();
  }

  async orderExistsByOrderNumber(orderNumber: number, companyName: string): Promise<boolean> {
    const count = await this.orderModel.countDocuments({ orderNumber: orderNumber, companyName: companyName }).exec();
    return count > 0;
  }

  async getTotalQuantityByCompany(companyName?: string): Promise<any[]> {
    const aggregationPipeline: any[] = [
      {
        $group: {
          _id: '$clientName',
          totalQuantity: { $sum: '$productionQuantity' }
        }
      },
      {
        $addFields: {
          clientName: '$_id', // Cambiar el nombre del campo _id a companyName
          _id: 0 // Eliminar el campo _id original
        }
      }
    ];
  
    if (companyName) {
      // Agregar etapa $match para filtrar por companyName si se proporciona
      const matchStage: FilterQuery<any> = { companyName };
      aggregationPipeline.unshift({ $match: matchStage });
    }
  
    const formattedResults = await this.orderModel.aggregate(aggregationPipeline);
    // //console.log("formattedResults",formattedResults)
    return formattedResults;
  }
}
