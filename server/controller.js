const db = require('./models/index.js');

exports.searchRestaurants = async (ctx, client) => {
  const input = ctx.request.body;
  try {
    await client.search(input).then(response => {
      const results = response.jsonBody.businesses;
      ctx.body = results;
      ctx.status = 200;
    })
  } catch (err) {
    console.log(err);
    ctx.body = err;
    ctx.status = 500;
  }
}

exports.getListInfo = async (ctx, db) => {
  const listId = ctx.params.listId;
  try {
    const listInfo = await db.Lists.findOne({
      where: {
        id: listId
      },
      raw: true
    })
    ctx.body = listInfo;
    ctx.status = 200;
  } catch (err) {
    console.log(err);
    ctx.body = err;
    ctx.status = 500;
  }
}

//REVIEW! QUÉ HACE INCLUDE ATTRIBUTES
exports.addToFavorites = async (ctx, db) => {
  const selectedRestaurant = ctx.request.body;
  const currentListId = ctx.params.list;

  // first, get all restaurants in this list
  const list = await db.Lists.find({
    where: { id: currentListId },
    include: [{
      model: db.Favorites,
      attributes: ['id'],
    }]
  });

  // then, check if the restaurant exists in this list
  const restaurantExistsInList = list.dataValues.Favorites.filter(restaurant => restaurant.id === selectedRestaurant.id);
  console.log('restaurant exists in the list', restaurantExistsInList)

  if (restaurantExistsInList.length !== 0) {
    ctx.body = {
      "error": ['Already added']
    }
    ctx.status = 400;
  } else {
    try {

      //check if the restaurant exists in the Favorites Database (main table)
      const fav = await db.Favorites.find({
        where: {
          id: selectedRestaurant.id
        }
      })

      if (fav) {
        // if it exists, then just add it to the List
        await db.FavoritesLists.create({favoriteId: selectedRestaurant.id, listId: currentListId});
        ctx.body = selectedRestaurant;
        console.log(selectedRestaurant);
        ctx.status = 200;
      } else {
        await db.Favorites.create(selectedRestaurant);
        await db.FavoritesLists.create({favoriteId: selectedRestaurant.id, listId: currentListId});
        ctx.body = selectedRestaurant;
        console.log(selectedRestaurant);
        ctx.status = 200;
      }

    } catch (err) {
      console.log(err);
      ctx.body = err;
      ctx.status = 500;
    }
  }
}

exports.removeFromFavorites = async (ctx) => {
  const restaurantId = ctx.params.id;
  const listId = ctx.params.list;
  try {
    await db.FavoritesLists.destroy({
      where: {
        favoriteId: restaurantId,
        listId: listId
      }
    });
    ctx.status = 200;
  } catch (err) {
    console.log(err); //eslint-disable-line
    ctx.status = 500;
  }
}

exports.createList = async (ctx) => {
  const submittedList = ctx.request.body;

  try {
    const newList = await db.Lists.create({
      listname: submittedList.listname,
      listdetails: submittedList.listdetails,
      id: submittedList.listId //refactor this to generate the UUID in the backend instead of the frontend
    })
    ctx.body = newList;
    console.log('newList created', newList);
    ctx.status = 200;
  } catch (err) {
    console.log(err);
    ctx.status = 500;
  }
}

exports.addVote = async (ctx) => {
  const list = ctx.request.body.listId;
  const favorited = ctx.request.body.restaurantId;
  const user = ctx.request.body.username;
  try {
    await db.Votes.create({
      list: list,
      favorited: favorited,
      user: user
    })
    ctx.status = 200;
  } catch (err) {
    console.log(err)
  }
}

exports.removeVote = async (ctx) => {
  const list = ctx.request.body.listId;
  const favorited = ctx.request.body.restaurantId;
  const user = ctx.request.body.username;
  try {
    await db.Votes.destroy({
      where: {
        list: list,
        favorited: favorited,
        user: user
      }
    })
    ctx.status = 200;
  } catch (err) {
    console.log(err)
  }
}

exports.loadVotesFromAllUsers = async (ctx) => {
  const listId = ctx.params.listId;

  try {
    const votesInList = await db.Votes.findAll({
      where: {
        list: listId
      }
    })

    const objs = votesInList.map(res => res.dataValues);

    // {}, value, 0/1/3/3, input array
    function reducer(acc, currentValue, currentIndex, objs) {
      // on the currentValue, check if the favoriteId exists. if it does, add 1 to its value. else, create new key
      if (acc[currentValue.favorited]) {
        acc[currentValue.favorited]++;
      } else {
        acc[currentValue.favorited] = 1;
      }
      return acc;
    }

    const voteCounts = objs.reduce(reducer, {}); // returns an object where key is the restaurantId and the value is the accumulated score
    const props = Object.entries(voteCounts);

    const updated = props.map(prop => {
      return db.FavoritesLists.update(
        {
          score: prop[1]
        },
        {
        where: {
          favoriteId: prop[0],
          listId: listId
        }
      })
    })

    const result = await Promise.all(updated);
    console.log(result);

    ctx.body = listId;
    ctx.status = 200;
  } catch (err) {
    console.log(err);
  }
}


exports.loadFavoritesFromListWithScore = async (ctx) => {
  const listId = ctx.params.listId;

  try {
    const favoritesOnLoad = await db.Favorites.findAll({ // get all favorites in sharedlist
      include: [{
        model: db.Lists,
        where: { id: listId },
        through: {
          attributes: ['score'] // A list of attributes to select from the join model for belongsToMany relations
        }
      }]
    })

    const result = favoritesOnLoad.map(res => ({
      ...res.dataValues,
      score: res.dataValues.Lists[0].FavoritesLists.score
    }));

    ctx.body = result;
    ctx.status = 200;
  } catch (err) {
    console.log(err);
  }
}
