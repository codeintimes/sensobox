import { Test, TestingModule } from '@nestjs/testing';
import { UpdateOrderHandler } from './update-order.handler';
import { UpdateOrderCommand } from '../commands/update-order.command';
import { OrderRepository } from '../../infrastructure/persistence/order.repository';
import { Logger } from '@nestjs/common';
import { NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { OrderDto } from '../dto/order.dto';

describe('UpdateOrderHandler', () => {
  let handler: UpdateOrderHandler;
  let orderRepository: OrderRepository;
  let mockOrderRepository: Partial<OrderRepository>;

  beforeEach(async () => {
    // Mock OrderRepository methods
    mockOrderRepository = {
      orderExistsById: jest.fn().mockResolvedValue(true),
      update: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateOrderHandler,
        {
          provide: OrderRepository,
          useValue: mockOrderRepository,
        },
        {
          provide: Logger,
          useValue: new Logger(),
        },
      ],
    }).compile();

    handler = module.get<UpdateOrderHandler>(UpdateOrderHandler);
    orderRepository = module.get<OrderRepository>(OrderRepository);
  });

  it('should successfully update an order', async () => {
    const fullOrderDto = {
      orderNumber: 123,
      clientName: 'Client Name',
      companyName: 'Company Name',
      workName: 'Work Name',
      workType: 'Work Type',
      productionQuantity: 100,
      colors: 'Colors',
      processes: 'Processes',
      specialFinishes: 'Special Finishes',
      technician: 'Technician',
      quantityProcessed: 500, // your testing value
      // include other optional fields as needed or required by your DTO validation
    };
  
    const command = new UpdateOrderCommand('orderId', fullOrderDto as OrderDto);
    await handler.execute(command);
  
    expect(orderRepository.orderExistsById).toHaveBeenCalledWith('orderId');
    expect(orderRepository.update).toHaveBeenCalledWith('orderId', fullOrderDto);
    expect(orderRepository.update).toHaveBeenCalledTimes(1);
  });
  
  it('should throw NotFoundException if the order does not exist', async () => {
    jest.spyOn(mockOrderRepository, 'orderExistsById').mockResolvedValueOnce(false);
  
    const fullOrderDto = {
      orderNumber: 123,
      clientName: 'Client Name',
      companyName: 'Company Name',
      workName: 'Work Name',
      workType: 'Work Type',
      productionQuantity: 100,
      colors: 'Colors',
      processes: 'Processes',
      specialFinishes: 'Special Finishes',
      technician: 'Technician',
      quantityProcessed: 500, // your testing value
      // include other optional fields as needed or required by your DTO validation
    };
  
    const command = new UpdateOrderCommand('orderId', fullOrderDto as OrderDto);
  
    await expect(handler.execute(command)).rejects.toThrow(NotFoundException);
    expect(mockOrderRepository.orderExistsById).toHaveBeenCalledWith('orderId');
  });

  it('should handle unexpected errors during update', async () => {
    jest.spyOn(mockOrderRepository, 'orderExistsById').mockResolvedValueOnce(true); // Ensure the order is found first
    jest.spyOn(mockOrderRepository, 'update').mockRejectedValueOnce(new Error('Unexpected error'));
  
    const fullOrderDto = {
      orderNumber: 123,
      clientName: 'Client Name',
      companyName: 'Company Name',
      workName: 'Work Name',
      workType: 'Work Type',
      productionQuantity: 100,
      colors: 'Colors',
      processes: 'Processes',
      specialFinishes: 'Special Finishes',
      technician: 'Technician',
      quantityProcessed: 500, // your testing value
      // include other optional fields as needed or required by your DTO validation
    };
  
    const command = new UpdateOrderCommand('orderId', fullOrderDto as OrderDto);
  
    await expect(handler.execute(command)).rejects.toThrow(InternalServerErrorException);
    expect(mockOrderRepository.orderExistsById).toHaveBeenCalledWith('orderId');
    expect(mockOrderRepository.update).toHaveBeenCalledWith('orderId', fullOrderDto);
  });
  
});
