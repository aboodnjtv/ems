require("dotenv").config();
const Expense = require("../models/expense");
const mongoose = require("mongoose");
const connectToDB = async()=>{
    try {

        await mongoose.connect(process.env.MOGODB_URI); 
        console.log("Database is Connected");
        
    } catch (error) {
        console.log("ERROR -- DB NOT Connected");
        console.log(error);
    }
}


// connectToDB();


// a function to make an update to database
const update = async()=>{

    const expenses = await Expense.find();// all expenses 
    for(expense of expenses){
        const month = expense.date.getMonth()+1;
        const year = expense.date.getFullYear();
        await Expense.updateOne({_id:expense._id},
            {
                month,
                year,
                saved:false
            }
        )
    }
}



// update().then(()=>{
//     mongoose.connection.close();
// });



