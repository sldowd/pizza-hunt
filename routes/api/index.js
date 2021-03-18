const router = require('express').Router();
const pizzaController = require('../../controllers/pizza-controllers');
const pizzaRoutes = require('./pizza-routes');

// add prefix of '/pizzas/ to routes created in 'pizza-routes.js'
router.use('/pizzas', pizzaRoutes);

module.exports = router;