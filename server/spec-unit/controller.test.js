const controller = require('../controller.js');

const mock_ctx = {};
mock_ctx.params = {};
mock_ctx.request = {};
mock_ctx.params.list = {};
mock_ctx.params.id = '';
mock_ctx.params.listId = '';
mock_ctx.request.body = {};

const mock_db = {};
mock_db.Favorites = {};
mock_db.Lists = {};
mock_db.FavoritesLists = {};
mock_db.Votes = {};


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

});

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
});

describe('removeFromFavorites', () => {
  test('should return 200 if the restaurant was destroyed', async () => {
    mock_db.FavoritesLists.destroy = jest.fn(() => new Promise((resolve, reject) => resolve(true)));
    await controller.removeFromFavorites(mock_ctx, mock_db);
    expect(mock_ctx.status).toEqual(200);
  });

  test('should return 500 if the restaurant was not destroyed', async () => {
    mock_db.FavoritesLists.destroy = jest.fn(() => new Promise((resolve, reject) => reject(false)));
    await controller.removeFromFavorites(mock_ctx, mock_db);
    expect(mock_ctx.status).toEqual(500);
  });
});

describe('createList', () => {
  test('should create a list and return 200', async () => {
    mock_db.Lists.create = jest.fn(() => new Promise((resolve, reject) => resolve({id: 'pepita'})));
    await controller.createList(mock_ctx, mock_db);
    expect(mock_ctx.status).toEqual(200);
    expect(mock_ctx.body).toEqual({id: 'pepita'});
  });

  test('should return 500 if the list creation fails', async () => {
    mock_db.Lists.create = jest.fn(() => new Promise((resolve, reject) => reject(false)));
    await controller.createList(mock_ctx, mock_db);
    expect(mock_ctx.status).toEqual(500);
  });
});

describe('addVote', () => {
  test('should return 200 when adding a vote', async () => {
    mock_db.Votes.create = jest.fn(() => new Promise((resolve, reject) => resolve(true)));
    await controller.addVote(mock_ctx, mock_db);
    expect(mock_ctx.status).toEqual(200);
  });

  test('should return 500 if the vote addition fails', async () => {
    mock_db.Votes.create = jest.fn(() => new Promise((resolve, reject) => reject(false)));
    await controller.addVote(mock_ctx, mock_db);
    expect(mock_ctx.status).toEqual(500);
  });
})

describe('removeVote', () => {
  test('should return 200 when removing a vote', async () => {
    mock_db.Votes.destroy = jest.fn(() => new Promise((resolve, reject) => resolve(true)));
    await controller.removeVote(mock_ctx, mock_db);
    expect(mock_ctx.status).toEqual(200);
  });

  test('should return 500 if the vote removal fails', async () => {
    mock_db.Votes.destroy = jest.fn(() => new Promise((resolve, reject) => reject(false)));
    await controller.removeVote(mock_ctx, mock_db);
    expect(mock_ctx.status).toEqual(500);
  });
})

describe('loadFavoritesFromListWithScore', () => {
  test('should return 200 when loading restaurants from the list', async () => {
    const mockMockDb = [
      {
        dataValues: {
          Lists: [
            {
              FavoritesLists: {
                score: 7
              }
            }
          ]
        }
      },
      {
        dataValues: {
          Lists: [
            {
              FavoritesLists: {
                score: 5
              }
            }
          ]
        }
      }
    ]
    mock_db.Favorites.findAll = jest.fn(() => new Promise((resolve, reject) => resolve(mockMockDb)));
    await controller.loadFavoritesFromListWithScore(mock_ctx, mock_db);
    expect(mock_ctx.body.length).toEqual(2);
    expect(mock_ctx.status).toEqual(200);
  });

  test('should return 500 when loading restaurants from the list fails', async () => {
    mock_db.Favorites.findAll = jest.fn(() => new Promise((resolve, reject) => reject(false)));
    await controller.loadFavoritesFromListWithScore(mock_ctx, mock_db);
    expect(mock_ctx.status).toEqual(500);
  });
})

describe('loadVotesFromAllUsers', () => {
  test('should return 200 when loading votes from all users', async () => {
    mock_ctx.params.listId = 'hello';
    const mockVotes = [
      {
        dataValues: {
          favorited : 'Restaurant1'
        }
      },
      {
        dataValues: {
          favorited : 'Restaurant1'
        }
      },
      {
        dataValues: {
          favorited : 'Restaurant2'
        }
      },
    ]

    const mockFavorites = [
      {
        dataValues: {
          id : 'Restaurant1'
        }
      },
      {
        dataValues: {
          id : 'Restaurant2'
        }
      },
      {
        dataValues: {
          id : 'Restaurant3'
        }
      },
    ]
    mock_db.Votes.findAll = jest.fn(() => new Promise((resolve, reject) => resolve(mockVotes)));
    mock_db.Favorites.findAll = jest.fn(() => new Promise((resolve, reject) => resolve(mockFavorites)));
    mock_db.FavoritesLists.update = jest.fn(() => new Promise((resolve, reject) => resolve(true)));
    await controller.loadVotesFromAllUsers(mock_ctx, mock_db);
    expect(mock_ctx.status).toEqual(200);
    expect(mock_ctx.body).toEqual('hello');
  });

  test('should return 500 if loading votes for the list fails', async () => {
    mock_db.Votes.findAll = jest.fn(() => new Promise((resolve, reject) => reject(new Error('Pepa'))));
    await controller.loadVotesFromAllUsers(mock_ctx, mock_db);
    expect(mock_ctx.status).toEqual(500);
  });
})
