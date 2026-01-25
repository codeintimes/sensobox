import { Test, TestingModule } from '@nestjs/testing';
import { LoginHandler } from './login.handler';
import { LoginCommand } from '../commands/login.command';
import { AuthService } from '../services/authentication.service';
import { Logger, UnauthorizedException, InternalServerErrorException } from '@nestjs/common';

describe('LoginHandler', () => {
  let handler: LoginHandler;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoginHandler,
        {
          provide: AuthService,
          useValue: {
            validateUser: jest.fn(),
            login: jest.fn(),
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

    handler = module.get<LoginHandler>(LoginHandler);
    authService = module.get<AuthService>(AuthService);
  });

  it('should return user and token on successful login', async () => {
    const command = new LoginCommand('user@example.com', 'password123');
    const mockUser = {
      id: '1',
      companyName: 'Company1',
      clientName: 'Client1',
      name: 'User1',
      email: 'user@example.com',
      role: 'admin',
      contactName: 'Contact1',
      contactPhone: '123456789',
      contactEmail: 'contact1@example.com',
    };
    const mockToken = { token: 'some-jwt-token' };

    jest.spyOn(authService, 'validateUser').mockResolvedValue(mockUser);
    jest.spyOn(authService, 'login').mockResolvedValue(mockToken);

    const result = await handler.execute(command);
    expect(result).toEqual({ user: mockUser, token: mockToken.token });
    expect(authService.validateUser).toHaveBeenCalledWith('user@example.com', 'password123');
    expect(authService.login).toHaveBeenCalledWith(mockUser);
  });

  it('should throw UnauthorizedException if credentials are invalid', async () => {
    const command = new LoginCommand('user@example.com', 'wrongpassword');
    jest.spyOn(authService, 'validateUser').mockResolvedValue(null);

    await expect(handler.execute(command)).rejects.toThrow(UnauthorizedException);
    expect(authService.validateUser).toHaveBeenCalledWith('user@example.com', 'wrongpassword');
  });

  it('should throw InternalServerErrorException on unexpected error', async () => {
    const command = new LoginCommand('user@example.com', 'password123');
    jest.spyOn(authService, 'validateUser').mockRejectedValue(new Error('Unexpected error'));

    await expect(handler.execute(command)).rejects.toThrow(InternalServerErrorException);
    expect(authService.validateUser).toHaveBeenCalledWith('user@example.com', 'password123');
  });
});
