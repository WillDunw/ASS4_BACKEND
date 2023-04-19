const { InvalidInputError, DatabaseError } = require("../models/customErrors");
const model = require("../models/recipeModelMongoDB");
const db = "recipes_test";
require("dotenv").config();
const { MongoMemoryServer } = require("mongodb-memory-server");
let mongod;

const app = require("../app");
const supertest = require("supertest");
const testRequest = supertest(app);

const logger = require("./loggerSync");
//find out how to make sync so no weirdness with jest tests

const recipeData = [
  {
    title: "Recipe 1",
    instructions: "Step 1",
    timeToPrepare: 20,
    ingredients: ["chicken", "parm"],
    userID: 23345 /*test ID*/,
    approximateCost: 20,
    mealType: "brunch",
  },
  {
    title: "Recipe 2",
    instructions: "Step 2",
    timeToPrepare: 10,
    ingredients: ["beef", "stew"],
    userID: 2334775 /*test ID*/,
    approximateCost: 24,
    mealType: "breakfast",
  },
  {
    title: "Recipe 3",
    instructions: "Step 3",
    timeToPrepare: 30,
    ingredients: ["porc", "pulled"],
    userID: 23312455 /*test ID*/,
    approximateCost: 25,
    mealType: "dinner",
  },
  {
    title: "Recipe 4",
    instructions: "Step 4",
    timeToPrepare: 25,
    ingredients: ["veal", "pasta"],
    userID: 2335 /*test ID*/,
    approximateCost: 14,
    mealType: "snack",
  },
  {
    title: "Recipe 5",
    instructions: "Step 5",
    timeToPrepare: 21,
    ingredients: ["lamb", "chops"],
    userID: 2366455 /*test ID*/,
    approximateCost: 10,
    mealType: "dessert",
  },
  {
    title: "Recipe 6",
    instructions: "Step 6",
    timeToPrepare: 34,
    ingredients: ["steak", "garlic"],
    userID: 2367355 /*test ID*/,
    approximateCost: 10,
    mealType: "brunch",
  },
  {
    title: "Recipe 7",
    instructions: "Step 7",
    timeToPrepare: 12,
    ingredients: ["bacon", "tomatoes"],
    userID: 2547455 /*test ID*/,
    approximateCost: 13,
    mealType: "lunch",
  },
  {
    title: "Recipe 8",
    instructions: "Step 8",
    timeToPrepare: 31,
    ingredients: ["zucchini", "cheese"],
    userID: 233435455 /*test ID*/,
    approximateCost: 24,
    mealType: "brunch",
  },
  {
    title: "Recipe 9",
    instructions: "Step 9",
    timeToPrepare: 12,
    ingredients: ["dumplings", "soup"],
    userID: 2354355 /*test ID*/,
    approximateCost: 20,
    mealType: "lunch",
  },
  {
    title: "Recipe 10",
    instructions: "Step 10",
    timeToPrepare: 16,
    ingredients: ["watermelon", "sugar"],
    userID: 21133455 /*test ID*/,
    approximateCost: 20,
    mealType: "snack",
  },
  {
    title: "Recipe 11",
    instructions: "Step 11",
    timeToPrepare: 2,
    ingredients: ["cookies", "milk"],
    userID: 2335435 /*test ID*/,
    approximateCost: 20,
    mealType: "dinner",
  },
  {
    title: "Recipe 12",
    instructions: "Step 12",
    timeToPrepare: 5,
    ingredients: ["eggs", "toast"],
    userID: 233455 /*test ID*/,
    approximateCost: 20,
    mealType: "dinner",
  },
  {
    title: "Recipe 13",
    instructions: "Step 13",
    timeToPrepare: 24,
    ingredients: ["salsa", "chips"],
    userID: 233455 /*test ID*/,
    approximateCost: 20,
    mealType: "snack",
  },
  {
    title: "Recipe 14",
    instructions: "Step 14",
    timeToPrepare: 4,
    ingredients: ["curry", "coriander"],
    userID: 233455 /*test ID*/,
    approximateCost: 20,
    mealType: "brunch",
  },
  {
    title: "Recipe 15",
    instructions: "Step 15",
    timeToPrepare: 5,
    ingredients: ["egg whites", "tortilla"],
    userID: 34456 /*test ID*/,
    approximateCost: 234,
    mealType: "brunch",
  },
  {
    title: "Recipe 16",
    instructions: "Step 16",
    timeToPrepare: 4,
    ingredients: ["curry", "coriander"],
    userID: 233234 /*test ID*/,
    approximateCost: 20,
    mealType: "brunch",
  },
  {
    title: "Recipe 17",
    instructions: "Step 17",
    timeToPrepare: 4,
    ingredients: ["curry", "coriander"],
    userID: 2333566 /*test ID*/,
    approximateCost: 20,
    mealType: "brunch",
  },

  {
    title: "Recipe 18",
    instructions: "Step 18",
    timeToPrepare: 4,
    ingredients: ["curry", "coriander"],
    userID: 236345 /*test ID*/,
    approximateCost: 20,
    mealType: "brunch",
  },
  {
    title: "Recipe 19",
    instructions: "Step 19",
    timeToPrepare: 4,
    ingredients: ["curry", "coriander"],
    userID: 6573346 /*test ID*/,
    approximateCost: 20,
    mealType: "brunch",
  },
  {
    title: "Recipe 20",
    instructions: "Step 20",
    timeToPrepare: 4,
    ingredients: ["curry", "coriander"],
    userID: 525623 /*test ID*/,
    approximateCost: 20,
    mealType: "brunch",
  },
  {
    title: "Recipe 21",
    instructions: "Step 21",
    timeToPrepare: 4,
    ingredients: ["curry", "coriander"],
    userID: 54789 /*test ID*/,
    approximateCost: 20,
    mealType: "brunch",
  },
  {
    title: "Recipe 22",
    instructions: "Step 22",
    timeToPrepare: 4,
    ingredients: ["curry", "coriander"],
    userID: 68735 /*test ID*/,
    approximateCost: 20,
    mealType: "brunch",
  },
];

