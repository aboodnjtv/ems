const express = require("express");
const router = express.Router();

const ExpenseType = require("../models/expenseType");
const Expense = require("../models/expense");
const MonthlyExpense = require("../models/monthlyExpense");

const {download_expenses,get_expenses_from_file,upload} = require("../public/javascripts/file_system")
const {create_new_expense} = require("../public/javascripts/expensesFuncs")

//middlewares
const {isLoggedIn,isVerified} = require("../utils/middleware");

const {catchAsync} = require("../utils/catchAsync");

router.get("/expenses/settings",isLoggedIn,isVerified,catchAsync(async(req,res)=>{
    const expenseTypes = await ExpenseType.find({author: req.session.user});
    const monthlyExpenses = await MonthlyExpense.find({author: req.session.user});
    res.render("./expenses/settings",{expenseTypes,monthlyExpenses});
}));

// add new expense type
router.post("/expenses/settings/addtype",isLoggedIn,isVerified,catchAsync(async(req,res)=>{
    
    let{typeName} = req.body;
    typeName = typeName.toUpperCase();
    const newExpenseType =  new ExpenseType({
        type:typeName,
        author : req.session.user,
    }) 
    await newExpenseType.save();
    res.redirect("/expenses/settings");
}));


// delete specific expense type
router.post("/expensesSettings/delete-expense-type/:id",isLoggedIn,isVerified,catchAsync(async(req,res)=>{
    const {id} = req.params;
    await ExpenseType.findByIdAndDelete(id);
    res.redirect("/expenses/settings");

}));

// delete all expense types
router.post("/expensesSettings/delete-all-expense-types",isLoggedIn,isVerified,catchAsync(async(req,res)=>{
    await ExpenseType.deleteMany({author:req.session.user});
    res.redirect("/expenses/settings");
}));


// Monthly Expenses
// add new monthly expense
router.post("/expensesSettings/add-monthly-expense", isLoggedIn,isVerified, catchAsync(async(req,res)=>{
    const {name,type,cost} = req.body;
    const newMonthlyExpense = new MonthlyExpense({
        name,
        type,
        cost,
        date : Date.now(),
        author : req.session.user
    })

    await newMonthlyExpense.save();
    res.redirect("/expenses/settings");

}));

// delete sepecific Monthly Expense given the id
router.post("/expensesSettings/delete-monthly-expense/:id",isLoggedIn,isVerified, catchAsync(async(req,res)=>{
    const{id} = req.params;
    await MonthlyExpense.findByIdAndDelete(id);
    res.redirect("/expenses/settings");

}));


router.post("/expensesSettings/download-expenses",isLoggedIn,isVerified,catchAsync(async(req,res)=>{
    const expenses = await Expense.find({author:req.session.user});
    await download_expenses(expenses);
    res.redirect("/expenses/settings");
}));

// upload expenses
router.post("/expensesSettings/upload-expenses",isLoggedIn,isVerified,upload.single("csv_file"),catchAsync(async(req,res)=>{
    const file_path = `${req.file.destination}/${req.file.originalname}`;
    const extracted_expenses = await get_expenses_from_file(file_path);
    await Expense.deleteMany({author:req.session.user});
    for(let extracted_expense of extracted_expenses){
        const {name,type,cost,date,month,year,saved} = extracted_expense;
        await  create_new_expense(name,type,cost,date,month,year,saved,req.session.user)

    }
    res.redirect("/expenses/settings");
}));

module.exports = router;
