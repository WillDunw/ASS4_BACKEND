const express = require('express');
const app = express();

const logger = require('./logger');
const pinohttp = require('pino-http');
const httplogger = pinohttp({
    logger: logger
});

app.use(httplogger);

const bodyParser = require('body-parser');
const cors = require('cors');

//list of all controllers to be used
const controllers = ['homeController','recipeController','errorController'];

app.use(cors());
app.use(express.json());
//configuring body parser and middleware
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

//register the routes from all controllers
//this assumes a flat directory structure and a common routeRoot being "/" and router export
controllers.forEach((controllerName) => {
    try{
        const controllerRoutes = require('./controllers/' + controllerName);
        app.use(controllerRoutes.routeRoot, controllerRoutes.router);
    }
    catch(e){
        logger.error('Error while creating controllers in app.js ' + e.message);
        throw e;
    }
})

module.exports = app;