const generateRecipeData = () =>
  recipeData.splice(Math.floor(Math.random() * recipeData.length), 1)[0];

beforeAll(async () => {
  // Create new instance of "MongoMemoryServer" and auto start it
  mongod = await MongoMemoryServer.create();
  logger.info("Mock Database started");
});

afterAll(async () => {
  await mongod.stop(); //stop memory server
  logger.info("Mock Database stopped");
});

beforeEach(async () => {
  try {
    const url = mongod.getUri();
    await model.initialize(db, true, url);
    jest.setTimeout(() => {}, 50000);
    let collection = await model.getCollection();
    await collection.insertOne({recipeIDRecord: 0});
  } catch (err) {
    logger.error(err.message);
  }
});

afterEach(async () => {
  await model.close();
});

test("POST /recipes success case", async () => {
  const recipeToCreate = generateRecipeData();

  let testResponse = await testRequest.post("/recipes").send({
    title: recipeToCreate.title,
    instructions: recipeToCreate.instructions,
    timeToPrepare: recipeToCreate.timeToPrepare,
    ingredients: recipeToCreate.ingredients,
    userID: recipeToCreate.userID,
    approximateCost: recipeToCreate.approximateCost,
    mealType: recipeToCreate.mealType,
  });

  expect(testResponse.status).toBe(200);

  expect(testResponse.body.recipeID).toBe(1);
  expect(testResponse.body.userID).toBe(recipeToCreate.userID);
  expect(testResponse.body.title).toBe(recipeToCreate.title);
});

//doesnt work with jest since jest throws its own errors idek so weird - needa ask talib
test("POST /recipes user error case", async () => {
  const recipeToCreate = generateRecipeData();

  let testResponse = await testRequest.post("/recipes").send({
    title: recipeToCreate.title,
    instructions: recipeToCreate.instructions,
    timeToPrepare: recipeToCreate.timeToPrepare,
    ingredients: recipeToCreate.instructions,
    userID: recipeToCreate.userID,
    approximateCost: "",
    mealType: 8,
  });

  expect(testResponse.status).toBe(400);
});

test("POST /recipes system error case", async () => {
  const recipeToCreate = generateRecipeData();

  await model.close();

  let testResponse = await testRequest.post("/recipes").send({
    title: recipeToCreate.title,
    instructions: recipeToCreate.instructions,
    timeToPrepare: recipeToCreate.timeToPrepare,
    ingredients: recipeToCreate.ingredients,
    userID: recipeToCreate.userID,
    approximateCost: recipeToCreate.approximateCost,
    mealType: recipeToCreate.mealType,
  });

  expect(testResponse.status).toBe(500);
});

