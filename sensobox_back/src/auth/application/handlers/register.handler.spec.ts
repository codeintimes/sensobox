import { Test, TestingModule } from '@nestjs/testing';
import { RegisterHandler } from './register.handler';
import { RegisterCommand } from '../commands/register.command';
import { UserRepository } from '../../infrastructure/persistence/user.repository';
import { EventBus } from '@nestjs/cqrs';
import { Logger, ConflictException, InternalServerErrorException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { IUser } from '../../domain/schemas/user.schema';

describe('RegisterHandler', () => {
  let handler: RegisterHandler;
  let userRepository: UserRepository;
  let eventBus: EventBus;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RegisterHandler,
        {
          provide: UserRepository,
          useValue: {
            findByEmail: jest.fn(),
            createUser: jest.fn(),
          },
        },
        {
          provide: EventBus,
          useValue: {
            publish: jest.fn(),
          },
        },
        {
          provide: Logger,
          useValue: {
            log: jest.fn(),
            warn: jest.fn(),
            error: jest.fn(),
          },
        },
      ],
    }).compile();

    handler = module.get<RegisterHandler>(RegisterHandler);
    userRepository = module.get<UserRepository>(UserRepository);
    eventBus = module.get<EventBus>(EventBus);
  });

  it('should register a new user successfully', async () => {
    const command = new RegisterCommand(
      'User1', 'Company1', 'Client1', 'user1@example.com', 'password123', 'admin', 'Contact1', '123456789', 'contact1@example.com'
    );
    const hashedPassword = await bcrypt.hash('password123', 10);
    const mockUser: Partial<IUser> = {
      id: '1',
      name: 'User1',
      companyName: 'Company1',
      clientName: 'Client1',
      email: 'user1@example.com',
      password: hashedPassword,
      role: 'admin',
      contactName: 'Contact1',
      contactPhone: '123456789',
      contactEmail: 'contact1@example.com',
      eco: false,  // Añadir las propiedades faltantes
      ecoEmissions: 0,
    };

    jest.spyOn(userRepository, 'findByEmail').mockResolvedValue(null);
    jest.spyOn(userRepository, 'createUser').mockResolvedValue(mockUser as IUser);

    const result = await handler.execute(command);
    expect(result).toEqual(mockUser);
    expect(userRepository.findByEmail).toHaveBeenCalledWith('user1@example.com');
    expect(userRepository.createUser).toHaveBeenCalledWith({
      name: 'User1',
      companyName: 'Company1',
      clientName: 'Client1',
      email: 'user1@example.com',
      password: hashedPassword,
      role: 'admin',
      contactName: 'Contact1',
      contactPhone: '123456789',
      contactEmail: 'contact1@example.com',
      eco: false,
      ecoEmissions: 0,
    });
  });

  it('should throw ConflictException if email is already registered', async () => {
    const command = new RegisterCommand(
      'User1', 'Company1', 'Client1', 'user1@example.com', 'password123', 'admin', 'Contact1', '123456789', 'contact1@example.com'
    );

    jest.spyOn(userRepository, 'findByEmail').mockResolvedValue({} as IUser);

    await expect(handler.execute(command)).rejects.toThrow(ConflictException);
    expect(userRepository.findByEmail).toHaveBeenCalledWith('user1@example.com');
  });

  it('should throw InternalServerErrorException on unexpected error', async () => {
    const command = new RegisterCommand(
      'User1', 'Company1', 'Client1', 'user1@example.com', 'password123', 'admin', 'Contact1', '123456789', 'contact1@example.com'
    );

    jest.spyOn(userRepository, 'findByEmail').mockResolvedValue(null);
    jest.spyOn(userRepository, 'createUser').mockRejectedValue(new Error('Unexpected error'));

    await expect(handler.execute(command)).rejects.toThrow(InternalServerErrorException);
    expect(userRepository.findByEmail).toHaveBeenCalledWith('user1@example.com');
  });
});
