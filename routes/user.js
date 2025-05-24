const express = require("express");
const router = express.Router();
// const Item = require("../models/item");
// const Ingredient = require("../models/ingredient");
// const algorithms = require("../public/javascripts/algorithms");
const ExpressError = require("../utils/ExpressError");
const { catchAsync } = require("../utils/catchAsync");
const { isLoggedIn,isLoggedOut,isVerified,isNotVerified } = require("../utils/middleware");
const bcrypt = require("bcrypt");
const User = require("../models/user");
const Expense = require("../models/expense");
const {sendOpt,verifyOtp} = require("../utils/otp-service");



//login route
router.get("/login",isLoggedOut,(req,res)=>{
    res.render("user/login");
})

// add isLoggedout
router.post("/login",isLoggedOut,catchAsync(async(req,res)=>{
    const {email,password} = req.body;
    const foundUser = await User.findOne({email});
    const errorMessage = "Email or password is incorrect.";
    if(!foundUser) return res.render("user/auth-error",{errorMessage});
    const correctPassword = await bcrypt.compare(password,foundUser.password);
    if(!correctPassword) return res.render("user/auth-error",{errorMessage});
    // update last login for the user
    await User.findOneAndUpdate({email},{last_login: Date.now()});
    // console.log(`Date.now(): ${Date.now()}`)
    req.session.user = foundUser;
    res.redirect("/expenses");

}));

//logout route
router.get("/logout",isLoggedIn,(req,res)=>{
    req.session.destroy();
    res.redirect("/login");
});

//sign up 
router.get("/signup",isLoggedOut,(req,res)=>{
    res.render("user/signup");
});
router.post("/signup", isLoggedOut,catchAsync(async(req,res)=>{
    const {firstname,lastname,email,password} = req.body;
    if(await User.findOne({email})){
        const errorMessage = "An account with this email already exists.";
        return res.render("user/auth-error",{errorMessage});
    }
    const hashedPassword =  await bcrypt.hash(password,12);
    const newUser = new User({firstname,lastname, email, password:hashedPassword,date_joined: new Date(),last_login: new Date()}); 
    await newUser.save();
    // send the OTP that will be user to verify the email
    await sendOpt(email);
    res.redirect("/login");

}));


// add isNotVerified
router.get("/verify",isLoggedIn,isNotVerified,(req,res)=>{
    res.render("user/verify",{user:req.session.user});
});

router.post("/verify",isLoggedIn,isNotVerified,catchAsync(async(req,res)=>{
    const{otp} = req.body;
    const email = req.session.user.email;
    if(!otp) return res.send("No Code Found")
    const isValidOtp = await verifyOtp(email,otp)
    if(!isValidOtp) return res.redirect("/verify");
    await User.findOneAndUpdate({email},{verified:true});
    req.session.user.verified = true;
    return res.render("user/verified");

}));

// we use get method for anchor tags
router.get("/verify/send-otp",isLoggedIn,isNotVerified,catchAsync(async(req,res)=>{
    if(!req.session.user.email) return res.send("NO USER");
    const subject = "Verification Code to Verify Your Account";
    await sendOpt(req.session.user.email,subject);
    res.redirect("/verify");
}));
// send otp code to user's email
router.post("/verify/send-otp",isLoggedIn,catchAsync(async(req,res)=>{
    if(!req.session.user.email) return res.send("NO USER");
    const subject = "Verification Code to Verify Your Account";
    await sendOpt(req.session.user.email,subject);
    res.redirect("/verify");
}));


//profile page
router.get("/profile",isLoggedIn,isVerified,catchAsync(async(req,res)=>{
    const user = await User.findById(req.session.user._id);
    const all_user_expenses = await Expense.find({author:req.session.user});
    let total_spending = 0;
    for(let expense of all_user_expenses){
        total_spending+=expense.cost; 
    }
    total_spending = total_spending.toFixed(2);
    res.render("user/profile",{user,total_spending});
}));



module.exports = router;
