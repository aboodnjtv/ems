const Expense = require("../../models/expense");
const MonthlyExpense = require("../../models/monthlyExpense");
const ExpenseType = require("../../models/expenseType");


// helper functions

//returns all unsaved expenses
async function get_unsaved_expenses(userId){
    return await Expense.find({
        author:userId,
        saved:false}
    );
}

// returns a saved expense with the same type, month, and year (if any)
async function find_saved_expense_with_same_type_month_and_year(unsaved_expense){
    return await Expense.findOne({
        type : unsaved_expense.type,
        month : unsaved_expense.month,
        year : unsaved_expense.year,
        saved: true,
        author:unsaved_expense.author

    })
}

// creates a new saved expense with the type, month, year, and cost of the unsaved expense
async function create_new_saved_expense_from_unsaved_expense(unsaved_expense){
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

// creates an unsaved expense from a monthly expense
async function create_new_unsaved_expense_from_monthly_expense(monthlyExpense,month,year){
    const newUnsavedExpense = new Expense({
        name:monthlyExpense.name,
        type:monthlyExpense.type,
        cost:monthlyExpense.cost,
        date:new Date(),
        month,
        year,
        saved:false,
        author:monthlyExpense.author
    })
    // save the newly created unsaved expense
    await newUnsavedExpense.save();
}

// creates a new unsaved expense
async function create_new_unsaved_expense(name,type,cost,date,month,year,userId){
    const new_unsaved_expense = new Expense({
        name,
        type,
        cost,
        date,
        month,
        year,
        saved:false,
        author: userId
    })
    await new_unsaved_expense.save();
}

// updates the savedExpense by adding the cost of the unsaved expense
async function update_saved_expense_cost(savedExpense,unsaved_expense){
    const updatedCost = savedExpense.cost + unsaved_expense.cost; 
    await Expense.updateOne({_id:savedExpense._id},{
        cost:updatedCost
    })
}

/////////////////////////////////////////////////////
/////////////////////////////////////////////////////
/////////////////////////////////////////////////////
// Exported functions

// retrieves all unsaved expenses of the user
module.exports.get_unsaved_expenses = async function (userId) {
    const unsaved_expenses = await Expense.find({
        author:userId,
        saved:false,
    });
    return unsaved_expenses;
};
// retrieves all saved expenses of the user
module.exports.get_saved_expenses = async function (userId) {
    const saved_expenses = await Expense.find({
        author:userId,
        saved:true,
    });
    return saved_expenses;
};

// retrieves all expenses types of the user
module.exports.get_expenses_type = async function (userId) {
    const expenses_types = await ExpenseType.find({author:userId})
    return expenses_types;
};

// calculates total Costs of all current unsaved expenses
module.exports.calculate_total_costs = function (unsaved_expenses) {
    let totalCosts = 0;
    // to calculate the total spending
    for(unsaved_expense of unsaved_expenses){
        totalCosts += unsaved_expense.cost;
    }
    totalCosts = totalCosts.toFixed(2);
    return totalCosts;
};

// makes the report for the current unsaved expenses
module.exports.unsaved_expenses_report = function (unsaved_expenses,totalCosts) {
    const map = new Map();
    for(unsaved_expense of unsaved_expenses){
        if(map.has(unsaved_expense.type)){
            let curTotal = map.get(unsaved_expense.type) +unsaved_expense.cost; 
            map.set(unsaved_expense.type,curTotal);
        }
        else{
            map.set(unsaved_expense.type,unsaved_expense.cost);
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
    return report;
};

//takes all the unsaved expenses and save them
module.exports.saveUnsavedExpenses = async function (userId) {
    // for each unsaved expense, check if the type with the same month
    // and year are already avaialbe, then add to the cost,
    // otherwise, create a new expense and mark it as saved
    // at the end, delete the unsaved expense after it was saved
    const unsaved_expenses = await get_unsaved_expenses(userId);
    for(unsaved_expense of unsaved_expenses){
        const savedExpense = await find_saved_expense_with_same_type_month_and_year(unsaved_expense);
        if(savedExpense)
            await update_saved_expense_cost(savedExpense,unsaved_expense);
        else
            await create_new_saved_expense_from_unsaved_expense(unsaved_expense);
        //delete the unsaved expense after processing it
        await Expense.deleteOne({_id:unsaved_expense._id});
    }
  };


//retrieve the monthly expenses and add them to the unsaved expenses 
module.exports.import_monthly_expenses = async function (userId) {
    //get all monthly expenses that belong to the logged in user
    const monthlyExpenses = await MonthlyExpense.find({author:userId});
    //use today's date when making a new unsaved expense 
    const todaysDate = new Date();
    const month = todaysDate.getMonth()+1;
    const year = todaysDate.getFullYear();
    // for each monthly expense, make a new unsaved expense using today's date
    for(let monthlyExpense of monthlyExpenses)
        await create_new_unsaved_expense_from_monthly_expense(monthlyExpense,month,year);
};


// creates a new unsaved expense given the name, type, cost, and date
module.exports.add_unsaved_expense = async function (name,type,cost,date,userId) {
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
    await create_new_unsaved_expense(name,type,cost,date,month,year,userId);
};




