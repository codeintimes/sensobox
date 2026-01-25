import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AuthController } from './auth.controller';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { UserDto } from '../../application/dto/user.dto';
import { UserDtoUpdate } from '../../application/dto/user-update.dto';
import { LoginDto } from '../../application/dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let commandBus: CommandBus;
  let queryBus: QueryBus;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: CommandBus,
          useValue: { execute: jest.fn() },
        },
        {
          provide: QueryBus,
          useValue: { execute: jest.fn() },
        },
        {
          provide: JwtService,
          useValue: {
            verify: jest.fn().mockReturnValue({ userId: 1 }),
          },
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    commandBus = moduleFixture.get<CommandBus>(CommandBus);
    queryBus = moduleFixture.get<QueryBus>(QueryBus);
  });

  describe('/auth/users (GET)', () => {
    it('should return all users', () => {
      jest.spyOn(queryBus, 'execute').mockResolvedValueOnce([]);

      return request(app.getHttpServer())
        .get('/auth/users')
        .set('Authorization', 'Bearer test-token')
        .expect(200)
        .then((response) => {
          expect(response.body).toEqual(expect.any(Array));
        });
    });
  });

  describe('/auth/clientRole (GET)', () => {
    it('should return all clients with specific role', () => {
      jest.spyOn(queryBus, 'execute').mockResolvedValueOnce([]);

      return request(app.getHttpServer())
        .get('/auth/clientRole?role=client&companyName=Test Company')
        .set('Authorization', 'Bearer test-token')
        .expect(200)
        .then((response) => {
          expect(response.body).toEqual(expect.any(Array));
        });
    });
  });

  describe('/auth/clients (GET)', () => {
    it('should return all clients', () => {
      jest.spyOn(queryBus, 'execute').mockResolvedValueOnce([]);

      return request(app.getHttpServer())
        .get('/auth/clients?companyName=Test Company')
        .set('Authorization', 'Bearer test-token')
        .expect(200)
        .then((response) => {
          expect(response.body).toEqual(expect.any(Array));
        });
    });
  });

  describe('/auth/:id/eco-data (PATCH)', () => {
    it('should update eco data for a user', () => {
      const ecoData = { eco: true, ecoEmissions: 100 };

      jest.spyOn(commandBus, 'execute').mockResolvedValueOnce({});

      return request(app.getHttpServer())
        .patch('/auth/1/eco-data')
        .send(ecoData)
        .expect(204);
    });
  });

  describe('/auth/check-email-exists/:email (GET)', () => {
    it('should check if an email exists', () => {
      jest.spyOn(queryBus, 'execute').mockResolvedValueOnce(true);

      return request(app.getHttpServer())
        .get('/auth/check-email-exists/test@example.com')
        .set('Authorization', 'Bearer test-token')
        .expect(200)
        .then((response) => {
          expect(response.body).toBe(true);
        });
    });
  });

  describe('/auth/register (POST)', () => {
    it('should register a new user', () => {
      const userDto: UserDto = {
        name: 'Test User',
        clientName: 'Test Client',
        companyName: 'Test Company',
        email: 'test@example.com',
        password: 'password',
        role: 'client',
        contactName: 'Contact Name',
        contactPhone: '123456789',
        contactEmail: 'contact@example.com',
      };

      jest.spyOn(commandBus, 'execute').mockResolvedValueOnce({ id: '1' });

      return request(app.getHttpServer())
        .post('/auth/register')
        .send(userDto)
        .expect(201)
        .then((response) => {
          expect(response.body).toHaveProperty('id', '1');
        });
    });
  });

  describe('/auth/login (POST)', () => {
    it('should log in an existing user', () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'password',
      };

      jest.spyOn(commandBus, 'execute').mockResolvedValueOnce({ accessToken: 'test-token' });

      return request(app.getHttpServer())
        .post('/auth/login')
        .send(loginDto)
        .expect(200)
        .then((response) => {
          expect(response.body).toHaveProperty('accessToken', 'test-token');
        });
    });
  });

  describe('/auth/validate-token (POST)', () => {
    it('should validate a token', () => {
      return request(app.getHttpServer())
        .post('/auth/validate-token')
        .send({ token: 'test-token' })
        .expect(200)
        .then((response) => {
          expect(response.body).toHaveProperty('isValid', true);
          expect(response.body).toHaveProperty('decoded');
        });
    });
  });

  describe('/auth/:id (PATCH)', () => {
    it('should update an existing user',async () => {
      const hashedPassword = await bcrypt.hash('password123', 10);
      const userDtoUpdate: UserDtoUpdate = {
        name: 'User1',
        email: 'user1@example.com',
        password: hashedPassword,
        role: 'admin',
        contactName: 'Contact1',
        contactPhone: '123456789',
        contactEmail: 'contact1@example.com',
      };

      jest.spyOn(commandBus, 'execute').mockResolvedValueOnce({});

      return request(app.getHttpServer())
        .patch('/auth/1')
        .set('Authorization', 'Bearer test-token')
        .send(userDtoUpdate)
        .expect(200)
        .then((response) => {
          expect(response.body).toHaveProperty('message', 'User updated successfully');
        });
    });
  });

  describe('/auth/:id (DELETE)', () => {
    it('should delete an existing user', () => {
      jest.spyOn(commandBus, 'execute').mockResolvedValueOnce({});

      return request(app.getHttpServer())
        .delete('/auth/1')
        .set('Authorization', 'Bearer test-token')
        .expect(200)
        .then((response) => {
          expect(response.body).toHaveProperty('message', 'User deleted successfully');
        });
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
