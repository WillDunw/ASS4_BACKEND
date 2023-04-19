const express = require('express');
const router = express.Router();
const routeRoot = '/';

/**
 * Responds with a status code of 404 if the URL entered did not correspond to any endpoints available.
 */
router.all('*', displayError);
function displayError(req, res){
    res.status(404);
    res.send("Invalid URL. Please try again.")
};

module.exports = {
    router,
    routeRoot
};