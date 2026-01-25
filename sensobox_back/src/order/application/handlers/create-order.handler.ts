import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateOrderCommand } from '../commands/create-order.command';
import { OrderRepository } from '../../infrastructure/persistence/order.repository';
import { Logger, InternalServerErrorException, ConflictException } from '@nestjs/common';

@CommandHandler(CreateOrderCommand)
export class CreateOrderHandler implements ICommandHandler<CreateOrderCommand> {
    private readonly logger = new Logger(CreateOrderHandler.name);

    constructor(private readonly orderRepository: OrderRepository) {}

    async execute(command: CreateOrderCommand): Promise<void> {
        const { orderDto } = command;
        this.logger.log('Attempting to create a new Order');
        
        try {
            const orderExists = await this.orderRepository.orderExistsByOrderNumber(orderDto.orderNumber, orderDto.companyName);
            if (orderExists) {
                this.logger.error(`Order with order number ${orderDto.orderNumber} already exists for company ${orderDto.companyName}.`);
                throw new ConflictException(`Order with order number ${orderDto.orderNumber} already exists for this company.`);
            }

            const orderData = {
                ...orderDto,
                companyName: orderDto.companyName // Add companyName to the order data
            };
            console.log("orderData",orderData)
            await this.orderRepository.create(orderData);
            this.logger.log('New Order successfully created');
        } catch (error) {
            if (!(error instanceof ConflictException)) {
                this.logger.error('Unexpected error during Order creation', error.stack);
                throw new InternalServerErrorException('Unexpected error occurred during Order creation');
            }
            throw error;
        }
    }
}
