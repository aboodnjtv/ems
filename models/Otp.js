const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const OTPSchema = new Schema({
    email:{type:String,unique:true},
    otp:String,
});

const Otp = mongoose.model("Otp",OTPSchema);
module.exports = Otp;