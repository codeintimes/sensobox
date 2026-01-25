import { Test, TestingModule } from '@nestjs/testing';
import { UpdateEcoDataHandler } from './update-eco-user.handler';
import { UpdateEcoDataCommand } from '../commands/update-eco-user.command';
import { UserRepository } from '../../infrastructure/persistence/user.repository';
import { Logger, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { IUser } from '../../domain/schemas/user.schema';

describe('UpdateEcoDataHandler', () => {
  let handler: UpdateEcoDataHandler;
  let userRepository: UserRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateEcoDataHandler,
        {
          provide: UserRepository,
          useValue: {
            findById: jest.fn(),
            updateEcoData: jest.fn(),
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

    handler = module.get<UpdateEcoDataHandler>(UpdateEcoDataHandler);
    userRepository = module.get<UserRepository>(UserRepository);
  });

  it('should update eco data for a user successfully', async () => {
    const command = new UpdateEcoDataCommand('user1', true, 100);
    const mockUser: Partial<IUser> = {
      id: 'user1',
      email: 'user1@example.com',
      name: 'User One',
      clientName: 'Client One',
      companyName: 'Company One',
      role: 'user',
      eco: true,
      ecoEmissions: 100,
      password: 'hashedpassword',
      contactName: 'Contact One',
      contactPhone: '1234567890',
      contactEmail: 'contact@example.com',
    };

    jest.spyOn(userRepository, 'findById').mockResolvedValue(mockUser as IUser);
    jest.spyOn(userRepository, 'updateEcoData').mockResolvedValue(mockUser as IUser);

    const result = await handler.execute(command);
    expect(result).toEqual(mockUser);
    expect(userRepository.findById).toHaveBeenCalledWith('user1');
    expect(userRepository.updateEcoData).toHaveBeenCalledWith('user1', true, 100);
  });

  it('should throw NotFoundException if user does not exist', async () => {
    const command = new UpdateEcoDataCommand('user1', true, 100);

    jest.spyOn(userRepository, 'findById').mockResolvedValue(null);

    await expect(handler.execute(command)).rejects.toThrow(NotFoundException);
    expect(userRepository.findById).toHaveBeenCalledWith('user1');
  });

  it('should throw InternalServerErrorException on unexpected error', async () => {
    const command = new UpdateEcoDataCommand('user1', true, 100);
    const mockUser: Partial<IUser> = {
      id: 'user1',
      email: 'user1@example.com',
      name: 'User One',
      clientName: 'Client One',
      companyName: 'Company One',
      role: 'user',
      eco: false,
      ecoEmissions: 50,
      password: 'hashedpassword',
      contactName: 'Contact One',
      contactPhone: '1234567890',
      contactEmail: 'contact@example.com',
    };

    jest.spyOn(userRepository, 'findById').mockResolvedValue(mockUser as IUser);
    jest.spyOn(userRepository, 'updateEcoData').mockRejectedValue(new Error('Unexpected error'));

    await expect(handler.execute(command)).rejects.toThrow(InternalServerErrorException);
    expect(userRepository.findById).toHaveBeenCalledWith('user1');
    expect(userRepository.updateEcoData).toHaveBeenCalledWith('user1', true, 100);
  });
});
