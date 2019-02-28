const yelp = require('yelp-fusion');
const apiKey = 'h4_q1q5YJlDRpeOGv3eqZKyDjvxbcbneydPEJf5JXwvTz3VaLW9tWHymOGEBvqsWlgXCahNAiXlCHk__6lNhGXJiwfVOd5dBt3HKCxPb8bvykHOJ3BCzaneanFV0XHYx';
const client = yelp.client(apiKey);
const db = require('./models/index.js');
const crypto = require('crypto');

exports.searchRestaurants = async (ctx) => {
  const restaurant = ctx.request.body;
  
  await client.search(restaurant).then(response => {
    const results = response.jsonBody.businesses;
    ctx.body = results;
  }).catch(e => {
    console.log(e);
  });
  
}

exports.loadFavorites = async (ctx) => {
  try {
    const favorites = await db.Favorites.findAll();
    ctx.body = favorites;
    ctx.status = 200;
  } catch (err) {
    console.log(err);
    ctx.status = 404;
  }
}

exports.addToFavorites = async (ctx) => {
  const selectedRestaurant = ctx.request.body;

  const existingRestaurant = await db.Favorites.findAll({
    where: {
      name: selectedRestaurant.name
    }
  });

  if (existingRestaurant.length !== 0) {
    console.log('You already added this restaurant to your list');
    ctx.status = 200;
  } else {
    await db.Favorites.create(selectedRestaurant);
    ctx.body = selectedRestaurant;
    ctx.status = 200;
  }
}

exports.removeFromFavorites = async (ctx) => {
  const restaurantId = ctx.params.id;
  const unfavorited = await db.Favorites.findById(restaurantId);
  try {
    await db.Favorites.destroy({
      where: {
        id: restaurantId
      }
    });
    ctx.body = unfavorited;
    ctx.status = 200;
  } catch (err) {
    console.log(err); //eslint-disable-line
    ctx.status = 500;
  }
}

exports.createList = async (ctx) => {
  const listOfRestaurants = ctx.request.body;

  const newList = await db.Lists.create({
    listname: listOfRestaurants.listname,
    listdetails: listOfRestaurants.listdetails
  });

  const restaurantsInList = listOfRestaurants.restaurantsinlist;
  const hashedId = crypto.randomBytes(8).toString('hex');

  await Promise.all(restaurantsInList.map(async (restaurant) => {
    await db.FavoritesList.create({
      favoriteId: restaurant.id,
      listId: newList.id
    })
  }))
  .then(ctx.body = hashedId)
  .then(console.log(ctx.body))
  .catch(err => {
    console.log(err);
  })

  // const hash = crypto.createHmac('sha256', listOfRestaurants.listname).digest('hex');


  
}