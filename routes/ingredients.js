const express = require("express");
const Ingredient = require("../models/ingredient");
const router = express.Router();
const ExpressError = require("../utils/ExpressError");
const { catchAsync } = require("../utils/catchAsync");
const { validateIngredientWithJoi ,isLoggedIn,isVerified,isIngredientAuthor } = require("../utils/middleware");
//------------------- Index page for ingredients
router.get("/ingredients",isLoggedIn,isVerified,catchAsync(async (req, res) => {
    
    //show only the ingredients that belong to the current user
    const allIngredients = await Ingredient.find({author:req.session.user});
    if (!allIngredients) {
      return res.redirect("/");
    }
    res.render("ingredients/index", { allIngredients });
  })
);

//------------------- add an ingredient
// render new form
router.get("/ingredients/new", isLoggedIn,isVerified, (req, res) => {
  res.render("ingredients/new");
});
// add ingredient
router.post("/ingredients",isLoggedIn,isVerified,validateIngredientWithJoi,catchAsync(async (req, res) => {
    let { name, image, cost } = req.body;
    const ingredient = new Ingredient({ name, image, cost,author:req.session.user });
    await ingredient.save();
    res.render("ingredients/show", { ingredient });
  })
);

//------------------- show page for ingredients
router.get("/ingredients/:ingredientId",isLoggedIn,isVerified,isIngredientAuthor,catchAsync(async (req, res) => {
    const { ingredientId } = req.params;
    const ingredient = await Ingredient.findById(ingredientId).populate("author");
    if (!ingredient) {
      throw new ExpressError("Ingredient was not found", 404);
    }
    res.render("ingredients/show", { ingredient });
  })
);

//------------------- edit an ingredient
// render edit form
router.get("/ingredients/:ingredientId/edit", isLoggedIn,isVerified,isIngredientAuthor,catchAsync(async (req, res) => {
    const { ingredientId } = req.params;
    const ingredient = await Ingredient.findById(ingredientId);
    if (!ingredient) {
      throw new ExpressError("Ingredient was not found", 404);
    }

    res.render("ingredients/edit", { ingredient });
  })
);

// edit ingredient
router.post("/ingredients/:ingredientId/edit", isLoggedIn,isVerified,isIngredientAuthor, validateIngredientWithJoi,catchAsync(async (req, res) => {
    const { ingredientId } = req.params;
    let { name, image, cost } = req.body;
    const ingredient = await Ingredient.findById(ingredientId);
    if (!ingredient) {
      throw new ExpressError("Cannot find ingredient");
    }
    await Ingredient.findByIdAndUpdate(ingredientId, {
      name,
      image,
      cost,
    });
    res.redirect("/ingredients/" + ingredientId);
  })
);

//------------------- Delete an ingredient
router.delete("/ingredients/:ingredientId",isLoggedIn,isVerified,isIngredientAuthor,catchAsync(async (req, res) => {
    const { ingredientId } = req.params;
    const ingredient = await Ingredient.findById(ingredientId);
    if (!ingredient) {
      throw new ExpressError("Ingredient was not found", 404);
    }
    await Ingredient.findByIdAndDelete(ingredientId);
    res.redirect("/ingredients");
  })
);

module.exports = router;
