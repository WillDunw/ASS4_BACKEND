const dbName = "Recipe";
const { MongoClient } = require("mongodb");
const validateUtils = require("./validateUtils");
const { DatabaseError, InvalidInputError } = require("./customErrors");

const logger = require('../logger');

let client;
let recipesCollection;
/**
 * Connect up to the online MongoDb database with the name stored in dbName
 */

async function initialize(recipeDbName, resetFlag, url) {
  try {
    client = new MongoClient(url);
    await client.connect();
    logger.info("Connected to MongoDb");
    db = client.db(dbName);

    //check to see if recipes collection exists
    collectionCursor = await db.listCollections({ name: recipeDbName });
    collectionArray = await collectionCursor.toArray();

    if (collectionArray.length == 0) {
      //collation specifying case-insensitve collection
      const collation = { locale: "en", strength: 1 };
      //no match was found, so create new collection
      await db.createCollection(recipeDbName, { collation: collation });
    }
    recipesCollection = db.collection(recipeDbName); //convenient access to collection

    if (resetFlag) {
      await recipesCollection.drop();
      const collation = { locale: "en", strength: 1 };
      await db.createCollection(recipeDbName, { collation: collation });
      recipesCollection = db.collection(recipeDbName);
    }
  } catch (err) {
    logger.error("Error in initialize function in recipeModelMongoDB.js" + err.message);
    throw new DatabaseError(err.message);
  }
}

/**
 * Adds a recipe to the collection. The recipeID is automatically assigned and is auto incrementing.
 * Assumptions: the userID passed in is a valid one. The ingredients passed in are an array (we still double check).
 * @param {*} title : The title of the recipe. Can contain numbers.
 * @param {*} instructions : The instructions to complete the recipe. Can contain numbers.
 * @param {*} timeToPrepare : The time in minutes taken to prepare. A number.
 * @param {*} ingredients : The ingredients needed disregarding quantities. An array of strings.
 * @param {*} userID : The ID of the user that created the recipe.
 * @param {*} approximateCost : The approximate cost of all the ingredients in the recipe. A number.
 * @param {*} mealType : The type of meal the recipe belongs to. Accepted types are: breakfast, brunch, lunch, dinner, snack, dessert
 * @returns A recipe object if the insertion was successful
 * @throws An InvalidInputError if any of the parameters passed in were invalid. A DatabaseError if there was any other problem writing to the database.
 */
async function addRecipe(
  title,
  instructions,
  timeToPrepare,
  ingredients,
  userID,
  approximateCost,
  mealType
) {
  try {
    //will throw appropriate error with right message
    if (
      await allValidate(
        title,
        instructions,
        timeToPrepare,
        ingredients,
        approximateCost,
        mealType
      )
    ) 
    {

      //figuring this out rn
      let recipeID = await getCurrentRecipeID();
      await recipesCollection.insertOne({
        recipeID: recipeID,
        title: title,
        instructions: instructions,
        timeToPrepare: timeToPrepare,
        ingredients: ingredients,
        userID: userID,
        approximateCost: approximateCost,
        mealType: mealType
      });
    
    logger.debug("insertOne call in addRecipe method in model successful.");
    return {
      recipeID: recipeID,
      title: title,
      instructions: instructions,
      timeToPrepare: timeToPrepare,
      ingredients: ingredients,
      userID: userID,
      approximateCost: approximateCost,
      mealType: mealType
    }};
  } catch (e) {
    logger.error("Error in addRecipe method in recipeModelMongoDB.js: " + e.message);
    if (e instanceof InvalidInputError) {
      throw new InvalidInputError("Error in addRecipe method in recipeModelMongoDB.js: " + e.message);
    }
    throw new DatabaseError("Error in addRecipe method in recipeModelMongoDB.js: " + e.message);
  }
}

