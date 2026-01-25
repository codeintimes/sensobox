import { Test, TestingModule } from '@nestjs/testing';
import { DeleteOrderHandler } from './delete-order.handler';
import { OrderRepository } from '../../infrastructure/persistence/order.repository';
import { DeleteOrderCommand } from '../commands/delete-order.command';
import { NotFoundException, InternalServerErrorException } from '@nestjs/common';

describe('DeleteOrderHandler', () => {
  let handler: DeleteOrderHandler;
  let repository: OrderRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteOrderHandler,
        {
          provide: OrderRepository,
          useValue: {
            orderExistsById: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    handler = module.get<DeleteOrderHandler>(DeleteOrderHandler);
    repository = module.get<OrderRepository>(OrderRepository);
  });

  it('should delete an order successfully', async () => {
    const id = '123';
    const command = new DeleteOrderCommand(id);

    (repository.orderExistsById as jest.Mock).mockResolvedValue(true);
    (repository.delete as jest.Mock).mockResolvedValue(true);

    await handler.execute(command);

    expect(repository.orderExistsById).toHaveBeenCalledWith(id);
    expect(repository.delete).toHaveBeenCalledWith(id);
  });

  it('should throw NotFoundException if order does not exist', async () => {
    const id = '123';
    const command = new DeleteOrderCommand(id);

    (repository.orderExistsById as jest.Mock).mockResolvedValue(false);

    await expect(handler.execute(command)).rejects.toThrow(NotFoundException);
    expect(repository.orderExistsById).toHaveBeenCalledWith(id);
    expect(repository.delete).not.toHaveBeenCalled();
  });

  it('should throw InternalServerErrorException on deletion failure', async () => {
    const id = '123';
    const command = new DeleteOrderCommand(id);

    (repository.orderExistsById as jest.Mock).mockResolvedValue(true);
    (repository.delete as jest.Mock).mockResolvedValue(false);

    await expect(handler.execute(command)).rejects.toThrow(InternalServerErrorException);
    expect(repository.orderExistsById).toHaveBeenCalledWith(id);
    expect(repository.delete).toHaveBeenCalledWith(id);
  });

  it('should throw InternalServerErrorException on unexpected error', async () => {
    const id = '123';
    const command = new DeleteOrderCommand(id);

    (repository.orderExistsById as jest.Mock).mockResolvedValue(true);
    (repository.delete as jest.Mock).mockRejectedValue(new Error('Unexpected error'));

    await expect(handler.execute(command)).rejects.toThrow(InternalServerErrorException);
    expect(repository.orderExistsById).toHaveBeenCalledWith(id);
    expect(repository.delete).toHaveBeenCalledWith(id);
  });
});
