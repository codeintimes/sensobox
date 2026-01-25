import { Test, TestingModule } from '@nestjs/testing';
import { GetAllUsersHandler } from './get-all-users.handler';
import { GetAllUsersQuery } from '../queries/get-all-users.query';
import { UserRepository } from '../../infrastructure/persistence/user.repository';
import { IUser } from '../../domain/schemas/user.schema';
import { Logger, InternalServerErrorException } from '@nestjs/common';

describe('GetAllUsersHandler', () => {
  let handler: GetAllUsersHandler;
  let userRepository: UserRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetAllUsersHandler,
        {
          provide: UserRepository,
          useValue: {
            findNonSuperAdminUsers: jest.fn(), // Creamos un mock para el método findNonSuperAdminUsers
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

    handler = module.get<GetAllUsersHandler>(GetAllUsersHandler);
    userRepository = module.get<UserRepository>(UserRepository);
  });

  it('should return non-superadmin users', async () => {
    const query = new GetAllUsersQuery();
    const mockUsers: Partial<IUser>[] = [
      {
        id: '1',
        email: 'user1@example.com',
        name: 'User1',
        clientName: 'Client1',
        companyName: 'Company1',
        role: 'admin',
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
        companyName: 'Company2',
        role: 'technician',
        eco: true,
        ecoEmissions: 100,
        password: 'password2',
        contactName: 'Contact2',
        contactPhone: '987654321',
        contactEmail: 'contact2@example.com',
      },
    ];
    jest.spyOn(userRepository, 'findNonSuperAdminUsers').mockResolvedValue(mockUsers as IUser[]);

    const result = await handler.execute(query);
    expect(result).toEqual(mockUsers);
    expect(userRepository.findNonSuperAdminUsers).toHaveBeenCalled();
  });

  it('should throw InternalServerErrorException if an error occurs', async () => {
    const query = new GetAllUsersQuery();
    jest.spyOn(userRepository, 'findNonSuperAdminUsers').mockRejectedValue(new Error('Some error'));

    await expect(handler.execute(query)).rejects.toThrow(InternalServerErrorException);
    expect(userRepository.findNonSuperAdminUsers).toHaveBeenCalled();
  });
});
