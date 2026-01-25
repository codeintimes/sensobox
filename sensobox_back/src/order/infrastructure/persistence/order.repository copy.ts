// import { Injectable } from '@nestjs/common';
// import { InjectRepository } from '@nestjs/typeorm';
// import { Repository } from 'typeorm';
// import { Order } from '../../domain/schemas/order.schema';
// import { IOrderRepository } from '../../domain/repositories/Iorder.repository';
// import { differenceInMilliseconds } from 'date-fns';
// import { v4 as uuidv4 } from 'uuid'; // Importa la función uuidv4

// @Injectable()
// export class OrderRepository implements IOrderRepository {
//   constructor(
//     @InjectRepository(Order)
//     private readonly orderRepository: Repository<Order>,
//   ) {}

//   async findAll(): Promise<Order[]> {
//     //console.log("await this.orderRepository.find()",await this.orderRepository.find())
//     return await this.orderRepository.find();
//   }

//   async findById(id: string): Promise<Order | undefined> {
//     return await this.orderRepository.findOne({ where: { id } });
//   }  

//   async orderExistsById(id: string): Promise<boolean> {
//     const order = await this.orderRepository.findOne({ where: { id } });
//     return !!order;
//   }

//   async create(orderData: Partial<Order>): Promise<Order> {
//     const newOrder = new Order();

//     // Genera un ID aleatorio utilizando uuidv4
//     newOrder.id = uuidv4();
//     //console.log("2222222222",newOrder.id)

//     // Asigna los datos de la orden
//     Object.assign(newOrder, orderData);

//     // Set default values for the process start, end, and rate calculations if not provided
//     // newOrder.initialQuantity = 0; // Default value, assume you might change this later.
//     // newOrder.finalQuantity = 0; // Default value, assume you might change this later.
//     // newOrder.quantityRate = 0; // Default or initial value, to be calculated later.
//     // newOrder.processingTimeRate = 0; // Default or initial value, to be calculated later.

//     // Guarda la nueva orden en la base de datos
//     await this.orderRepository.save(newOrder);

//     return newOrder;
//   }

//   async update(orderUpdate: Partial<Order> & { id: string }): Promise<Order | undefined> {
//     const { id, ...updateData } = orderUpdate;

//     const order = await this.orderRepository.findOne({ where: { id } });
//     if (!order) return undefined;

//     Object.assign(order, updateData);
  
//     await this.orderRepository.save(order);
//     return order;
//   }
  
//   async updateInitialProcess(id: string, initialProcessData: any): Promise<Order | undefined> {
//     const order = await this.orderRepository.findOne({ where: { id } });
//     if (!order) return undefined;
    
//     // Obtener la fecha de procesamiento actual del pedido
//     const processingDate = order.processingDate;
//     //console.log(order)
//     if (!processingDate) {
//         throw new Error('Processing date is missing for the order');
//     }
    
//     // Verificar si las fechas son válidas antes de calcular la diferencia
//     const processingDateInitial = new Date(initialProcessData.processingDateInitial);
//     if (isNaN(processingDateInitial.getTime())) {
//         throw new Error('Invalid date format for initial processing date');
//     }
    
//     // Calcular la diferencia en milisegundos y actualizar el registro
//     const timeDifference = differenceInMilliseconds(processingDate, processingDateInitial);
//     order.initialQuantity = initialProcessData.initialQuantity;
//     order.processingDateInitial = processingDateInitial;
//     order.processingDateRate = timeDifference;

//     await this.orderRepository.save(order);
//     return order;
//   }


//   async updateFinalProcess(id: string, finalProcessData: { finalQuantity: number; processingDateFinal: Date; quantityRate: number; processingTimeRate: number; processingTimeFinal: number; processingTimeDiffrence: number; finalQuantityDifference: number;  }): Promise<Order | undefined> {
//     const order = await this.orderRepository.findOne({ where: { id } });
//     if (!order) return undefined;

//     // Asume que `finalProcessData` ya incluye `quantityRate` y `processingTimeRate` calculados en el handler.
//     // Actualiza los datos relevantes de la orden, incluyendo los rates.
//     order.finalQuantity = finalProcessData.finalQuantity;
//     order.processingDateFinal = finalProcessData.processingDateFinal;
//     order.quantityRate = finalProcessData.quantityRate;
//     order.processingTimeRate = finalProcessData.processingTimeRate;
//     order.processingTimeFinal = finalProcessData.processingTimeFinal;
//     order.processingTimeDifference = finalProcessData.processingTimeDiffrence;
//     order.finalQuantityDifference = finalProcessData.finalQuantityDifference;

//     await this.orderRepository.save(order);
//     return order;
//   }
  
  
//   async delete(id: string): Promise<boolean> {
//     const result = await this.orderRepository.delete(id);
//     return result.affected > 0;
//   }

//   async findPendingOrders(): Promise<Order[]> {
//     return await this.orderRepository.find({ where: { status: 1 } });
//   }
// }
