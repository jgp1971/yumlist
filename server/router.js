const Router = require('koa-router');
const ctrl = require('./controller');
const db = require('./models/index.js');
const router = new Router();

const yelp = require('yelp-fusion');
const apiKey = 'h4_q1q5YJlDRpeOGv3eqZKyDjvxbcbneydPEJf5JXwvTz3VaLW9tWHymOGEBvqsWlgXCahNAiXlCHk__6lNhGXJiwfVOd5dBt3HKCxPb8bvykHOJ3BCzaneanFV0XHYx';
const client = yelp.client(apiKey);

// add and remove votes on each list
router.post('/addvote', ctrl.addVote);
router.delete('/removevote', ctrl.removeVote);

router.put('/updateshared/:listId', ctrl.loadVotesFromAllUsers);

router.get('/loadshared/:listId', ctrl.loadFavoritesFromListWithScore);

router.get('/:listId', (ctx) => ctrl.getListInfo(ctx, db));

router.get('/load/:listId', ctrl.loadFavoritesFromListWithScore);

router.post('/search', (ctx) => ctrl.searchRestaurants(ctx, client));

router.post('/createlist', ctrl.createList);

router.post('/addtofavorites/:list', (ctx) => ctrl.addToFavorites(ctx, db)); // done

router.delete('/removefromfavorites/:list/:id', ctrl.removeFromFavorites); // done

module.exports = router;