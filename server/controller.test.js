const controller = require('./controller.js');

const mock_ctx = {};
mock_ctx.params = {};
mock_ctx.request = {};
const mock_db = {};
mock_db.Favorites = {};
mock_db.Lists = {};
mock_db.FavoritesLists = {};

describe('searchRestaurants', () => {

  test('should respond 200 if the client responds correctly', async () => {
    const client = {};
    client.search = jest.fn(() => new Promise((resolve, reject) => {
      const response = {
        jsonBody: {
          businesses: [
            'hola', 'adios'
          ]
        }
      }
      resolve(response)
    }))
    await controller.searchRestaurants(mock_ctx, client);
    expect(mock_ctx.status).toEqual(200);
    expect(mock_ctx.body.length).toBe(2);
  });

  test('should respond 500 if the api call fails', async () => {
    const client = {};
    client.search = jest.fn(() => new Promise((resolve, reject) => reject(false)))
    await controller.searchRestaurants(mock_ctx, client);
    expect(mock_ctx.status).toEqual(500);
    expect(mock_ctx.body.length).toBe(undefined);
  });

})

describe('getListInfo', () => {

  test('should respond 200 if the promise is true', async () => {
    mock_db.Lists.findOne = jest.fn(() => new Promise((resolve, reject) => resolve(true)));
    await controller.getListInfo(mock_ctx, mock_db);
    expect(mock_ctx.status).toEqual(200);
  });

  test('should respond 500 if the promise is false', async () => {
    mock_db.Lists.findOne = jest.fn(() => new Promise((resolve, reject) => reject(new Error('Whoops!'))));
    await controller.getListInfo(mock_ctx, mock_db)
    expect(mock_ctx.status).toEqual(500);
  });

});

describe('addToFavorites', () => {

  test('should return a 400 if the restaurant is in the list', async () => {
    mock_ctx.params.list = ''
    mock_ctx.request.body = {id: 'pepita'}
    const mockMockDb = {
      dataValues: {
        Favorites: [
          {id: 'pepita'}, {id: 'pepito'}
        ]
      }
    }
    mock_db.Lists.find = jest.fn(() => new Promise((resolve, reject) => resolve(mockMockDb)));
    await controller.addToFavorites(mock_ctx, mock_db)
    expect(mock_ctx.status).toEqual(400);

  });

  test('should return 200 and not create the favorite if the favorite already exists', async () => {
    mock_ctx.params.list = {}
    mock_ctx.request.body = {id: 'pepita'}
    const mockMockDb = {
      dataValues: {
        Favorites: [
          {id: 'pepite'}, {id: 'pepito'}
        ]
      }
    }
    mock_db.Lists.find = jest.fn(() => new Promise((resolve, reject) => resolve(mockMockDb)))
    mock_db.Favorites.find = jest.fn(() => new Promise((resolve, reject) => resolve(true)))
    mock_db.Favorites.create = jest.fn(() => new Promise((resolve, reject) => resolve(true)))
    mock_db.FavoritesLists.create = jest.fn(() => new Promise((resolve, reject) => resolve(true)))
    const spy = jest.spyOn(mock_db.Favorites, 'create')
    await controller.addToFavorites(mock_ctx, mock_db)
    expect(mock_ctx.status).toEqual(200);
    expect(spy).not.toHaveBeenCalled()
  });

  test('should return 200 and create the favorite if the favorite doesnt exist', async () => {
    mock_ctx.params.list = {}
    mock_ctx.request.body = {id: 'pepita'}
    const mockMockDb = {
      dataValues: {
        Favorites: [
          {id: 'pepite'}, {id: 'pepito'}
        ]
      }
    }
    mock_db.Lists.find = jest.fn(() => new Promise((resolve, reject) => resolve(mockMockDb)))
    mock_db.Favorites.find = jest.fn(() => new Promise((resolve, reject) => resolve(false)))
    mock_db.Favorites.create = jest.fn(() => new Promise((resolve, reject) => resolve(true)))
    mock_db.FavoritesLists.create = jest.fn(() => new Promise((resolve, reject) => resolve(true)))
    const spy = jest.spyOn(mock_db.Favorites, 'create')
    await controller.addToFavorites(mock_ctx, mock_db)
    expect(mock_ctx.status).toEqual(200);
    expect(spy).toHaveBeenCalled()
  });

  test('should return 500 if the favorite list creation failed', async () => {
    mock_ctx.params.list = {}
    mock_ctx.request.body = {id: 'pepita'}
    const mockMockDb = {
      dataValues: {
        Favorites: [
          {id: 'pepite'}, {id: 'pepito'}
        ]
      }
    }
    mock_db.Lists.find = jest.fn(() => new Promise((resolve, reject) => resolve(mockMockDb)))
    mock_db.Favorites.find = jest.fn(() => new Promise((resolve, reject) => resolve(false)))
    mock_db.Favorites.create = jest.fn(() => new Promise((resolve, reject) => resolve(true)))
    mock_db.FavoritesLists.create = jest.fn(() => new Promise((resolve, reject) => reject(false)))
    await controller.addToFavorites(mock_ctx, mock_db)
    expect(mock_ctx.status).toEqual(500);
  });
})
