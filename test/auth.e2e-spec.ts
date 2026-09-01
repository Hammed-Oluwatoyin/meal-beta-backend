import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { randomUUID } from 'crypto';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

interface RegisterResponse {
  user: { email: string };
  verificationToken: string | null;
}

interface LoginResponse {
  user: { email: string };
  accessToken: string;
  refreshToken: string;
}

interface MeResponse {
  email: string;
}

describe('Auth (e2e)', () => {
  let app: INestApplication<App>;
  const email = `test-${randomUUID()}@mealbeta.dev`;
  const password = 'StrongPassword123!';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('registers, verifies, logs in and returns the current user', async () => {
    const registerRes = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email, password })
      .expect(201);
    const registerBody = registerRes.body as RegisterResponse;
    expect(registerBody.user.email).toBe(email);
    const { verificationToken } = registerBody;
    expect(verificationToken).toBeTruthy();

    await request(app.getHttpServer())
      .post('/auth/verify-email')
      .send({ token: verificationToken })
      .expect(201);

    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email, password })
      .expect(200);
    const loginBody = loginRes.body as LoginResponse;
    expect(loginBody.accessToken).toBeTruthy();
    expect(loginBody.refreshToken).toBeTruthy();

    const meRes = await request(app.getHttpServer())
      .get('/auth/me')
      .set('Authorization', `Bearer ${loginBody.accessToken}`)
      .expect(200);
    const meBody = meRes.body as MeResponse;
    expect(meBody.email).toBe(email);
  });

  it('rejects login with the wrong password', async () => {
    await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email, password: 'wrong-password' })
      .expect(401);
  });
});
