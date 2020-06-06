const { makeRequest, getTestEntities } = require('./utils');
const app = require('../src/app');

describe('Transfers tests', () => {
  const TRANSFERS = '/transfers';
  let users;
  let accounts;
  let token;
  let user1;

  beforeAll(async () => {
    await app.db.seed.run();
    const entities = getTestEntities();
    users = entities.users;
    accounts = entities.accounts;
  });

  beforeEach(async () => {
    [user1] = users;
    const response = await app.services.auth.signin({
      email: user1.email, password: user1.password,
    });
    token = response.token;
  });

  it("should list only the user's transfers", async () => {
    const response = await makeRequest('get', TRANSFERS, token);
    expect(response.status).toBe(200);
    expect(response.body.length).toBe(1);
    expect(response.body[0].description).toBe('Transfer #1');
  });

  it('should insert a transfer successfully', async () => {
    const [accOri, accDest] = accounts;
    const newTransfer = {
      description: 'new transfer', user_id: user1.id, acc_ori_id: accOri.id, acc_dest_id: accDest.id, ammount: 100, date: new Date(),
    };
    const response = await makeRequest('post', TRANSFERS, token, newTransfer);
    expect(response.status).toBe(201);
  });
});