/**
 * Reads a recipe from the database.
 * @param {*} recipeTitle : The title of the recipe to be read.
 * @returns An recipe object if the read was successful.
 * @throws An InvalidInputError if the recipe was not found. A DatabaseError if there was any other problem reading from the database.
 */
async function getSingleRecipe(recipeID) {
  try {
    
    let recipe = await recipesCollection.findOne({  recipeID: +recipeID });
    //doesn't matter what we check for null, if any 1 is null we know there was an error retrieving the
    if (recipe == null) {
      throw new InvalidInputError("Recipe not found with id: " + recipeID);
    }
    logger.debug("findOne call in getSingleRecipe method in model successful.");
    return recipe;
  } catch (err) {
    logger.error("Error in getSingleRecipe method in recipeModelMongoDB.js: " + err.message);
    if (err instanceof InvalidInputError) {
      throw new InvalidInputError("Error in getSingleRecipe method in recipeModelMongoDB.js: " + err.message);
    }
    throw new DatabaseError("Error in getSingleRecipe method in recipeModelMongoDB.js: " + err.message);
  }
}

/**
 * Gets all the recipes from the database.
 * @returns An array of all the recipes in the database.
 * @throws A DatabaseError if there were no recipes in the database. A generic Error if there was any other error.
 */
async function getAllRecipes() {
  try {
    let allRecipes = await recipesCollection.find({});
    let recipesArray = await allRecipes.toArray();

    //excludes record that saves the ids
    let allRecipesArray = recipesArray.filter(recipe => recipe.recipeIDRecord == null);
    logger.debug("find call in getAllRecipes method in model successful.");
    return allRecipesArray;
  } catch (err) {
    logger.error("Error in getAllRecipes method in recipeModelMongoDB.js: " + err.message);
    if(err instanceof InvalidInputError){
      throw new InvalidInputError("Error in getAllRecipes method in recipeModelMongoDB.js: " + err.message);
    }
    else{
      throw new DatabaseError("Error in getAllRecipes method in recipeModelMongoDB.js: " + err.message);
    }
  }
}

/**
 * Updates a single recipe from the collection. Does not update the userID of the person who created the recipe.
 * @param {*} titleToUpdate : the title of the recipe to update.
 * @param {*} newTitle : The new title of the recipe.
 * @param {*} newInstructions : The new instructions to complete the recipe.
 * @param {*} newTimeToPrepare : The new time in minutes taken to prepare.
 * @param {*} newIngredients : The new ingredients needed disregarding quantities.
 * @param {*} newApproximateCost : The new approximate cost of all the ingredients in the recipe.
 * @param {*} newMealType : The new type of meal the recipe belongs to.
 * @returns A recipe object if the update was successful.
 * @throws An InvalidInputError if the parameters are invalid or if the recipe to update could not be found. A DatabaseError if there was any other problem with the update operation.
 */
async function updateRecipe(
  recipeID,
  newTitle,
  newInstructions,
  newTimeToPrepare,
  newIngredients,
  newUserID,
  newApproximateCost,
  newMealType
) {
  try {
    if (
      await allValidate(
        newTitle,
        newInstructions,
        newTimeToPrepare,
        newIngredients,
        newApproximateCost,
        newMealType
      )
    ) {
      let returnDocument = await recipesCollection.updateOne(
        { recipeID: recipeID},
        {
          $set: {
            title: newTitle,
            instructions: newInstructions,
            timeToPrepare: +newTimeToPrepare,
            ingredients: newIngredients,
            userID: +newUserID,
            approximateCost: +newApproximateCost,
            mealType: newMealType
          },
        },
        { upsert: true }
      );
      let updatedRecipe = await recipesCollection.findOne({ recipeID: recipeID});

      if (returnDocument.modifiedCount == 0) {
        throw new InvalidInputError(
          "No entry found with id: " + recipeID
        );
      }
      logger.debug("updateOne call in updateRecipe method in model successful.");
      return updatedRecipe;
    }
  } catch (e) {
    logger.error("Error in updateRecipe method in recipeModelMongoDB.js: " + e.message);
    if (e instanceof InvalidInputError) {
      throw new InvalidInputError("Error in updateRecipe method in recipeModelMongoDB.js: " + e.message);
    }
    throw new DatabaseError("Error in updateRecipe method in recipeModelMongoDB.js: " + e.message);
  }
}