test("GET /recipes success case", async () => {
  const recipeToRead = generateRecipeData();

  let createdRecipe = await model.addRecipe(
    recipeToRead.title,
    recipeToRead.instructions,
    recipeToRead.timeToPrepare,
    recipeToRead.ingredients,
    recipeToRead.userID,
    recipeToRead.approximateCost,
    recipeToRead.mealType
  );

  let testResponse = await testRequest.get(`/recipes?recipeID=1`).send({
    
  });

  expect(testResponse.status).toBe(200);

  expect(testResponse.body.recipeID).toBe(createdRecipe.recipeID);
  expect(testResponse.body.userID).toBe(createdRecipe.userID);
  expect(testResponse.body.title).toBe(createdRecipe.title);
});

test("GET /recipes user error case (recipe doesn't exist)", async () => {
  const recipeToRead = generateRecipeData();

  await model.addRecipe(
    recipeToRead.title,
    recipeToRead.instructions,
    recipeToRead.timeToPrepare,
    recipeToRead.ingredients,
    recipeToRead.userID,
    recipeToRead.approximateCost,
    recipeToRead.mealType
  );

  let testResponse = await testRequest.get("/recipes?recipeID=20").send();

  expect(testResponse.status).toBe(400);
});

test("GET /recipes system error case", async () => {
  const recipeToRead = generateRecipeData();

  await model.addRecipe(
    recipeToRead.title,
    recipeToRead.instructions,
    recipeToRead.timeToPrepare,
    recipeToRead.ingredients,
    recipeToRead.userID,
    recipeToRead.approximateCost,
    recipeToRead.mealType
  );

  await model.close();

  let testResponse = await testRequest.get("/recipes?recipeID=1").send({
  });

  expect(testResponse.status).toBe(500);
});

test("GET /recipes/all success case", async () => {
  const recipeToRead = generateRecipeData();

  await model.addRecipe(
    recipeToRead.title,
    recipeToRead.instructions,
    recipeToRead.timeToPrepare,
    recipeToRead.ingredients,
    recipeToRead.userID,
    recipeToRead.approximateCost,
    recipeToRead.mealType
  );

  let testResponse = await testRequest.get("/recipes/all").send();

  expect(testResponse.status).toBe(200);
});

test("GET /recipes/all user error case (empty database)", async () => {
  let testResponse = await testRequest.get("/recipes/all").send();

  expect(testResponse.body.length).toBe(0);
});

test("GET /recipes/all system error case", async () => {
  const recipeToRead = generateRecipeData();

  await model.addRecipe(
    recipeToRead.title,
    recipeToRead.instructions,
    recipeToRead.timeToPrepare,
    recipeToRead.ingredients,
    recipeToRead.userID,
    recipeToRead.approximateCost,
    recipeToRead.mealType
  );

  await model.close();

  let testResponse = await testRequest.get("/recipes/all").send();

  expect(testResponse.status).toBe(500);
});

test("PUT /recipes success case", async () => {
  const recipeToBeUpdated = generateRecipeData();
  const recipeToUpdateWith = generateRecipeData();

  await model.addRecipe(
    recipeToBeUpdated.title,
    recipeToBeUpdated.instructions,
    recipeToBeUpdated.timeToPrepare,
    recipeToBeUpdated.ingredients,
    recipeToBeUpdated.userID,
    recipeToBeUpdated.approximateCost,
    recipeToBeUpdated.mealType
  );

  let testResponse = await testRequest.put("/recipes").send({
    recipeID: 1,
    newTitle: recipeToUpdateWith.title,
    newInstructions: recipeToUpdateWith.instructions,
    newTimeToPrepare: recipeToUpdateWith.timeToPrepare,
    newIngredients: recipeToUpdateWith.ingredients,
    newUserID: recipeToUpdateWith.userID,
    newApproximateCost: recipeToUpdateWith.approximateCost,
    newMealType: recipeToUpdateWith.mealType,
  });

  expect(testResponse.status).toBe(200);

  expect(testResponse.body.title).toBe(recipeToUpdateWith.title);
  expect(testResponse.body.userID).toBe(recipeToUpdateWith.userID);
});

