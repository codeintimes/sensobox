import { Test, TestingModule } from '@nestjs/testing';
import { GetAllOrdersTechnicianHandler } from './get-all-orders-technician.handler'; // Ajusta la ruta si es necesario
import { GetAllOrdersTechnicianQuery } from '../queries/get-all-orders-technician.query';
import { OrderRepository } from '../../infrastructure/persistence/order.repository';
import { Logger, InternalServerErrorException } from '@nestjs/common';
import { IOrder } from '../../domain/schemas/order.schema';

describe('GetAllOrdersTechnicianHandler', () => {
  let handler: GetAllOrdersTechnicianHandler;
  let orderRepository: OrderRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetAllOrdersTechnicianHandler,
        {
          provide: OrderRepository,
          useValue: {
            findAll: jest.fn(),
          },
        },
        {
          provide: Logger,
          useValue: {
            log: jest.fn(),
            error: jest.fn(),
          },
        },
      ],
    }).compile();

    handler = module.get<GetAllOrdersTechnicianHandler>(GetAllOrdersTechnicianHandler);
    orderRepository = module.get<OrderRepository>(OrderRepository);
  });

  it('should fetch all orders for a technician successfully', async () => {
    const query = new GetAllOrdersTechnicianQuery({ name: 'Tech1', companyName: 'Company1' });
    const mockOrders: IOrder[] = [{ id: '1', technician: 'Tech1', companyName: 'Company1' } as IOrder];

    jest.spyOn(orderRepository, 'findAll').mockResolvedValue(mockOrders);

    const result = await handler.execute(query);
    expect(result).toEqual(mockOrders);
    expect(orderRepository.findAll).toHaveBeenCalledWith({ technician: 'Tech1', companyName: 'Company1' });
    expect(Logger.prototype.log).toHaveBeenCalledWith('Fetching all Orders for technician: Tech1 from company: Company1');
    expect(Logger.prototype.log).toHaveBeenCalledWith('Successfully fetched 1 Orders for technician: Tech1');
  });

  it('should throw InternalServerErrorException on unexpected error', async () => {
    const query = new GetAllOrdersTechnicianQuery({ name: 'Tech1', companyName: 'Company1' });

    jest.spyOn(orderRepository, 'findAll').mockRejectedValue(new Error('Unexpected error'));

    await expect(handler.execute(query)).rejects.toThrow(InternalServerErrorException);
    expect(orderRepository.findAll).toHaveBeenCalledWith({ technician: 'Tech1', companyName: 'Company1' });
    expect(Logger.prototype.error).toHaveBeenCalledWith('Failed to fetch Orders', expect.any(Error));
  });
});
