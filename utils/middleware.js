const Ingredient  = require("../models/ingredient");
const Item  = require("../models/item");
const ExpressError = require("../utils/ExpressError");
const {
  joiItemSchema,
  joiIngredientSchema,
  joiAddIngredientSchema,
  joi_calculate_quantities_schema
} = require("../utils/joiSchemas");

// for Item
module.exports.validateItemWithJoi = function (req, res, next) {
  const { error } = joiItemSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(msg, 400);
  } else {
    // basic logic to add and alternatice image if it is not coming from unsplash.com
    if (!req.body.image.includes("https://images.unsplash.com")) {
      req.body.image =
        "https://images.unsplash.com/photo-1595475207225-428b62bda831?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1w";
    }
    next();
  }
};

// for Ingredient
module.exports.validateIngredientWithJoi = function (req, res, next) {
  const { error } = joiIngredientSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(msg, 400);
  } else {
    // basic logic to add and alternatice image if it is not coming from unsplash.com
    if (!req.body.image.includes("https://images.unsplash.com")) {
      req.body.image =
        "https://images.unsplash.com/photo-1506368249639-73a05d6f6488?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80";
    }
    next();
  }
};

// To add Ingredient to an item
module.exports.validateAddIngredientWithJoi = function (req, res, next) {
  const { error } = joiAddIngredientSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
};

// To calculate quantities given the Final Weight
module.exports.validate_calculate_quantities_with_joi = function (req, res, next) {
  const { error } = joi_calculate_quantities_schema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
};

// authentication and authorization
//check if user is logged in
module.exports.isLoggedIn = (req, res, next)=> {
  if(!req.session.user){
    // throw new ExpressError("You need to login",404);
    return res.redirect("/login");
  }
  return next();
};

module.exports.isLoggedOut = (req,res,next)=>{
  if(req.session.user){
    // if user is not verified then redirect to /verify
    if(!req.session.user.verified) return res.redirect("/verify");
    return res.redirect("/profile");
  }
  return next();
}

module.exports.isVerified = (req,res,next)=>{
  if(!req.session.user.verified) return res.redirect("/verify");
  return next();
}

module.exports.isNotVerified = (req,res,next)=>{
  if(req.session.user.verified) return res.redirect("/items");
  return next();
}


//check if user is the owner of the ingredient
module.exports.isIngredientAuthor = async (req, res, next) => {
  const {ingredientId } = req.params;
  const ingredient = await Ingredient.findById(ingredientId);
  if (!ingredient || !ingredient.author.equals(req.session.user._id)) {
    res.redirect("/ingredients");
  }
  return next();
};

//check if user is the owner of the item
module.exports.isItemAuthor = async (req, res, next) => {
  const {id } = req.params;
  const item = await Item.findById(id);
  if (!item || !item.author.equals(req.session.user._id)) {
    res.redirect("/item");
  }
  return next();
};
