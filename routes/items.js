const express = require("express");
const router = express.Router();
const Item = require("../models/item");
const Ingredient = require("../models/ingredient");
const algorithms = require("../public/javascripts/algorithms");
const ExpressError = require("../utils/ExpressError");
const { catchAsync } = require("../utils/catchAsync");
const {
  validateItemWithJoi,
  validateAddIngredientWithJoi,
  validate_calculate_quantities_with_joi,
  isLoggedIn,
  isVerified,
  isItemAuthor
} = require("../utils/middleware");


router.get("/items", isLoggedIn, isVerified, catchAsync(async (req, res) => {
    const allItems = await Item.find({author:req.session.user}).populate("ingredients.id");
    // If there are no items returned, redirect to home
    if (!allItems) {
      return res.redirect("/");
    }
    res.render("items/index", { allItems, algorithms });
  })
);

//------------------------- add new item
router.get("/items/new",isLoggedIn,isVerified, (req, res) => {
  res.render("items/new");
});
router.post("/items", isLoggedIn,isVerified, validateItemWithJoi,catchAsync(async (req, res) => {
    let { name, image, weight, description } = req.body;
    const newItem = new Item({ name, image, weight, description, author:req.session.user });
    newItem.lastUpdate = new Date();
    await newItem.save();
    res.redirect("/items/" + newItem._id);
  })
);
//------------------------- show page for each item
router.get("/items/:id",isLoggedIn,isVerified,isItemAuthor,catchAsync(async (req, res) => {
    const { id } = req.params;
    // const item = await Item.findById(id).populate(["ingredients.id","author"]);
    const item = await Item.findById(id).populate(["ingredients.id","author"]);

    if (!item) {
      throw new ExpressError("Item was not found", 404);
    }
    const allIngredients = await Ingredient.find({author:req.session.user});
    if (!allIngredients) {
      throw new ExpressError("Add ingredients first", 404);
    }
    res.render("items/show", { item, allIngredients, algorithms });
  })
);

// form to add new ingredient to an item
router.post("/items/:id/add-ingredient",isLoggedIn,isVerified,isItemAuthor,validateAddIngredientWithJoi,catchAsync(async (req, res) => {
    const { id } = req.params;
    const item = await Item.findById(id);
    if (!item) {
      throw new ExpressError("Item was not Found", 404);
    }
    const { ingredient_id, quantity } = req.body;
    const ingredient = await Ingredient.findById(ingredient_id);
    if (!ingredient) {
      throw new ExpressError("Ingredient was not Found", 404);
    }
    item.ingredients.push({ id: ingredient._id, quantity });
    await item.save();
    res.redirect("/items/" + item._id);
  })
);
// form to delete an ingredient
router.delete("/items/:id/:ingredientid",isLoggedIn,isVerified,isItemAuthor,catchAsync(async (req, res) => {
    const { id, ingredientid } = req.params;
    const item = await Item.findById(id);
    const filtered = item.ingredients.filter(function (value) {
      return value.id._id != ingredientid;
    });
    item.ingredients = filtered;
    await item.save();
    res.redirect("/items/" + id);
  })
);

//form to calculate quantities given the Final Weight
router.post("/items/:id/calculate_quantities", isLoggedIn,isVerified,isItemAuthor,validate_calculate_quantities_with_joi
,catchAsync(async(req, res) => {
    const { id } = req.params;
    const {final_wieght} = req.body;
    const item = await Item.findById(id).populate("ingredients.id"); 
    res.render("items/calculatedQuantities",{ algorithms , item , final_wieght });
}));

//------------------------- edit item
router.get("/items/:id/edit",isLoggedIn,isVerified,isItemAuthor,catchAsync(async (req, res) => {
    const { id } = req.params;
    const item = await Item.findById(id);
    if (!item) {
      throw new ExpressError("Cannot edit, Item was not found", 404);
      // return res.redirect("/items");
    }
    res.render("items/edit", { item });
  })
);

router.post("/items/:id/edit",isLoggedIn,isVerified,isItemAuthor,validateItemWithJoi,catchAsync(async (req, res) => {
    const { id } = req.params;
    let { name, image, weight, description } = req.body;
    const item = await Item.findById(id);
    if (!item) {
      throw new ExpressError("Cannot edit, Item was not found", 404);
    }
    //update
    await Item.findByIdAndUpdate(id, {
      name,
      image,
      weight,
      description,
      lastUpdate: new Date(),
    });

    res.redirect("/items/" + id);
  })
);

//------------------------- delete item
router.delete("/items/:id", isLoggedIn, isVerified,isItemAuthor,catchAsync(async (req, res) => {
    const { id } = req.params;
    const item = await Item.findById(id);
    if (!item) {
      throw new ExpressError("Cannot Delete, Item was not found", 404);
    }
    await Item.findByIdAndDelete(id);
    res.redirect("/items");
  })
);

//------------------------- update all items costs

router.post("/items/update",isLoggedIn,isVerified,catchAsync(async (req, res) => {
    const items = await Item.find({author:req.session.user}).populate("ingredients.id");
    //loop over all items
    for (let item of items) {
      // calcualte the cost of each item using their ingredients
      item.cost = algorithms.calculateItemCost(item.ingredients);
      await item.save();
    }
    res.redirect("/items");
  })
);

module.exports = router;