/**
 * Deletes the recipe with the corresponding ID that is passed in.
 * @param {*} titleToUpdate : the title of the recipe to be deleted.
 * @throws An InvalidInputError if the recipe to delete could not be found. A DatabaseError if there was any other problem connecting to the database.
 */
async function deleteRecipe(recipeID) {
  try {
    let deletedRecipe = await recipesCollection.findOne({ recipeID: recipeID});
    let returnDocument = await recipesCollection.deleteOne({ recipeID: recipeID});
    if (returnDocument.deletedCount == 0) {
      throw new InvalidInputError(
        "Recipe to delete could not be found with id: " + recipeID
      );
    }
    logger.debug("deleteOne call in deleteRecipe method in model successful.");
    return deletedRecipe;
  } catch (err) {
    logger.error("Error in deleteRecipe method in recipeModelMongoDB.js: " + err.message);
    if (err instanceof InvalidInputError) {
      throw new InvalidInputError("Error in deleteRecipe method in recipeModelMongoDB.js: " + err.message);
    }
    throw new DatabaseError("Error in deleteRecipe method in recipeModelMongoDB.js: " + err.message);
  }
}

/**
 * Runs all validation functions for specific parameters. Grouped t avoid code repetition and increase readability.
 * @param {*} title
 * @param {*} instructions
 * @param {*} timeToPrepare
 * @param {*} ingredients
 * @param {*} approximateCost
 * @param {*} mealType
 * @returns true if the input is valid.
 * @throws InvalidInputError if the input is invalid
 */
async function allValidate(
  title,
  instructions,
  timeToPrepare,
  ingredients,
  approximateCost,
  mealType
) {
  try {
    if (!validateUtils.validTitle(title)) {
    } else if (!validateUtils.validInstructions(instructions)) {
    } else if (!validateUtils.validTimeToPrepare(timeToPrepare)) {
    } else if (!validateUtils.validIngredients(ingredients)) {
    } else if (!validateUtils.validCost(approximateCost)) {
    } else if (!validateUtils.validMealType(mealType)) {
    }
    return true;
  } catch (e) {
    if (e instanceof InvalidInputError) {
      throw new InvalidInputError(e.message);
    }
    throw new Error(e.message);
  }
}

/**
 * Closes the connection to the database.
 */
async function close() {
  try {
    await client.close();
    logger.info("Closed connection");
  } catch (err) {
    logger.error("Error while closing database connection: " + err.message);
  }
}

/**
 * Gets the collection.
 * @returns The collection for use in another file
 */
async function getCollection() {
  return recipesCollection;
}

/**
 * GEts the next id for the recipe to be added.
 * @returns the next recipe id for a new recipe creation. 
 */
async function getCurrentRecipeID(){
  let currentID = await recipesCollection.findOne({recipeIDRecord : {$gte: 0}});
  currentID = currentID.recipeIDRecord + 1;
  //this can be done in the background no big deal
  incrementRecipeIDRecord(currentID);
  return currentID;
}

/**
 *Increments the recipeID saved in the record keeping track of them.
 * @param {number} IDToUpdateTo The new ID top be set to.
 */
async function incrementRecipeIDRecord(IDToUpdateTo){
  await recipesCollection.updateOne({recipeIDRecord : {$gte: 0}}, 
    {$set: {recipeIDRecord : IDToUpdateTo}},
    {upsert: true});
}

module.exports = {
  getCollection,
  initialize,
  addRecipe,
  getSingleRecipe,
  getAllRecipes,
  close,
  updateRecipe,
  deleteRecipe,
};
