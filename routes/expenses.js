const express = require("express");
const router = express.Router();

const Expense = require("../models/expense");
const ExpenseType = require("../models/expenseType");

//middlewares
const {isLoggedIn,isVerified} = require("../utils/middleware");
const {catchAsync} = require("../utils/catchAsync");


// helper functions
const { saveUnsavedExpenses,
        import_monthly_expenses,
        add_unsaved_expense
        } = require("../public/javascripts/expensesFuncs");

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
    if(!name)
        return res.redirect("/expenses");
    await add_unsaved_expense(name,type,cost,date,req.session.user);
    res.redirect("/expenses");
}));

// delete one expense given the id
router.post("/expenses/deleteExpense/:id",isLoggedIn,isVerified, catchAsync(async(req,res)=>{
    await Expense.findByIdAndDelete(req.params.id);
    res.redirect("/expenses");
}));


// save unsaved expenses
router.post("/expenses/save-expenses",isLoggedIn,isVerified,catchAsync(async(req,res)=>{
    await saveUnsavedExpenses(req.session.user);
    res.redirect("/expenses");
}));

// import monthly expenses as unsaved expenses
router.post("/expenses/import-monthly-expenses",async(req,res)=>{
    // now add all the monthly expenses (if any)
    await import_monthly_expenses(req.session.user);
    res.redirect("/expenses");
})

module.exports = router;
