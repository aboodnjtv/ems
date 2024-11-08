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
    // 
    const expenses = await Expense.find({author:req.session.user,name:{ $ne: "saved" }})
    const expenseTypes = await ExpenseType.find({author:req.session.user});

    const savedExpenses = await Expense.find({author:req.session.user,name:"saved"});

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

    // if no date was given, then we use today's date
    if(!date){
        date = Date.now()
    }else{
        // construct the date from the given month and year
        const dateAsArray = date.split("-");
        const year = dateAsArray[0];
        const month = dateAsArray[1];
        date = new Date(`${year}-${month}-1`);
    }


    const newExpense = new Expense({
        name,
        type,
        cost,
        date,
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
    // delete all expenses
    await Expense.deleteMany({author:req.session.user});
    // now add all the monthly expenses (if any)
    const monthlyExpenses = await MonthlyExpense.find({author:req.session.user});
    for(let monthlyExpense of monthlyExpenses){
        const newExpense = new Expense({
            name:monthlyExpense.name,
            type:monthlyExpense.type,
            cost:monthlyExpense.cost,
            date:Date.now(),
            author:req.session.user
        })
        await newExpense.save();
    }

    res.redirect("/expenses");

}));


module.exports = router;
