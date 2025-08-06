const express = require("express");
const router = express.Router();

const ExpenseType = require("../models/expenseType");
const Expense = require("../models/expense");
const MonthlyExpense = require("../models/monthlyExpense");

const {get_expenses_as_csv,get_expenses_from_file,upload} = require("../utils/file_system")
const {create_new_expense} = require("../utils/expensesFuncs")

//middlewares
const {isLoggedIn,isVerified} = require("../utils/middleware");

const {catchAsync} = require("../utils/catchAsync");

router.get("/expenses/settings",isLoggedIn,isVerified,catchAsync(async(req,res)=>{
    const expenseTypes = await ExpenseType.find({author: req.session.user});
    const monthlyExpenses = await MonthlyExpense.find({author: req.session.user});
    res.render("./expenses/settings",{expenseTypes,monthlyExpenses});
}));


router.get("/expenses/settings/add-expense-category",isLoggedIn,isVerified,catchAsync(async(req,res)=>{
    const expenseTypes = await ExpenseType.find({author: req.session.user});
    const monthlyExpenses = await MonthlyExpense.find({author: req.session.user});
    res.render("./expenses/settings/add-expense-category",{expenseTypes,monthlyExpenses});
}));

router.get("/expenses/settings/add-monthly-expense",isLoggedIn,isVerified,catchAsync(async(req,res)=>{
    const expenseTypes = await ExpenseType.find({author: req.session.user});
    const monthlyExpenses = await MonthlyExpense.find({author: req.session.user});
    res.render("./expenses/settings/add-monthly-expense",{expenseTypes,monthlyExpenses});
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


// an API that will download the expenses as CSV file
router.post("/expensesSettings/download-expenses",isLoggedIn,isVerified,catchAsync(async(req,res)=>{
    const expenses = await Expense.find({author:req.session.user});
    const expenses_as_csv =  await get_expenses_as_csv(expenses);
    // set headers 
    // Set headers for CSV download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="expenses.csv"');
    // Send the file content as the response
    res.send(expenses_as_csv.join('')); // Join lines for CSV formatting
    
}));

// upload expenses
router.post("/expensesSettings/upload-expenses",isLoggedIn,isVerified,upload.single("csv_file"),catchAsync(async(req,res)=>{
    
    // this is the path of the uploaded file, set up in file_system file
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
