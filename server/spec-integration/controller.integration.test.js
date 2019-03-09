const controller = require('../controller.js');
const test_db = require('../models');

const mock_ctx = {};
mock_ctx.params = {};
mock_ctx.request = {};
mock_ctx.params.list = {};
mock_ctx.params.id = '';
mock_ctx.params.listId = '';
mock_ctx.request.body = {};


describe('getListInfo', () => {

  beforeEach(async () => {
    // Async
    await test_db.sequelize.sync({force: true});
  });

  afterAll(async () => {
    // Drops all tables
    await test_db.sequelize.drop();
    test_db.sequelize.close();
  });

  test('should respond 200 if the promise is true', async () => {
    mock_ctx.params.listId = '1';

    await test_db.Lists.create({
      listname: 'test',
      listdetails: 'pepa',
      id: '7'
    })

    await controller.getListInfo(mock_ctx, test_db);
    expect(mock_ctx.status).toEqual(200);
  });

});