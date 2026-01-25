



































































import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let token: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /auth/register (Register User)', async () => {
    await request(app.getHttpServer())
    .post('/auth/register')
    .send({ email: 'test@example.com', password: 'Test123!' })
    .expect(201);
  });

  it('should login with registered user', async () => {
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'test@example.com', password: 'Test123!' })
      .expect(201);
    token = loginResponse.body.token.token;
    expect(token).toBeDefined();
  });

  it('should get a list of users', async () => {
    await request(app.getHttpServer())
      .get('/auth/users')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
  });

  it('should get a list of users', async () => {
    const hola = await request(app.getHttpServer())
      .get('/auth/users')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
  });

  it('should update user information', async () => {
    const userId = 1; 
    await request(app.getHttpServer())
      .patch(`/auth/${userId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ email: 'updated@example.com', password: 'NewPassword123!' })
      .expect(200);
  });

  it('should get a list of users', async () => {
    const hola = await request(app.getHttpServer())
      .get('/auth/users')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
  });

  it('should delete the user', async () => {
    const userId = 1; 
    await request(app.getHttpServer())
      .delete(`/auth/${userId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
  });
});
