const request = require('supertest');
const mongoose = require('mongoose');

process.env.NODE_ENV = 'test';
process.env.USE_MEMORY_STORE = 'true';
process.env.MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/shortener_test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_secret';
process.env.BASE_URL = 'http://localhost:4000';

const app = require('../../backend/server');

describe('Short URL flow', () => {
  beforeAll(async () => {});
  afterAll(async () => {});

  test('creates short url and retrieves stats', async () => {
    const createRes = await request(app)
      .post('/shorturls')
      .send({ url: 'https://example.com/test', validity: 5 });

    expect(createRes.statusCode).toBe(201);
    expect(createRes.body.shortLink).toBeDefined();

    const parts = createRes.body.shortLink.split('/');
    const code = parts[parts.length - 1];

    const statsRes = await request(app).get(`/shorturls/${code}/stats`);
    expect(statsRes.statusCode).toBe(200);
    expect(statsRes.body.redirects).toBe(0);
  });
});


