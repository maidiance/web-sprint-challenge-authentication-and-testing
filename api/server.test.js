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

describe('test User model', () => {
  test('can find a user by id', async() => {
    await db('users').insert({username: 'donut', password: 'abc'});
    await db('users').insert({username: 'bacon', password: '123'});
    await db('users').insert({username: 'coffee', password: 'test'});
    let result = await Users.findById(2);
    expect(result.username).toBe('bacon');
  });

  test('can find a user by username', async() => {
    await db('users').insert({username: 'donut', password: 'abc'});
    await db('users').insert({username: 'bacon', password: '123'});
    await db('users').insert({username: 'coffee', password: 'test'});
    let [result] = await Users.findBy({username: 'bacon'});
    expect(result.username).toBe('bacon');
  });
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

    test('responds with the correct status and message without username', async() => {
      let result = await request(server)
        .post('/api/auth/register')
        .send({ password: 'foobar' });
      expect(result.status).toBe(400);
      expect(result.body.message).toMatch(/username and password required/i);
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

    test('responds with correct status and message on valid credentials', async() => {
      let result = await request(server)
        .post('/api/auth/register')
        .send({ username: 'Captain Marvel', password: 'foobar' });
      result = await request(server)
        .post('/api/auth/login')
        .send({ username: 'Captain Marvel', password: 'foobar' });
      expect(result.status).toBe(200);
      expect(result.body.message).toMatch(/welcome, Captain Marvel/i);
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
    test('requests with a valid token get a proper response', async() => {
      let result = await request(server)
        .post('/api/auth/register')
        .send({ username: 'bob', password: '1234' });
      result = await request(server)
        .post('/api/auth/login')
        .send({ username: 'bob', password: '1234' });
      result = await request(server)
        .get('/api/jokes')
        .set('Authorization', result.body.token);
      expect(result.status).toBe(200);
    });
  });
});