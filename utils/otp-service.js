// const{AUTH_EMAIL,AUTH_PASS} = process.env;
const{AUTH_EMAIL,AUTH_PASS} =require("dotenv").config().parsed
const  nodemailer = require("nodemailer");
const Otp = require("../models/Otp");
const bcrypt = require("bcrypt");




const transporter = nodemailer.createTransport({
    host: "smtp-mail.outlook.com",
    auth:{
        user:AUTH_EMAIL,
        pass:AUTH_PASS
    }
})

const handleError=(e)=>{
    console.log("----- Error -----");
    console.log(e.message);
    console.log("----- Error -----");
}

module.exports.sendOpt = async(email)=>{
    try{
        // maybe we need to check if the email is in the database 
        // before we send the otp to the user
        // clear any old record
        console.log("----------- 1 ------------");
        console.log(`AUTH_EMAIL: ${AUTH_EMAIL}`);
        await Otp.deleteOne({email});
        const otp = ""+Math.floor(1000+Math.random()*9000)+"";
        const mailOptions = {
            from: AUTH_EMAIL,
            to: email,
            subject:"Verification Code to Verify Your Account",
            html:""+otp+""
        }
        console.log("----------- 2 ------------");

        //send to user's email
        await transporter.sendMail(mailOptions);
        //save otp record
        const hashedOtp = await bcrypt.hash(otp,12);
        const newOtp = new Otp({
            email,
            otp:hashedOtp,
        });
        console.log("----------- 3 ------------");

        await newOtp.save();
        console.log("----------- 4 ------------");

    }catch(e){
        handleError(e);
    }
};

module.exports.verifyOtp = async(email,otp)=>{
    try{
        const foundOtp = await Otp.findOne({email});
        if(!foundOtp) return false;
        const matched = await bcrypt.compare(otp,foundOtp.otp)
        if(!matched) return false;
        //delete the Otp
        await Otp.deleteOne({email});
        //send email to user that email is verified
        const mailOptions = {
            from: AUTH_EMAIL,
            to: email,
            subject:"Account Verified",
            html:"Your Account is now verified and ready to be used!"
        }
        await transporter.sendMail(mailOptions);
        return true;
    }catch(e){
        handleError(e);
    }
}

module.exports.verifyOtp_password_reset = async(email,otp)=>{
    try{
        const foundOtp = await Otp.findOne({email});
        if(!foundOtp) return false;
        const matched = await bcrypt.compare(otp,foundOtp.otp)
        if(!matched) return false;
        //delete the Otp
        await Otp.deleteOne({email});
        //send email to user that email is verified
        const mailOptions = {
            from: AUTH_EMAIL,
            to: email,
            subject:"Password Reset",
            html:"Your password has been successfully reset"
        }
        await transporter.sendMail(mailOptions);
        return true;
    }catch(e){
        handleError(e);
    }
}
