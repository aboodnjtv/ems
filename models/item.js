const mongoose = require("mongoose");
const Schema = mongoose.Schema;
// const Ingredient = require("./ingredient");
// const User = require("./user");

const itemSchema = new Schema({
  name: String,
  image: String,
  cost: { type: Number, default: 0 },
  
  author:{
    type: mongoose.Types.ObjectId,
    ref: "User",
  },
  
  ingredients: [
    {
      id: {
        type: mongoose.Types.ObjectId,
        ref: "Ingredient",
      }, // id of the ingredient
      quantity: { type: Number },
    },
  ],
  weight: { type: Number, default: 0 },
  description: String,
  lastUpdate: Date,
  //add array of ingredients (use ref)
});
module.exports = mongoose.model("Item", itemSchema);
