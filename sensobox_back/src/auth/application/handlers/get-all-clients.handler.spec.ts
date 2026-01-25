import { Test, TestingModule } from '@nestjs/testing';
import { GetAllClientsHandler } from './get-all-clients.handler';
import { GetAllClientsQuery } from '../queries/get-all-clients.query';
import { UserRepository } from '../../infrastructure/persistence/user.repository';
import { IUser } from '../../domain/schemas/user.schema';
import { Logger, InternalServerErrorException } from '@nestjs/common';

describe('GetAllClientsHandler', () => {
  let handler: GetAllClientsHandler;
  let userRepository: UserRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetAllClientsHandler,
        {
          provide: UserRepository,
          useValue: {
            findUsersRole: jest.fn(), // Creamos un mock para el método findUsersRole
          },
        },
        {
          provide: Logger,
          useValue: {
            log: jest.fn(),    // Creamos un mock para el método log del logger
            error: jest.fn(),  // Creamos un mock para el método error del logger
          },
        },
      ],
    }).compile();

    handler = module.get<GetAllClientsHandler>(GetAllClientsHandler);
    userRepository = module.get<UserRepository>(UserRepository);
  });

  it('should return users for a valid company name', async () => {
    const query = new GetAllClientsQuery('valid-company');
    const mockUsers: Partial<IUser>[] = [
      {
        id: '1',
        email: 'user1@example.com',
        name: 'User1',
        clientName: 'Client1',
        companyName: 'valid-company',
        role: 'client',
        eco: false,
        ecoEmissions: 50,
        password: 'password1',
        contactName: 'Contact1',
        contactPhone: '123456789',
        contactEmail: 'contact1@example.com',
      },
      {
        id: '2',
        email: 'user2@example.com',
        name: 'User2',
        clientName: 'Client2',
        companyName: 'valid-company',
        role: 'client',
        eco: true,
        ecoEmissions: 100,
        password: 'password2',
        contactName: 'Contact2',
        contactPhone: '987654321',
        contactEmail: 'contact2@example.com',
      },
    ];
    jest.spyOn(userRepository, 'findUsersRole').mockResolvedValue(mockUsers as IUser[]);

    const result = await handler.execute(query);
    expect(result).toEqual(mockUsers);
    expect(userRepository.findUsersRole).toHaveBeenCalledWith('valid-company');
  });

  it('should throw InternalServerErrorException if an error occurs', async () => {
    const query = new GetAllClientsQuery('valid-company');
    jest.spyOn(userRepository, 'findUsersRole').mockRejectedValue(new Error('Some error'));

    await expect(handler.execute(query)).rejects.toThrow(InternalServerErrorException);
    expect(userRepository.findUsersRole).toHaveBeenCalledWith('valid-company');
  });
});
