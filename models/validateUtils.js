const val = require("validator");
const { InvalidInputError } = require("./customErrors");

function isValidInt(intValue) {
  try {
    if (!isNaN(intValue)) {
      if (intValue >= 0) {
        return true;
      }
      throw new InvalidInputError("value cannot be negative.");
    }
    throw new InvalidInputError("value must be a number.");
  } catch (e) {
    if (e instanceof InvalidInputError) {
      throw new InvalidInputError(e.message);
    } else {
      throw new Error(e.message);
    }
  }
}

function isString(stringValue) {
  try {
    if (typeof stringValue === "string") {
      if (stringValue == "") {
        throw new InvalidInputError("value cannot be empty.");
      }
      return true;
    }
    throw new InvalidInputError("value must be a string.");
  } catch (e) {
    if (e instanceof InvalidInputError) {
      throw new InvalidInputError(e.message);
    } else {
      throw new Error(e.message);
    }
  }
}

function validTitle(title) {
  try {
    if (isString(title)) {
      return true;
    }
  } catch (e) {
    if (e instanceof InvalidInputError) {
      throw new InvalidInputError("Title is invalid: " + e.message);
    }
    throw new Error(e.message);
  }
}

function validInstructions(instructions) {
  try {
    if (isString(instructions)) {
      return true;
    }
  } catch (e) {
    if (e instanceof InvalidInputError) {
      throw new InvalidInputError("Instruction are invalid: " + e.message);
    }
    throw new Error(e.message);
  }
}

function validIngredients(ingredients) {
  try {
    if (Array.isArray(ingredients)) {
      if (ingredients.length != 0) {
        //found at: https://stackoverflow.com/questions/26871106/check-if-all-elements-in-array-are-strings
        const isStringsArray = (ingredients) =>
          ingredients.every((i) => typeof i === "string");
        if (isStringsArray) {
          return true;
        }
        throw new InvalidInputError("Ingredients must be string array.");
      }
      throw new InvalidInputError("A recipe cannot have 0 ingredients.");
    }
    throw new InvalidInputError("Ingredients must be an array.");
  } catch (e) {
    if (e instanceof InvalidInputError) {
      throw new InvalidInputError(e.message);
    }
    throw new Error(e.message);
  }
}

function validMealType(mealType) {
  const validMealTypes = [
    "breakfast",
    "brunch",
    "lunch",
    "dinner",
    "snack",
    "dessert",
  ];
  let mealTypeMessage = "";

  try {
    if (typeof mealType === "string") {
      if (val.isAlpha(mealType)) {
        for (let i = 0; i < validMealTypes.length; i++) {
          if (mealType.toLowerCase() == validMealTypes[i]) {
            return true;
          }
          mealTypeMessage += `${validMealTypes[i]}, `;
        }
        throw new InvalidInputError(
          `Invalid meal type. Accepted types: ${mealTypeMessage}.`
        );
      }
      throw new InvalidInputError("Meal type must be a valid string.");
    }
    throw new InvalidInputError("Meal type must be a string.");
  } catch (e) {
    if (e instanceof InvalidInputError) {
      throw new InvalidInputError(e.message);
    }
    throw new Error(e.message);
  }
}

function validCost(cost) {
  try {
    if (isValidInt(cost)) {
      return true;
    }
  } catch (e) {
    if (e instanceof InvalidInputError) {
      throw new InvalidInputError("Invalid cost: " + e.message);
    }
    throw new Error(e.message);
  }
}

function validTimeToPrepare(time) {
  try {
    if (isValidInt(time)) {
      return true;
    }
  } catch (e) {
    if (e instanceof InvalidInputError) {
      throw new InvalidInputError("Invalid time: " + e.message);
    }
    throw new Error(e.message);
  }
}

module.exports = {
  validTitle,
  validIngredients,
  validMealType,
  validInstructions,
  validCost,
  validTimeToPrepare,
};
