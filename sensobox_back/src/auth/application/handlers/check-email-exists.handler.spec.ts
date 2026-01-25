import { Test, TestingModule } from '@nestjs/testing';
import { CheckEmailExistsHandler } from './check-email-exists.handler';
import { CheckEmailExistsQuery } from '../queries/check-email-exists.query';
import { UserRepository } from '../../infrastructure/persistence/user.repository';
import { Logger, InternalServerErrorException } from '@nestjs/common';

describe('CheckEmailExistsHandler', () => {
  let handler: CheckEmailExistsHandler;
  let userRepository: UserRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CheckEmailExistsHandler,
        {
          provide: UserRepository,
          useValue: {
            emailExists: jest.fn(), // Creamos un mock para el método emailExists
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

    handler = module.get<CheckEmailExistsHandler>(CheckEmailExistsHandler);
    userRepository = module.get<UserRepository>(UserRepository);
  });

  it('should return true if email exists', async () => {
    const query = new CheckEmailExistsQuery('test@example.com');
    jest.spyOn(userRepository, 'emailExists').mockResolvedValue(true);

    expect(await handler.execute(query)).toBe(true);
    expect(userRepository.emailExists).toHaveBeenCalledWith('test@example.com');
  });

  it('should return false if email does not exist', async () => {
    const query = new CheckEmailExistsQuery('test@example.com');
    jest.spyOn(userRepository, 'emailExists').mockResolvedValue(false);

    expect(await handler.execute(query)).toBe(false);
    expect(userRepository.emailExists).toHaveBeenCalledWith('test@example.com');
  });

  it('should throw InternalServerErrorException if an error occurs', async () => {
    const query = new CheckEmailExistsQuery('test@example.com');
    jest.spyOn(userRepository, 'emailExists').mockRejectedValue(new Error('Some error'));

    await expect(handler.execute(query)).rejects.toThrow(InternalServerErrorException);
    expect(userRepository.emailExists).toHaveBeenCalledWith('test@example.com');
  });
});
