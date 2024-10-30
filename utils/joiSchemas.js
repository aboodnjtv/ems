const Joi = require("joi");

// joi schema for Item
module.exports.joiItemSchema = Joi.object({
  name: Joi.string().required(),
  image: Joi.string().required(),
  // cost: Joi.number().required().min(0),
  weight: Joi.number().required().min(0),
  description: Joi.string().required(),
  // lastUpdate: Date,
});

// joi schema for Ingredient
module.exports.joiIngredientSchema = Joi.object({
  name: Joi.string().required(),
  image: Joi.string().required(),
  cost: Joi.number().required().min(0),
});

// joi schema for to add Ingredient to an item
module.exports.joiAddIngredientSchema = Joi.object({
  quantity: Joi.number().required().min(0),
  ingredient_id: Joi.string().required(),
});


// joi schema for calculate_quantities form
module.exports.joi_calculate_quantities_schema = Joi.object({
  final_wieght: Joi.number().required().min(0),
});
