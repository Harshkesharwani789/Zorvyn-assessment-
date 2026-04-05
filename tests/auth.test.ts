import request from 'supertest';
import app from '../src/app';
import { db } from '../src/db';

describe('Auth API', () => {
  beforeAll(async () => {
    // Optionally clean the db before all tests
    await db.record.deleteMany();
    await db.user.deleteMany();
  });

  afterAll(async () => {
    // Clean up connections
    await db.$disconnect();
  });

  it('should register a new user successfully', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.email).toBe('test@example.com');
  });

  it('should prevent registering duplicate email', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test User 2',
        email: 'test@example.com',
        password: 'password123'
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toContain('already exists');
  });

  it('should login and return a token', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123'
      });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user.email).toBe('test@example.com');
  });
});
