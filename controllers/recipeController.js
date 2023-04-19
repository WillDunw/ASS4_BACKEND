const express = require("express");
const router = express.Router();
const routeRoot = "/";

let model = require("../models/recipeModelMongoDB");
const {InvalidInputError, DatabaseError} = require('../models/customErrors');

const logger = require('../logger');
/**
 * Creates a new recipe in the database, using the passed in body parameters.
 * @params req: request with body containing the title, the instructions, the time to prepare, the ingredients, the userID of the user creating it, the approximate cost and the meal type.
 * @params res: the response to the request.
 * If the parameters are in an invalid format the response will be of status code 400.
 * If there was an error accessing the database or an unexpected error, status of the response will be 500.
 * Otherwise, the response will have a status of 200 and a message indicating the recipe was successfully created.
 */
//Why does it not throw a user error?????
router.post("/recipes", createRecipe);
async function createRecipe(req, res){
    try{
        let createdRecipe = await model.addRecipe(req.body.title, req.body.instructions, +req.body.timeToPrepare,req.body.ingredients,
            +req.body.userID, +req.body.approximateCost, req.body.mealType);
            logger.info("Model call for POST in /recipes done without error.");
            res.send(createdRecipe);
    }
    catch(e){
        if(e instanceof InvalidInputError){
        logger.error("User error in POST controller for /recipes. " + e.message);
            res.status(400);
            res.send({errorMessage: e.message});
        }
        else if(e instanceof DatabaseError){
            logger.error("System error in POST controller for /recipes. " + e.message);
            res.status(500);
            res.send({errorMessage: e.message});
        }
        else{
            logger.error("Unexpected error in POST controller for /recipes. " + e.message);
            res.status(500);
            res.send({errorMessage: e.message});
        }
    }
}

/**
 * Reads a single recipe from the database. The URL must have a recipeID query parameter used 
 * to retrieve the right recipe.

 * @params req: request containing the title of the recipe and the userID of the user who posted the recipe.
 * The body parameters must match the recipe exactly, the database is case sensitive.
 * @params res: the response to the request.
 * If the parameters are in an invalid format or the recipe was not found the response will be of status code 400.
 * If there was an error accessing the database or an unexpected error, status of the response will be 500.
 * Otherwise, the response will have a status of 200 and a string indicating the recipe posted by a certain user was found.
 */
router.get("/recipes", readSingleRecipe);
async function readSingleRecipe(req, res){
    try{
        let readRecipe = await model.getSingleRecipe(req.query.recipeID);
        logger.info("Model call for GET in /recipes done without error.");
        res.send(readRecipe)
    }
    catch(e){
        if(e instanceof InvalidInputError){
            logger.error("User error in GET controller for a single recipe in endpoint /recipes. " + e.message);
            res.status(400);
            res.send({errorMessage: e.message});
        }
        else if(e instanceof DatabaseError){
            logger.error("System error in GET controller for a single recipe in /recipes. " + e.message);
            res.status(500);
            res.send({errorMessage: e.message});
        }
        else{
            logger.error("Unexpected error in GET controller for a single recipe in /recipes. " + e.message);
            res.status(500);
            res.send({errorMessage: e.message});
        }
    }
}

/**
 * Reads all the recipes from the database.
 @params req: the request.
 @params res: the response to the request.
 * If there are no recipes in the database the response will be of status code 400.
 * If there was an error accessing the database or an unexpected error, status of the response will be 500.
 * Otherwise, the response will have a status of 200 and will contain a string with all the recipe titles.
 */
router.get("/recipes/all", readAllRecipes);
async function readAllRecipes(req, res){
    try{
        let recipes = await model.getAllRecipes();
        logger.info("Response in /recipes/all built without error.");
        res.send(recipes);
    }
    catch(e){
        if(e instanceof InvalidInputError){
            logger.error("User error in GET controller for /recipes/all. " + e.message);
            res.status(400);
            res.send({errorMessage: e.message});
        }
        else if(e instanceof DatabaseError){
            logger.error("System error in GET controller for /recipes/all. " + e.message);
            res.status(500);
            res.send({errorMessage: e.message});
        }
        else{
            logger.error("Unexpected error in GET controller for /recipes/all. " + e.message);
            res.status(500);
            res.send({errorMessage: e.message});
        }
    }
}

/**
 * Updates the recipe details in the database, using the passed in body parameters.
 * @params req: request containing the title and userID of the recipe to be updated, along with the new details for that recipe.
 * The body parameters to locate the recipe must match the recipe exactly, the database is case sensitive.
 * @params res: the response to the request.
 * If the parameters are in an invalid format or the recipe to update could not be found the response will be of status code 400.
 * If there was an error accessing the database or an unexpected error, status of the response will be 500.
 * Otherwise, the response will have a status of 200 and a message indicating the update was successfull.
 */
router.put("/recipes", updateRecipe);
async function updateRecipe(req, res){
    try{
        let updatedRecipe = await model.updateRecipe(req.body.recipeID, req.body.newTitle, req.body.newInstructions,req.body.newTimeToPrepare,req.body.newIngredients,
            req.body.newUserID, req.body.newApproximateCost, req.body.newMealType);
            logger.info("Model call for PUT in /recipes done without error.");
            res.send(updatedRecipe);
    }
    catch(e){
        if(e instanceof InvalidInputError){
            logger.error("User error in PUT controller for /recipes. " + e.message);
            res.status(400);
            res.send({errorMessage: e.message});
        }
        else if(e instanceof DatabaseError){
            logger.error("System error in PUT controller for /recipes. " + e.message);
            res.status(500);
            res.send({errorMessage: e.message});
        }
        else{
            logger.error("Unexpected error in PUT controller for /recipes. " + e.message);
            res.status(500);
            res.send({errorMessage: e.message});
        }
    }
}

/**
 * Deletes a recipe in the database, using the passed in body parameters.
 * @params req: the request containing the title and userID of the recipe to delete.
 * The body parameters must match the recipe exactly, the database is case sensitive.
 * @params res: the response to the request.
 * If the parameters are in an invalid format or the recipe to delete to could not be found the response will be of status code 400.
 * If there was an error accessing the database or an unexpected error, status of the response will be 500.
 * Otherwise, the response will have a status of 200 and a message indicating that the delete was successful.
 */
router.delete("/recipes", deleteRecipe);
async function deleteRecipe(req,res){
    try{
        let deletedRecipe = await model.deleteRecipe( req.body.recipeID);
        logger.info("Model call for DELETE in /recipes done without error.");
        res.send(deletedRecipe);
    }
    catch(e){
        if(e instanceof InvalidInputError){
            logger.error("User error in DELETE controller for /recipes. " + e.message);
            res.status(400);
            res.send({errorMessage: e.message});
        }
        else if(e instanceof DatabaseError){
            logger.error("System error in DELETE controller for /recipes. " + e.message);
            res.status(500);
            res.send({errorMessage: e.message});
        }
        else{
            logger.error("Unexpected error in DELETE controller for /recipes. " + e.message);
            res.status(500);
            res.send({errorMessage: e.message});
        }
    }
}

module.exports = {
    router,
    routeRoot
};