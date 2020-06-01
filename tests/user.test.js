const app = require('../src/app');
const { getEmail, makeRequest, clearDB } = require('./utils');

describe('User tests', () => {
  const MAIN_ROUTE = '/users';
  let token;

  beforeAll(async () => {
    const user = { name: 'tester', email: `${Date.now()}@mail.com`, password: 'password' };
    await app.services.user.save(user);
    const response = await app.services.auth.signin({ email: user.email, password: user.password });
    token = response.token;
  });

  afterAll(clearDB);

  it('should list all users', async () => {
    const response = await makeRequest('get', MAIN_ROUTE, token);
    expect(response.status).toBe(200);
    expect(response.body.length).toBeGreaterThan(0);
  });

  it('should add a new user', async () => {
    const newUser = { name: 'Walter Mitty', email: getEmail(), password: 'password' };
    const response = await makeRequest('post', MAIN_ROUTE, token, newUser);
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('name', newUser.name);
    expect(response.body).not.toHaveProperty('password');
  });

  it('should store the password encoded', async () => {
    const newUser = { name: 'Walter Mitty', email: getEmail(), password: 'password' };
    const response = await makeRequest('post', MAIN_ROUTE, token, newUser);
    expect(response.status).toBe(201);
    const { id } = response.body;
    const thisUser = await app.services.user.findOne({ id });
    expect(thisUser.password).toBeDefined();
    expect(thisUser.password).not.toEqual(newUser.password);
  });

  it('should not add a new user with a duplicated email', async () => {
    const email = getEmail();
    const newUser = { name: 'Walter Mitty', email, password: 'password' };
    await makeRequest('post', MAIN_ROUTE, token, newUser);
    const otherUser = { name: 'Other Walter Mitty', email, password: 'password' };
    const response = await makeRequest('post', MAIN_ROUTE, token, otherUser);
    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Email must be unique');
  });

  it.each([
    ['Name', { email: 'john@mail.com', password: 'john@mail.com' }],
    ['Email', { name: 'john', password: 'password' }],
    ['Password', { name: 'john', email: 'john@mail.com' }],
  ])('should not insert a user with no %s', async (field, inputUser) => {
    const response = await makeRequest('post', MAIN_ROUTE, token, inputUser);
    expect(response.status).toBe(400);
    expect(response.body.error).toBe(`${field} must not be null`);
  });
});
