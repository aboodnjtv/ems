const mongoose = require("mongoose");
const Schema = mongoose.Schema;


const expenseTypeSchema = new Schema({
  type: String,
  author:{
    type: mongoose.Types.ObjectId,
    ref: "User",
  }
});
module.exports = mongoose.model("ExpenseType", expenseTypeSchema);
