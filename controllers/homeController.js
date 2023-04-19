const express = require('express');
const router = express.Router();
const routeRoot = '/';

/**
 * Responds with a simple welcome message, always succeeding and having a status code of 200.
 */
router.get('/home', displayWelcome);
function displayWelcome(req, res){
    res.send(`Welcome to the recipe site.`);
}

module.exports = {
    router,
    routeRoot
};