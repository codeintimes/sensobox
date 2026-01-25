import { Test, TestingModule } from '@nestjs/testing';
import { GetAllUsersRoleHandler } from './get-all-users-role.handler';
import { GetAllUsersRoleQuery } from '../queries/get-all-users-role.query';
import { UserRepository } from '../../infrastructure/persistence/user.repository';
import { IUser } from '../../domain/schemas/user.schema';
import { Logger, InternalServerErrorException } from '@nestjs/common';

describe('GetAllUsersRoleHandler', () => {
  let handler: GetAllUsersRoleHandler;
  let userRepository: UserRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetAllUsersRoleHandler,
        {
          provide: UserRepository,
          useValue: {
            findLevelUsers: jest.fn(), // Creamos un mock para el método findLevelUsers
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

    handler = module.get<GetAllUsersRoleHandler>(GetAllUsersRoleHandler);
    userRepository = module.get<UserRepository>(UserRepository);
  });

  it('should return users for a given role and company name', async () => {
    const query = new GetAllUsersRoleQuery('admin', 'valid-company');
    const mockUsers: Partial<IUser>[] = [
      {
        id: '1',
        email: 'admin1@example.com',
        name: 'Admin1',
        clientName: 'Client1',
        companyName: 'valid-company',
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
        email: 'tech1@example.com',
        name: 'Tech1',
        clientName: 'Client2',
        companyName: 'valid-company',
        role: 'technician',
        eco: true,
        ecoEmissions: 100,
        password: 'password2',
        contactName: 'Contact2',
        contactPhone: '987654321',
        contactEmail: 'contact2@example.com',
      },
    ];
    jest.spyOn(userRepository, 'findLevelUsers').mockResolvedValue(mockUsers as IUser[]);

    const result = await handler.execute(query);
    expect(result).toEqual(mockUsers);
    expect(userRepository.findLevelUsers).toHaveBeenCalledWith('admin', 'valid-company');
  });

  it('should return users for a given role without company name', async () => {
    const query = new GetAllUsersRoleQuery('admin', undefined);
    const mockUsers: Partial<IUser>[] = [
      {
        id: '1',
        email: 'admin1@example.com',
        name: 'Admin1',
        clientName: 'Client1',
        companyName: 'company1',
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
        email: 'tech1@example.com',
        name: 'Tech1',
        clientName: 'Client2',
        companyName: 'company2',
        role: 'technician',
        eco: true,
        ecoEmissions: 100,
        password: 'password2',
        contactName: 'Contact2',
        contactPhone: '987654321',
        contactEmail: 'contact2@example.com',
      },
    ];
    jest.spyOn(userRepository, 'findLevelUsers').mockResolvedValue(mockUsers as IUser[]);

    const result = await handler.execute(query);
    expect(result).toEqual(mockUsers);
    expect(userRepository.findLevelUsers).toHaveBeenCalledWith('admin');
  });

  it('should throw InternalServerErrorException if an error occurs', async () => {
    const query = new GetAllUsersRoleQuery('admin', 'valid-company');
    jest.spyOn(userRepository, 'findLevelUsers').mockRejectedValue(new Error('Some error'));

    await expect(handler.execute(query)).rejects.toThrow(InternalServerErrorException);
    expect(userRepository.findLevelUsers).toHaveBeenCalledWith('admin', 'valid-company');
  });
});
