import { Test, TestingModule } from '@nestjs/testing';
import { DeleteUserHandler } from './delete-user.handler';
import { DeleteUserCommand } from '../commands/delete-user.command';
import { UserRepository } from '../../infrastructure/persistence/user.repository';
import { Logger, InternalServerErrorException, NotFoundException, ForbiddenException } from '@nestjs/common';

describe('DeleteUserHandler', () => {
  let handler: DeleteUserHandler;
  let userRepository: UserRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteUserHandler,
        {
          provide: UserRepository,
          useValue: {
            findUserRoleById: jest.fn(),  // Creamos un mock para el método findUserRoleById
            userExistsById: jest.fn(),   // Creamos un mock para el método userExistsById
            delete: jest.fn(),           // Creamos un mock para el método delete
          },
        },
        {
          provide: Logger,
          useValue: {
            log: jest.fn(),              // Creamos un mock para el método log del logger
            warn: jest.fn(),             // Creamos un mock para el método warn del logger
            error: jest.fn(),            // Creamos un mock para el método error del logger
          },
        },
      ],
    }).compile();

    handler = module.get<DeleteUserHandler>(DeleteUserHandler);
    userRepository = module.get<UserRepository>(UserRepository);
  });

  it('should delete user successfully', async () => {
    const command = new DeleteUserCommand('valid-id');
    jest.spyOn(userRepository, 'findUserRoleById').mockResolvedValue('user');  // Simulamos que el usuario tiene rol 'user'
    jest.spyOn(userRepository, 'userExistsById').mockResolvedValue(true);      // Simulamos que el usuario existe
    jest.spyOn(userRepository, 'delete').mockResolvedValue(true);              // Simulamos que el usuario se elimina con éxito

    await expect(handler.execute(command)).resolves.not.toThrow();
    expect(userRepository.findUserRoleById).toHaveBeenCalledWith('valid-id');
    expect(userRepository.userExistsById).toHaveBeenCalledWith('valid-id');
    expect(userRepository.delete).toHaveBeenCalledWith('valid-id');
  });

  it('should throw ForbiddenException when trying to delete a superadmin', async () => {
    const command = new DeleteUserCommand('superadmin-id');
    jest.spyOn(userRepository, 'findUserRoleById').mockResolvedValue('superadmin');  // Simulamos que el usuario tiene rol 'superadmin'

    await expect(handler.execute(command)).rejects.toThrow(ForbiddenException);
    expect(userRepository.findUserRoleById).toHaveBeenCalledWith('superadmin-id');
  });

  it('should throw NotFoundException if user does not exist', async () => {
    const command = new DeleteUserCommand('non-existent-id');
    jest.spyOn(userRepository, 'findUserRoleById').mockResolvedValue('user');   // Simulamos que el usuario tiene rol 'user'
    jest.spyOn(userRepository, 'userExistsById').mockResolvedValue(false);      // Simulamos que el usuario no existe

    await expect(handler.execute(command)).rejects.toThrow(NotFoundException);
    expect(userRepository.findUserRoleById).toHaveBeenCalledWith('non-existent-id');
    expect(userRepository.userExistsById).toHaveBeenCalledWith('non-existent-id');
  });

  it('should throw InternalServerErrorException on delete failure', async () => {
    const command = new DeleteUserCommand('valid-id');
    jest.spyOn(userRepository, 'findUserRoleById').mockResolvedValue('user');  // Simulamos que el usuario tiene rol 'user'
    jest.spyOn(userRepository, 'userExistsById').mockResolvedValue(true);      // Simulamos que el usuario existe
    jest.spyOn(userRepository, 'delete').mockResolvedValue(false);             // Simulamos que la eliminación falla

    await expect(handler.execute(command)).rejects.toThrow(InternalServerErrorException);
    expect(userRepository.findUserRoleById).toHaveBeenCalledWith('valid-id');
    expect(userRepository.userExistsById).toHaveBeenCalledWith('valid-id');
    expect(userRepository.delete).toHaveBeenCalledWith('valid-id');
  });

  it('should throw InternalServerErrorException on unexpected error', async () => {
    const command = new DeleteUserCommand('valid-id');
    jest.spyOn(userRepository, 'findUserRoleById').mockResolvedValue('user');   // Simulamos que el usuario tiene rol 'user'
    jest.spyOn(userRepository, 'userExistsById').mockResolvedValue(true);       // Simulamos que el usuario existe
    jest.spyOn(userRepository, 'delete').mockRejectedValue(new Error('Unexpected error'));  // Simulamos que se produce un error inesperado

    await expect(handler.execute(command)).rejects.toThrow(InternalServerErrorException);
    expect(userRepository.findUserRoleById).toHaveBeenCalledWith('valid-id');
    expect(userRepository.userExistsById).toHaveBeenCalledWith('valid-id');
    expect(userRepository.delete).toHaveBeenCalledWith('valid-id');
  });
});
