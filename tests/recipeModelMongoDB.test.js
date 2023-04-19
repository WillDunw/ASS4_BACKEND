const {
  InvalidInputError,
  DatabaseError
} = require("../models/customErrors");
const model = require("../models/recipeModelMongoDB");
const db = "recipes_test";
require("dotenv").config();
const { MongoMemoryServer } = require("mongodb-memory-server");
let mongod;

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
];

const generateRecipeData = () =>
  recipeData.splice(Math.floor(Math.random() * recipeData.length), 1)[0];

beforeAll(async () => {
  // Create new instance of "MongoMemoryServer" and auto start it
  mongod = await MongoMemoryServer.create();
  console.log("Mock Database started");
});

afterAll(async () => {
  await mongod.stop(); //stop memory server
  console.log("Mock Database stopped");
});

beforeEach(async () => {
  try {
    const url = mongod.getUri();
    await model.initialize(db, true, url);
    jest.setTimeout(() => {}, 5000);
    let collection = await model.getCollection();
    await collection.insertOne({recipeIDRecord: 0});
  } catch (err) {
    console.log(err.message);
  }
});

afterEach(async () => {
  await model.close();
});

test("Adding a valid recipe to the database", async () => {
  const {
    title,
    instructions,
    timeToPrepare,
    ingredients,
    userID,
    approximateCost,
    mealType,
  } = generateRecipeData();

  await model.addRecipe(
    title,
    instructions,
    timeToPrepare,
    ingredients,
    userID,
    approximateCost,
    mealType
  );

  let cursor = await model.getCollection();
  cursor = await cursor.find();
  const results = await cursor.toArray();

  expect(Array.isArray(results)).toBe(true);
  //contain the recipe id tracking record
  expect(results.length).toBe(2);

  expect(results[1].title).toBe(title);
  expect(results[1].instructions).toBe(instructions);
  expect(results[1].timeToPrepare).toBe(timeToPrepare);
  //maybe should check for each string in this array
  expect(results[1].ingredients.length).toBe(ingredients.length);
  expect(results[1].userID).toBe(userID);
  expect(results[1].approximateCost).toBe(approximateCost);
  expect(results[1].mealType).toBe(mealType);
});

test("Adding an invalid recipe to the database", async () => {
  await expect( async () => await model.addRecipe(
    34234,
    true,
    "this is not a time",
    ["valid"],
    12345,
    300000,
    "brunch"
  )).rejects.toThrow(InvalidInputError);

});

test("updating valid recipe", async () => {
  const {
    title: title1,
    instructions: instructions1,
    timeToPrepare: timeToPrepare1,
    ingredients: ingredients1,
    userID: userID1,
    approximateCost: approximateCost1,
    mealType: mealType1,
  } = generateRecipeData();
  const {
    title: title2,
    instructions: instructions2,
    timeToPrepare: timeToPrepare2,
    ingredients: ingredients2,
    userID: userID2,
    approximateCost: approximateCost2,
    mealType: mealType2,
  } = generateRecipeData();

  let collection = await model.getCollection();

  await collection.insertOne({
    recipeID: 1,
    title: title1,
    instructions: instructions1,
    timeToPrepare: timeToPrepare1,
    ingredients: ingredients1,
    userID: userID1,
    approximateCost: approximateCost1,
    mealType: mealType1,
  });

  let updatedRecipe = await model.updateRecipe(
      1,
      title2,
      instructions2,
      timeToPrepare2,
      ingredients2,
      userID2,
      approximateCost2,
      mealType2
    );


    expect(updatedRecipe.title).toBe(title2);
  expect(updatedRecipe.instructions).toBe(instructions2);
  expect(updatedRecipe.timeToPrepare).toBe(timeToPrepare2);
  //maybe should check for each string in this array
  expect(updatedRecipe.ingredients.length).toBe(ingredients2.length);
  expect(updatedRecipe.userID).toBe(userID2);
  expect(updatedRecipe.approximateCost).toBe(approximateCost2);
  expect(updatedRecipe.mealType).toBe(mealType2);
});

test("updating an invalid recipe", async () => {
  const {
    title: title1,
    instructions: instructions1,
    timeToPrepare: timeToPrepare1,
    ingredients: ingredients1,
    userID: userID1,
    approximateCost: approximateCost1,
    mealType: mealType1,
  } = generateRecipeData();
  const {
    title: title2,
    instructions: instructions2,
    timeToPrepare: timeToPrepare2,
    ingredients: ingredients2,
    userID: userID2,
    approximateCost: approximateCost2,
    mealType: mealType2,
  } = generateRecipeData();

  let collection = await model.getCollection();

  await collection.insertOne({
    recipeID: 1,
    title: title1,
    instructions: instructions1,
    timeToPrepare: timeToPrepare1,
    ingredients: ingredients1,
    userID: userID1,
    approximateCost: approximateCost1,
    mealType: mealType1,
  });

   await expect( async () => model.updateRecipe(
    1,
    title2,
    instructions2,
    "time cannot be string",
    ingredients2,
    userID2,
    approximateCost2,
    mealType2
  )).rejects.toThrow(InvalidInputError);

});

test("updating a recipe that doesn't exist", async () => {
  const {
    title: title2,
    instructions: instructions2,
    timeToPrepare: timeToPrepare2,
    ingredients: ingredients2,
    userID: userID2,
    approximateCost: approximateCost2,
    mealType: mealType2,
  } = generateRecipeData();

   await expect( async () => model.updateRecipe(
    2,
    title2,
    instructions2,
    timeToPrepare2,
    ingredients2,
    userID2,
    approximateCost2,
    mealType2
  )).rejects.toThrow(InvalidInputError);
});

