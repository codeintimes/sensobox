import { Test, TestingModule } from '@nestjs/testing';
import { GetEcoEmissionsHandler } from './get-eco-emissions.handler';
import { CalculateEcoEmissionsQuery } from '../queries/get-eco-emissions.query';
import { OrderRepository } from '../../infrastructure/persistence/order.repository';
import { UserRepository } from '../../../auth/infrastructure/persistence/user.repository';
import { Logger, InternalServerErrorException } from '@nestjs/common';
import { IOrder } from '../../domain/schemas/order.schema';
import { IUser } from '../../../auth/domain/schemas/user.schema';

describe('GetEcoEmissionsHandler', () => {
  let handler: GetEcoEmissionsHandler;
  let orderRepository: OrderRepository;
  let userRepository: UserRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetEcoEmissionsHandler,
        {
          provide: OrderRepository,
          useValue: {
            getTotalQuantityByCompany: jest.fn(),
          },
        },
        {
          provide: UserRepository,
          useValue: {
            findUsersByCompanyName: jest.fn(),
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

    handler = module.get<GetEcoEmissionsHandler>(GetEcoEmissionsHandler);
    orderRepository = module.get<OrderRepository>(OrderRepository);
    userRepository = module.get<UserRepository>(UserRepository);
  });

  it('should fetch eco orders for a specific company successfully', async () => {
    const query = new CalculateEcoEmissionsQuery('Company1');
    const mockUsers: IUser[] = [
      { _id: '1', clientName: 'Client1', companyName: 'Company1', eco: true, ecoEmissions: 2 } as IUser
    ];
    const mockOrders: any[] = [
      { clientName: 'Client1', totalQuantity: 100 }
    ];

    jest.spyOn(userRepository, 'findUsersByCompanyName').mockResolvedValue(mockUsers);
    jest.spyOn(orderRepository, 'getTotalQuantityByCompany').mockResolvedValue(mockOrders);

    const result = await handler.execute(query);

    const expectedResult = [
      { _id: '1', clientName: 'Client1', totalQuantity: 100, eco: true, ecoEmissions: 2, totalEmissions: 200 }
    ];

    expect(result).toEqual(expectedResult);
    expect(userRepository.findUsersByCompanyName).toHaveBeenCalledWith('Company1');
    expect(orderRepository.getTotalQuantityByCompany).toHaveBeenCalledWith('Company1');
    expect(Logger.prototype.log).toHaveBeenCalledWith('Fetching eco orders for company: Company1');
    expect(Logger.prototype.log).toHaveBeenCalledWith('Successfully fetched 1 eco orders');
  });

  it('should handle internal server errors gracefully', async () => {
    const query = new CalculateEcoEmissionsQuery('Company1');

    jest.spyOn(userRepository, 'findUsersByCompanyName').mockRejectedValue(new Error('Unexpected error'));

    await expect(handler.execute(query)).rejects.toThrow(InternalServerErrorException);
    expect(Logger.prototype.error).toHaveBeenCalledWith('Failed to fetch Orders', expect.any(Error));
  });
});
