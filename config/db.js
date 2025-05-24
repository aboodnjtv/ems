require("dotenv").config();
const mongoose = require("mongoose");
const connectToDB = async()=>{
    try {

        await mongoose.connect(process.env.MONGODB_URI); 
        console.log("Database is Connected");
        
    } catch (error) {
        console.log("ERROR -- DB NOT Connected");
        console.log(error);
    }
}

connectToDB();