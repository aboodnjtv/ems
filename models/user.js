const mongoose = require("mongoose");
const Schema = mongoose.Schema;
// const Ingredient = require("./ingredient");
const passportLocalMongoose = require("passport-local-mongoose");


const userSchema = new Schema({
  name :{
    type:String,
    required:true,
  },
  email :{
    type:String,
    required:true,
    unique: true,
  },
  password:String,
  verified : {type:Boolean,default:false},
  // date_joined : {type:Number},
  date_joined : {type:Date},
  last_login : {type:Date}



//   ingredients: [
//     {
//       id: {
//         type: mongoose.Types.ObjectId,
//         ref: "Ingredient",
//       }, // id of the ingredient
//       quantity: { type: Number },
//     },
//   ],
//   weight: { type: Number, default: 0 },
});

const User = mongoose.model("User",userSchema);
module.exports = User;
