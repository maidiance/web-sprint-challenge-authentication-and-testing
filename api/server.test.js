const Users = require('./users/users-model');
const db = require('../data/dbConfig');
const request = require('supertest');
const server = require('./server');

// Write your tests here
beforeAll(async() => {
  await db.migrate.rollback();
  await db.migrate.latest();
});

beforeEach(async() => {
  await db('users').truncate();
});

describe('test auth endpoints', () => {
  test('[POST] /api/auth/register', async() => {
    let result = await request(server)
      .post('/api/auth/register')
      .send({ username: 'Captain Marvel', password: 'foobar' });
    expect(result.status).toBe(201);
    result = await Users.findById(1);
    expect(result.username).toBe('Captain Marvel');
  });

  test('[POST] /api/auth/login', async() => {
    let result = await request(server)
      .post('/api/auth/login')
      .send({ username: 'Captain Marvel', password: 'foobar' });
    expect(result.status).toBe(401);
  });
});