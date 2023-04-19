POST:
ENDPOINT: localhost:1339/recipes
{
 "title": "Recipe 1",
    "instructions": "Step 1",
    "timeToPrepare": 20,
    "ingredients": ["chicken", "parm"],
    "userID": 23345,
    "approximateCost": 20,
    "mealType" : "brunch"
}
GET 1:
ENDPOINT: localhost:1339/recipes
{
    "title" : "Recipe 1",
    "userID" : 23345
}
DELETE 1:
ENDPOINT: localhost:1339/recipes
{
    "title" : "Recipe 1",
    "userID": 23345
}
PUT:
ENDPOINT: localhost:1339/recipes
{
    "titleToUpdate" : "Recipe 1",
    "userIDToUpdate" : 23345,
    "newTitle": "Recipe 2",
    "newInstructions": "Step 2",
    "newTimeToPrepare": 10,
    "newIngredients": ["beef", "stew"],
    "newUserID": 2334775 ,
    "newApproximateCost": 24,
    "newMealType": "breakfast"
  }
DELETE 2: 
ENDPOINT: 
{
    "title" : "Recipe 2",
    "userID": 2334775
}
GET 2:
ENDPOINT: localhost:1339/recipes
{
    "title" : "Recipe 2",
    "userID" : 2334775
}
GET ALL:
ENDPOINT: localhost:1339/recipes/all
{}

Reccommend creating recipe 1 using post, then put works to transform recipe 1 into recipe 2.
Then you can delete or get recipe 2 using the commands with 2.
You can also get recipe one at first.
You can also create recipe 1, update it to 2 then create 1 again to try the get all.
