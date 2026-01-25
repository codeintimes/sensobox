import { Test, TestingModule } from '@nestjs/testing';
import { CreateOrderHandler } from './create-order.handler';
import { OrderRepository } from '../../infrastructure/persistence/order.repository';
import { CreateOrderCommand } from '../commands/create-order.command';
import { ConflictException, InternalServerErrorException } from '@nestjs/common';
import { OrderDto } from '../dto/order.dto';

describe('CreateOrderHandler', () => {
  let handler: CreateOrderHandler;
  let repository: OrderRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateOrderHandler,
        {
          provide: OrderRepository,
          useValue: {
            orderExistsByOrderNumber: jest.fn(),
            create: jest.fn(),
          },
        },
      ],
    }).compile();

    handler = module.get<CreateOrderHandler>(CreateOrderHandler);
    repository = module.get<OrderRepository>(OrderRepository);
  });

  it('should create a new order successfully', async () => {
    const orderDto: OrderDto = {
      orderNumber: 123,
      clientName: 'Test Client',
      companyName: 'Test Company',
      workName: 'Test Job',
      workType: 'Type A',
      productionQuantity: 100,
      colors: 'Red, Blue',
      processes: 'Process 1, Process 2',
      specialFinishes: 'Finish 1, Finish 2',
      palletsNumber: 5,
      technician: 'John Doe',
      processingDate: new Date(),
      processingTime: 120,
      materialArea: 50,
      materialWeight: 30,
      quantityProcessed: 0
    };
    const command = new CreateOrderCommand(orderDto);

    (repository.orderExistsByOrderNumber as jest.Mock).mockResolvedValue(false);

    await handler.execute(command);

    expect(repository.orderExistsByOrderNumber).toHaveBeenCalledWith(orderDto.orderNumber, orderDto.companyName);
    expect(repository.create).toHaveBeenCalledWith(expect.objectContaining(orderDto));
  });

  it('should throw ConflictException if order already exists', async () => {
    const orderDto: OrderDto = {
      orderNumber: 123,
      clientName: 'Test Client',
      companyName: 'Test Company',
      workName: 'Test Job',
      workType: 'Type A',
      productionQuantity: 100,
      colors: 'Red, Blue',
      processes: 'Process 1, Process 2',
      specialFinishes: 'Finish 1, Finish 2',
      palletsNumber: 5,
      technician: 'John Doe',
      processingDate: new Date(),
      processingTime: 120,
      materialArea: 50,
      materialWeight: 30,
      quantityProcessed: 0
    };
    const command = new CreateOrderCommand(orderDto);

    (repository.orderExistsByOrderNumber as jest.Mock).mockResolvedValue(true);

    await expect(handler.execute(command)).rejects.toThrow(ConflictException);
    expect(repository.orderExistsByOrderNumber).toHaveBeenCalledWith(orderDto.orderNumber, orderDto.companyName);
    expect(repository.create).not.toHaveBeenCalled();
  });

  it('should throw InternalServerErrorException on unexpected error', async () => {
    const orderDto: OrderDto = {
      orderNumber: 123,
      clientName: 'Test Client',
      companyName: 'Test Company',
      workName: 'Test Job',
      workType: 'Type A',
      productionQuantity: 100,
      colors: 'Red, Blue',
      processes: 'Process 1, Process 2',
      specialFinishes: 'Finish 1, Finish 2',
      palletsNumber: 5,
      technician: 'John Doe',
      processingDate: new Date(),
      processingTime: 120,
      materialArea: 50,
      materialWeight: 30,
      quantityProcessed: 0
    };
    const command = new CreateOrderCommand(orderDto);

    (repository.orderExistsByOrderNumber as jest.Mock).mockRejectedValue(new Error('Unexpected error'));

    await expect(handler.execute(command)).rejects.toThrow(InternalServerErrorException);
    expect(repository.orderExistsByOrderNumber).toHaveBeenCalledWith(orderDto.orderNumber, orderDto.companyName);
    expect(repository.create).not.toHaveBeenCalled();
  });
});
