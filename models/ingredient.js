const mongoose = require("mongoose");
const Schema = mongoose.Schema;


const ingredientSchema = new Schema({
  name: String,
  image: String,
  cost: Number,
  author:{
    type: mongoose.Types.ObjectId,
    ref: "User",
  }
});
module.exports = mongoose.model("Ingredient", ingredientSchema);
