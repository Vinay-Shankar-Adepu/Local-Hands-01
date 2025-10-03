import request from 'supertest';
import mongoose from 'mongoose';
process.env.NODE_ENV = 'test';
import app from '../src/app.js';

describe('Catalog Endpoint', () => {
  afterAll(async () => {
    if (mongoose.connection.readyState) {
      await mongoose.connection.close();
    }
  });
  it('returns catalog grouping', async () => {
    const res = await request(app).get('/api/catalog');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('catalog');
    expect(Array.isArray(res.body.catalog)).toBe(true);
  });
});