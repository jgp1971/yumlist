const controller = require('../controller.js');
const test_db = require('../models');

const mock_ctx = {};
mock_ctx.params = {};
mock_ctx.request = {};
mock_ctx.params.list = {};
mock_ctx.params.id = '';
mock_ctx.params.listId = '';
mock_ctx.request.body = {};


describe('controller integration tests', () => {

  beforeEach(async () => {
    // Async
    await test_db.sequelize.sync({force: true});
  });

  afterEach(async () => {
    // Drops all tables
    await test_db.sequelize.drop();
  });

  afterAll(async () => {
    // Drops all tables
    test_db.sequelize.close();
  });

  describe('getListInfo', () => {

    test('should respond 200 if the list is found', async () => {
      let newList = {
        listname: 'test',
        listdetails: 'pepa',
        id: '1'
      };
      await test_db.Lists.create(newList);

      mock_ctx.params.listId = '1';
      await controller.getListInfo(mock_ctx, test_db);
      expect(mock_ctx.status).toEqual(200);
      expect(mock_ctx.body.id).toEqual(newList.id);
      expect(mock_ctx.body.listname).toEqual(newList.listname);
      expect(mock_ctx.body.listdetails).toEqual(newList.listdetails);
    });

    test('should respond 404 if the list is not found', async () => {
      let newList = {
        listname: 'test',
        listdetails: 'pepa',
        id: '1'
      };
      await test_db.Lists.create(newList);

      mock_ctx.params.listId = '2';
      await controller.getListInfo(mock_ctx, test_db);
      expect(mock_ctx.status).toEqual(404);
      expect(mock_ctx.body.error).toEqual('list not found');
    });
  });

  describe('addToFavorites', () => {

    test('should respond 200 if the addition is correct and to add the restaurant', async () => {
      let newList = {
        listname: 'test',
        listdetails: 'pepa',
        id: '1'
      };
      await test_db.Lists.create(newList);

      let newRestaurant = {
        id: 'pepita',
        name: 'pepita',
        rating: 4,
        url: '',
        review_count: 200
      };
      mock_ctx.request.body = newRestaurant;
      mock_ctx.params.list = '1';

      const spy = jest.spyOn(test_db.Favorites, 'create');
      await controller.addToFavorites(mock_ctx, test_db);
      expect(spy).toHaveBeenCalled();
      expect(spy).toHaveBeenCalledTimes(1);
      expect(mock_ctx.status).toEqual(200);
      expect(mock_ctx.body.id).toEqual(newRestaurant.id);
      spy.mockRestore();
    });

    test('should respond 200 if the addition is correct and not add the restaurant', async () => {
      let newList = {
        listname: 'test',
        listdetails: 'pepe',
        id: '1'
      };
      await test_db.Lists.create(newList);

      let newRestaurant = {
        id: 'pepito',
        name: 'pepito',
        rating: 4,
        url: '',
        review_count: 200
      };
      await test_db.Favorites.create(newRestaurant);

      mock_ctx.request.body = newRestaurant;
      mock_ctx.params.list = '1';

      const spy = jest.spyOn(test_db.Favorites, 'create');
      await controller.addToFavorites(mock_ctx, test_db);
      expect(spy).toHaveBeenCalledTimes(0);
      expect(mock_ctx.status).toEqual(200);
      expect(mock_ctx.body.id).toEqual(newRestaurant.id);
      spy.mockRestore();
    });

    test('should respond 400 if the restaurant is in the list', async () => {
      let newList = {
        listname: 'test',
        listdetails: 'pepa',
        id: '1'
      };
      await test_db.Lists.create(newList);

      let newRestaurant = {
        id: 'pepita',
        name: 'pepita',
        rating: 4,
        url: '',
        review_count: 200
      };
      mock_ctx.request.body = newRestaurant;
      mock_ctx.params.list = '1';

      await controller.addToFavorites(mock_ctx, test_db);
      await controller.addToFavorites(mock_ctx, test_db);

      expect(mock_ctx.status).toEqual(400);
      expect(mock_ctx.body.error).toEqual('Already added');
    });


  });

  describe('removeFromFavorites', () => {

    test('should respond 200 if restaurant is removed', async () => {

      mock_ctx.params.id = 'pepita';
      mock_ctx.params.list = '1';
      mock_ctx.params.listId = '1';

      let newList = {
        listname: 'test',
        listdetails: 'pepe',
        id: '1'
      };
      await test_db.Lists.create(newList);

      let newRestaurant = {
        id: 'pepita',
        name: 'pepita',
        rating: 4,
        url: '',
        review_count: 200
      };
      await test_db.Favorites.create(newRestaurant);

      await controller.addToFavorites(mock_ctx, test_db);

      await controller.loadFavoritesFromListWithScore(mock_ctx, test_db);
      const state1 = mock_ctx.body;
      await controller.removeFromFavorites(mock_ctx, test_db);
      await controller.loadFavoritesFromListWithScore(mock_ctx, test_db);
      const state2 = mock_ctx.body;

      expect(state1).not.toEqual(state2);
      expect(mock_ctx.status).toEqual(200);
    });

  });

});

