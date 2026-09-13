const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const User = require('../models/User');
const Issue = require('../models/Issue'); 

let token;

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_TEST_URI || 'mongodb://127.0.0.1:27017/devflow_test');

  await request(app)
    .post('/api/auth/register')
    .send({ name: 'Tester', email: 'tester@example.com', password: 'password123' });

  const res = await request(app)
    .post('/api/auth/login')
    .send({ email: 'tester@example.com', password: 'password123' });

  token = res.body.token;
});

afterEach(async () => {
  await Issue.deleteMany({});
});

afterAll(async () => {
  await User.deleteMany({});
  await mongoose.connection.close();
});

describe('POST /api/issues', () => {
  it('creates a new issue for an authenticated user (201)', async () => {
    const res = await request(app)
      .post('/api/issues')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Login button broken', description: 'Button does nothing on click' });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('_id');
    expect(res.body.title).toBe('Login button broken');
  });

  it('rejects an unauthenticated request (401)', async () => {
    const res = await request(app)
      .post('/api/issues')
      .send({ title: 'No auth issue', description: 'Should fail' });

    expect(res.statusCode).toBe(401);
  });
});

describe('GET /api/issues', () => {
  it('returns a 200 and a list of issues for an authenticated user', async () => {
    await request(app)
      .post('/api/issues')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Sample issue', description: 'For listing test' });

    const res = await request(app)
      .get('/api/issues')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });
});