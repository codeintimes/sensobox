import { Test, TestingModule } from '@nestjs/testing';
import { UpdateUserHandler } from './update-user.handler';
import { UpdateUserCommand } from '../commands/update-user.command';
import { UserRepository } from '../../infrastructure/persistence/user.repository';
import * as bcrypt from 'bcrypt';
import { Logger, NotFoundException, ForbiddenException, InternalServerErrorException } from '@nestjs/common';
import { IUser } from '../../domain/schemas/user.schema';

describe('UpdateUserHandler', () => {
  let handler: UpdateUserHandler;
  let userRepository: UserRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateUserHandler,
        {
          provide: UserRepository,
          useValue: {
            findUserRoleById: jest.fn(),
            findById: jest.fn(),
            update: jest.fn(),
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

    handler = module.get<UpdateUserHandler>(UpdateUserHandler);
    userRepository = module.get<UserRepository>(UserRepository);
  });

  it('should update a user successfully', async () => {
    const command = new UpdateUserCommand('user1', 'New Name', 'new@example.com', 'newpassword', 'New Contact Name', '123456789', 'contact@example.com');
    const mockUser: Partial<IUser> = {
      id: 'user1',
      name: 'Existing Name',
      email: 'existing@example.com',
      password: await bcrypt.hash('existingpassword', 10),
      contactName: 'Existing Contact Name',
      contactPhone: '987654321',
      contactEmail: 'existingcontact@example.com',
      clientName: 'Client One',
      companyName: 'Company One',
      role: 'admin',
      eco: false,
      ecoEmissions: 0,
    };

    jest.spyOn(userRepository, 'findUserRoleById').mockResolvedValue('admin');
    jest.spyOn(userRepository, 'findById').mockResolvedValue(mockUser as IUser);
    jest.spyOn(userRepository, 'update').mockResolvedValue({
      ...mockUser,
      name: 'New Name',
      email: 'new@example.com',
      password: await bcrypt.hash('newpassword', 10),
      contactName: 'New Contact Name',
      contactPhone: '123456789',
      contactEmail: 'contact@example.com',
    } as IUser);

    const result = await handler.execute(command);
    expect(result).toEqual({
      ...mockUser,
      name: 'New Name',
      email: 'new@example.com',
      password: expect.any(String), // Password is hashed
      contactName: 'New Contact Name',
      contactPhone: '123456789',
      contactEmail: 'contact@example.com',
    });
    expect(userRepository.findUserRoleById).toHaveBeenCalledWith('user1');
    expect(userRepository.findById).toHaveBeenCalledWith('user1');
    expect(userRepository.update).toHaveBeenCalledWith({
      id: 'user1',
      name: 'New Name',
      email: 'new@example.com',
      password: expect.any(String), // Password is hashed
      contactName: 'New Contact Name',
      contactPhone: '123456789',
      contactEmail: 'contact@example.com',
    });
  });

  it('should throw ForbiddenException if trying to update a superadmin', async () => {
    const command = new UpdateUserCommand('superadmin', 'New Name', 'new@example.com', 'newpassword', 'New Contact Name', '123456789', 'contact@example.com');

    jest.spyOn(userRepository, 'findUserRoleById').mockResolvedValue('superadmin');

    await expect(handler.execute(command)).rejects.toThrow(ForbiddenException);
    expect(userRepository.findUserRoleById).toHaveBeenCalledWith('superadmin');
  });

  it('should throw NotFoundException if user does not exist', async () => {
    const command = new UpdateUserCommand('nonexistent', 'New Name', 'new@example.com', 'newpassword', 'New Contact Name', '123456789', 'contact@example.com');

    jest.spyOn(userRepository, 'findUserRoleById').mockResolvedValue('admin');
    jest.spyOn(userRepository, 'findById').mockResolvedValue(null);

    await expect(handler.execute(command)).rejects.toThrow(NotFoundException);
    expect(userRepository.findUserRoleById).toHaveBeenCalledWith('nonexistent');
    expect(userRepository.findById).toHaveBeenCalledWith('nonexistent');
  });

  it('should throw InternalServerErrorException on unexpected error', async () => {
    const command = new UpdateUserCommand('user1', 'New Name', 'new@example.com', 'newpassword', 'New Contact Name', '123456789', 'contact@example.com');
    const mockUser: Partial<IUser> = {
      id: 'user1',
      name: 'Existing Name',
      email: 'existing@example.com',
      password: await bcrypt.hash('existingpassword', 10),
      contactName: 'Existing Contact Name',
      contactPhone: '987654321',
      contactEmail: 'existingcontact@example.com',
      clientName: 'Client One',
      companyName: 'Company One',
      role: 'admin',
      eco: false,
      ecoEmissions: 0,
    };

    jest.spyOn(userRepository, 'findUserRoleById').mockResolvedValue('admin');
    jest.spyOn(userRepository, 'findById').mockResolvedValue(mockUser as IUser);
    jest.spyOn(userRepository, 'update').mockRejectedValue(new Error('Unexpected error'));

    await expect(handler.execute(command)).rejects.toThrow(InternalServerErrorException);
    expect(userRepository.findUserRoleById).toHaveBeenCalledWith('user1');
    expect(userRepository.findById).toHaveBeenCalledWith('user1');
    expect(userRepository.update).toHaveBeenCalledWith({
      id: 'user1',
      name: 'New Name',
      email: 'new@example.com',
      password: expect.any(String), // Password is hashed
      contactName: 'New Contact Name',
      contactPhone: '123456789',
      contactEmail: 'contact@example.com',
    });
  });
});
