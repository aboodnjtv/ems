const mongoose = require("mongoose");
const Schema = mongoose.Schema;


const expenseSchema = new Schema({
  name: String,
  type: String,
  cost: Number,
  date : Date,
  author:{
    type: mongoose.Types.ObjectId,
    ref: "User",
  }
});
module.exports = mongoose.model("Expense", expenseSchema);