test("Deleting a valid recipe", async () => {
  const {
    title,
    instructions,
    timeToPrepare,
    ingredients,
    userID,
    approximateCost,
    mealType,
  } = generateRecipeData();

  let collection = await model.getCollection();

  await collection.insertOne({
    recipeID: 1,
    title: title,
    instructions: instructions,
    timeToPrepare: timeToPrepare,
    ingredients: ingredients,
    userID: userID,
    approximateCost: approximateCost,
    mealType: mealType,
  });

  try {
    let goodDelete = await model.deleteRecipe(1);

    let cursor = await collection.find();
    const results = await cursor.toArray();

    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBe(1);
    expect(goodDelete.title).toBe(title);
  } catch (err) {
    console.log(err.message);
    expect(0).toBe(1);
  }
});

test("Deleting an invalid recipe", async () => {
  const {
    title,
    instructions,
    timeToPrepare,
    ingredients,
    userID,
    approximateCost,
    mealType,
  } = generateRecipeData();

  let collection = await model.getCollection();

  await collection.insertOne({
    recipeID: 1,
    title: title,
    instructions: instructions,
    timeToPrepare: timeToPrepare,
    ingredients: ingredients,
    userID: userID,
    approximateCost: approximateCost,
    mealType: mealType,
  });

  await expect(async () => model.deleteRecipe(3)).rejects.toThrow(InvalidInputError);
});

test("Deleting an recipe from an empty database", async () => {
  await expect(async () => model.deleteRecipe(4)).rejects.toThrow(InvalidInputError);
});

test("reading a recipe from the database", async () => {
  const {
    title,
    instructions,
    timeToPrepare,
    ingredients,
    userID,
    approximateCost,
    mealType,
  } = generateRecipeData();

  let collection = await model.getCollection();

  await collection.insertOne({
    recipeID: 1,
    title: title,
    instructions: instructions,
    timeToPrepare: timeToPrepare,
    ingredients: ingredients,
    userID: userID,
    approximateCost: approximateCost,
    mealType: mealType,
  });

  let recipe = await model.getSingleRecipe(1);

  expect(recipe.title).toBe(title);
  expect(recipe.instructions).toBe(instructions);
  expect(recipe.timeToPrepare).toBe(timeToPrepare);
  expect(recipe.ingredients.length).toBe(ingredients.length);
  expect(recipe.userID).toBe(userID);
  expect(recipe.approximateCost).toBe(approximateCost);
  expect(recipe.mealType).toBe(mealType);
});

test("reading a recipe from an empty database", async () => {
  await expect(async () => model.getSingleRecipe(1)).rejects.toThrow(InvalidInputError);
});

test("reading a recipe that doesn't exist", async () => {
  const {
    title,
    instructions,
    timeToPrepare,
    ingredients,
    userID,
    approximateCost,
    mealType,
  } = generateRecipeData();

  let collection = await model.getCollection();

  await collection.insertOne({
    recipeID: 1,
    title: title,
    instructions: instructions,
    timeToPrepare: timeToPrepare,
    ingredients: ingredients,
    userID: userID,
    approximateCost: approximateCost,
    mealType: mealType,
  });

await expect(async () => model.getSingleRecipe(3)).rejects.toThrow();
});

test("reading all recipes from the database", async () => {
  const {
    title: title1,
    instructions: instructions1,
    timeToPrepare: timeToPrepare1,
    ingredients: ingredients1,
    userID: userID1,
    approximateCost: approximateCost1,
    mealType: mealType1,
  } = generateRecipeData();
  const {
    title: title2,
    instructions: instructions2,
    timeToPrepare: timeToPrepare2,
    ingredients: ingredients2,
    userID: userID2,
    approximateCost: approximateCost2,
    mealType: mealType2,
  } = generateRecipeData();

  let collection = await model.getCollection();

  await collection.insertOne({
    recipeID: 1,
    title: title1,
    instructions: instructions1,
    timeToPrepare: timeToPrepare1,
    ingredients: ingredients1,
    userID: userID1,
    approximateCost: approximateCost1,
    mealType: mealType1,
  });

  await collection.insertOne({
    recipeID: 2,
    title: title2,
    instructions: instructions2,
    timeToPrepare: timeToPrepare2,
    ingredients: ingredients2,
    userID: userID2,
    approximateCost: approximateCost2,
    mealType: mealType2,
  });

  let recipesArray = await model.getAllRecipes();

  expect(recipesArray.length).toBe(2);
  
  expect(recipesArray[0].title).toBe(title1);
  expect(recipesArray[0].instructions).toBe(instructions1);
  expect(recipesArray[0].timeToPrepare).toBe(timeToPrepare1);
  //maybe should check for each string in this array
  expect(recipesArray[0].ingredients.length).toBe(ingredients1.length);
  expect(recipesArray[0].userID).toBe(userID1);
  expect(recipesArray[0].approximateCost).toBe(approximateCost1);
  expect(recipesArray[0].mealType).toBe(mealType1);

  expect(recipesArray[1].title).toBe(title2);
  expect(recipesArray[1].instructions).toBe(instructions2);
  expect(recipesArray[1].timeToPrepare).toBe(timeToPrepare2);
  //maybe should check for each string in this array
  expect(recipesArray[1].ingredients.length).toBe(ingredients2.length);
  expect(recipesArray[1].userID).toBe(userID2);
  expect(recipesArray[1].approximateCost).toBe(approximateCost2);
  expect(recipesArray[1].mealType).toBe(mealType2);
});

test("reading all recipes form an empty database", async () => {
  let recipes = await model.getAllRecipes();
  expect(recipes.length).toBe(0);
});