test("PUT /recipes user error case (invalid parameters)", async () => {
  const recipeToBeUpdated = generateRecipeData();
  const recipeToUpdateWith = generateRecipeData();

  await model.addRecipe(
    recipeToBeUpdated.title,
    recipeToBeUpdated.instructions,
    recipeToBeUpdated.timeToPrepare,
    recipeToBeUpdated.ingredients,
    recipeToBeUpdated.userID,
    recipeToBeUpdated.approximateCost,
    recipeToBeUpdated.mealType
  );

  let testResponse = await testRequest.put("/recipes").send({
    recipeID: 1,
    newTitle: recipeToUpdateWith.title,
    newInstructions: recipeToUpdateWith.instructions,
    newTimeToPrepare: "string when should be number",
    newIngredients: recipeToUpdateWith.ingredients,
    newUserID: recipeToUpdateWith.userID,
    newApproximateCost: recipeToUpdateWith.approximateCost,
    newMealType: recipeToUpdateWith.mealType,
  });

  expect(testResponse.status).toBe(400);
});

test("PUT /recipes user error case (recipe doesn't exist)", async () => {
  const recipeToBeUpdated = generateRecipeData();
  const recipeToUpdateWith = generateRecipeData();

  let testResponse = await testRequest.put("/recipes").send({
recipeID: 3,
    newTitle: recipeToUpdateWith.title,
    newInstructions: recipeToUpdateWith.instructions,
    newTimeToPrepare: recipeToUpdateWith.timeToPrepare,
    newIngredients: recipeToUpdateWith.ingredients,
    newUserID: recipeToUpdateWith.userID,
    newApproximateCost: recipeToUpdateWith.approximateCost,
    newMealType: recipeToUpdateWith.mealType,
  });

  expect(testResponse.status).toBe(400);
});

test("PUT /recipes system error case", async () => {
  const recipeToBeUpdated = generateRecipeData();
  const recipeToUpdateWith = generateRecipeData();

  await model.addRecipe(
    recipeToBeUpdated.title,
    recipeToBeUpdated.instructions,
    recipeToBeUpdated.timeToPrepare,
    recipeToBeUpdated.ingredients,
    recipeToBeUpdated.userID,
    recipeToBeUpdated.approximateCost,
    recipeToBeUpdated.mealType
  );

  await model.close();

  let testResponse = await testRequest.put("/recipes").send({
recipeID: 1,
    newTitle: recipeToUpdateWith.title,
    newInstructions: recipeToUpdateWith.instructions,
    newTimeToPrepare: recipeToUpdateWith.timeToPrepare,
    newIngredients: recipeToUpdateWith.ingredients,
    newUserID: recipeToUpdateWith.userID,
    newApproximateCost: recipeToUpdateWith.approximateCost,
    newMealType: recipeToUpdateWith.mealType,
  });

  expect(testResponse.status).toBe(500);
});

test("DELETE /recipes success case", async () => {
  const recipeToBeDeleted = generateRecipeData();

  let recipe = await model.addRecipe(
    recipeToBeDeleted.title,
    recipeToBeDeleted.instructions,
    recipeToBeDeleted.timeToPrepare,
    recipeToBeDeleted.ingredients,
    recipeToBeDeleted.userID,
    recipeToBeDeleted.approximateCost,
    recipeToBeDeleted.mealType
  );

  let testResponse = await testRequest.delete("/recipes").send({
recipeID: recipe.recipeID
  });

  expect(testResponse.status).toBe(200);
  //use find directly instead
  await expect(() =>
    model.deleteRecipe(1)
  ).rejects.toThrow(InvalidInputError);
});

test("DELETE /recipes user error case (recipe doesn't exist)", async () => {
  let testResponse = await testRequest.delete("/recipes").send({
recipeID: 1
  });

  expect(testResponse.status).toBe(400);
});

test("DELETE /recipes system error case", async () => {
  const recipeToBeDeleted = generateRecipeData();

  let recipe = await model.addRecipe(
    recipeToBeDeleted.title,
    recipeToBeDeleted.instructions,
    recipeToBeDeleted.timeToPrepare,
    recipeToBeDeleted.ingredients,
    recipeToBeDeleted.userID,
    recipeToBeDeleted.approximateCost,
    recipeToBeDeleted.mealType
  );

  await model.close();

  let testResponse = await testRequest.delete("/recipes").send({
    recipeID: recipe.recipeID
  });

  expect(testResponse.status).toBe(500);
});
