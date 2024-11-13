const express = require("express");
const router = express.Router();

const Expense = require("../models/expense");
const ExpenseType = require("../models/expenseType");
const MonthlyExpense = require("../models/monthlyExpense");

//middlewares
const {isLoggedIn,isVerified} = require("../utils/middleware");
const {catchAsync} = require("../utils/catchAsync");


// expenses main page
router.get("/expenses",isLoggedIn,isVerified,catchAsync(async (req,res)=>{
    
    //change to unsaved expenses
    const expenses = await Expense.find({
        author:req.session.user,
        saved:false,
    })
    const expenseTypes = await ExpenseType.find({author:req.session.user});

    const savedExpenses = await Expense.find({
        author:req.session.user,
        saved:true
    });

    let totalCosts = 0;
    // to calculate the total spending
    for(expense of expenses){
        totalCosts += expense.cost;
    }

    // do logic here then exoport it to another file
    const map = new Map();
    for(expense of expenses){
        if(map.has(expense.type)){
            let curTotal = map.get(expense.type) +expense.cost; 
            map.set(expense.type,curTotal);
        }
        else{
            map.set(expense.type,expense.cost);
        }
    }

    const report = [];
    for(let ele of map){
        report.push({
            type:ele[0],
            total:ele[1].toFixed(2),
            percentage:((100*ele[1])/totalCosts).toFixed(2)
        })
    }



    // limit to 2 decimals
    totalCosts = totalCosts.toFixed(2);
    res.render("./expenses",{expenses,expenseTypes,totalCosts,report,savedExpenses});
}));

// add expense
router.post("/expenses/add",isLoggedIn,isVerified,catchAsync(async(req,res)=>{
    let {name,type,cost,date} = req.body;
    // simple way to make sure name is not empty or named "saved"
    if(!name){
        return res.redirect("/expenses");
    }
    let day;
    if(!date){
        date = new Date();
        day = date.getDate();
    }
    else{
        date = new Date(date);
        day = date.getDate()+1; // because of the we get the date form html file, we need to add 1
        //update the date with the corrected day
        date = new Date(`${date.getFullYear()}, ${date.getMonth()+1}, ${day}`);

    }
    const month = date.getMonth()+1;  
    const year = date.getFullYear();  

    const newExpense = new Expense({
        name,
        type,
        cost,
        date,
        month,
        year,
        saved:false,
        author: req.session.user
    })
    await newExpense.save();
    res.redirect("/expenses");
}));

// delete one expense given the id
router.post("/expenses/deleteExpense/:id",isLoggedIn,isVerified, catchAsync(async(req,res)=>{
    await Expense.findByIdAndDelete(req.params.id);
    res.redirect("/expenses");
}));


// delete all expenses
router.post("/expenses/delete",isLoggedIn,isVerified,catchAsync(async(req,res)=>{
    
    /*
    we delete once saved
    we only delete the ones that are not named saved
    The process,
    1) get all expenses
    2) for each one, add it to the type it belongs it (and date)
    3) delete all of the expenes that don't have the save as name
    */

    const unsaved_expenses = await Expense.find({
        author:req.session.user,
        saved:false}
    );

    for(unsaved_expense of unsaved_expenses){
        // if the type of the expense with the same month and year, then just update
        // otherwise, create a new saved expense
        const savedExpense = await Expense.findOne({
            type : unsaved_expense.type,
            month : unsaved_expense.month,
            year : unsaved_expense.year,
            saved: true,
            author:unsaved_expense.author

        })
        if(savedExpense){
            // the type of the expense was found with the same month and year
            const updatedCost = savedExpense.cost + unsaved_expense.cost; 
            await Expense.updateOne({_id:savedExpense._id},{
                cost:updatedCost
            })
        }
        else{
            const newSavedExpense = new Expense({
                name: "saved",
                type : unsaved_expense.type,
                cost : unsaved_expense.cost,
                date : unsaved_expense.date,
                month : unsaved_expense.month,
                year : unsaved_expense.year,
                saved: true,
                author:unsaved_expense.author
            });
            await newSavedExpense.save();
        }
        //delete the unsaved expense after processing it
        await Expense.deleteOne({_id:unsaved_expense._id});

    }

    // // Move this to another route
    // // now add all the monthly expenses (if any)
    // const monthlyExpenses = await MonthlyExpense.find({author:req.session.user});
    // for(let monthlyExpense of monthlyExpenses){
    //     const newExpense = new Expense({
    //         name:monthlyExpense.name,
    //         type:monthlyExpense.type,
    //         cost:monthlyExpense.cost,
    //         date:Date.now(),
    //         author:req.session.user
    //     })
    //     await newExpense.save();
    // }
    res.redirect("/expenses");

}));


module.exports = router;
