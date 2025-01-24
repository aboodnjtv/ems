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
        add_unsaved_expense,
        get_unsaved_expenses,
        get_saved_expenses,
        get_expenses_type,
        calculate_total_costs,
        unsaved_expenses_report
        } = require("../public/javascripts/expensesFuncs");

// expenses main page
router.get("/expenses",isLoggedIn,isVerified,catchAsync(async (req,res)=>{
    //change to unsaved expenses
    const unsaved_expenses = await get_unsaved_expenses(req.session.user);
    const expenseTypes = await get_expenses_type(req.session.user);
    const savedExpenses = await get_saved_expenses(req.session.user);
    let totalCosts = calculate_total_costs(unsaved_expenses);
    const report = unsaved_expenses_report(unsaved_expenses,totalCosts)
    const reported_expenses = req.session.reported_expenses;
    res.render("./expenses",{unsaved_expenses,expenseTypes,totalCosts,report,savedExpenses,reported_expenses});
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
router.post("/expenses/import-monthly-expenses",isLoggedIn,isVerified,catchAsync(async(req,res)=>{
    // now add all the monthly expenses (if any)
    await import_monthly_expenses(req.session.user);
    res.redirect("/expenses");
}));


// show a month report
router.post("/expenses/show-month-report",isLoggedIn,isVerified,catchAsync(async(req,res)=>{
    //get all the SAVED expenses from the date of the given month and year
    const {date} = req.body;
    if(date=="")
        return res.redirect("/expenses");
    const date_as_array = date.split("-");
    const year = date_as_array[0];
    var month = date_as_array[1];
    // months from Jan to Sep start with 0, example : 04
    if(month.charAt(0)==="0")
        month = month.slice(1);
    // pull the SAVED expenses from database 
    const reported_expenses = await Expense.find({author:req.session.user, saved:true,month,year});
    req.session.reported_expenses = reported_expenses;
    res.redirect("/expenses");
}));




module.exports = router;
