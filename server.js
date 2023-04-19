const recipeModel = require("./models/recipeModelMongoDB");
require("dotenv").config();
const http = require("http");
const port = 1339;
const url =
process.env.URL_PRE + process.env.MONGODB_PWD + process.env.URL_POST;

const app = require("./app.js");

//let initialized = recipeModel.initialize("recipes", false, url);

recipeModel.initialize("recipes", false, url)
.then(
  app.listen(port) //run the server
);