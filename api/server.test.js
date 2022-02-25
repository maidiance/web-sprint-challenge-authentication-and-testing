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
  describe('[POST] /api/auth/register', () => {
    test('responds with the correct status and user is added to database', async() => {
      let result = await request(server)
        .post('/api/auth/register')
        .send({ username: 'Captain Marvel', password: 'foobar' });
      expect(result.status).toBe(201);
      result = await Users.findById(1);
      expect(result.username).toBe('Captain Marvel');
    });
  });
  
  describe('[POST] /api/auth/login', () => {
    test('responds with correct status and message on invalid credentials', async() => {
      let result = await request(server)
        .post('/api/auth/login')
        .send({ username: 'Captain Marvel', password: 'foobar' });
      expect(result.status).toBe(401);
      expect(result.body.message).toMatch(/invalid credentials/i);
    });
  });
});

describe('test jokes endpoint', () => {
  describe('[GET] /api/jokes', () => {
    test('requests without a token get a proper status and message', async() => {
      let result = await request(server)
        .get('/api/jokes');
      expect(result.status).toBe(401);
      expect(result.body.message).toMatch(/token required/i);
    });
  });
});