require("dotenv").config();
const mongoose = require("mongoose");

const User = require("./models/user") 


const updateUsers = async()=>{
    try {

        await mongoose.connect(process.env.MONGODB_URI); 
        console.log("Database is Connected");

        const users = await User.find({});

        for(let user of users){
            try{
                if(!user.name){
                    console.log(`user: ${user._id} does not have a name`)
                    continue;
                }
                const [firstname,...rest] = user.name.split(" ");
                const lastname = rest.join(" ")|| "";
                // console.log(`user.name: -${user.name}-`);
                // console.log(`firstname: -${firstname}-`);
                // console.log(`lastname: -${lastname}-`);
                // console.log(`---------------------`);

                await User.findByIdAndUpdate(user._id, {firstname,lastname,$unset: { name: "" }});
            }catch(error){
                console.log(`Error updating user: ${user._id}`);
                console.log(error);
            }
            



        }
        
        await mongoose.disconnect(); // disconnect after work


        
    } catch (error) {
        console.log("------ ERROR ------");
        console.log(error);
        await mongoose.disconnect();

    }
}

updateUsers();

