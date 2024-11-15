const Expense = require("../../models/expense");

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
async function create_new_saved_expense(unsaved_expense){
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


// updates the savedExpense by adding the cost of the unsaved expense
async function update_saved_expense_cost(savedExpense,unsaved_expense){
    const updatedCost = savedExpense.cost + unsaved_expense.cost; 
    await Expense.updateOne({_id:savedExpense._id},{
        cost:updatedCost
    })
}

/////////////////////////////////////////////////////
// Exported functions

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
            await create_new_saved_expense(unsaved_expense);
        //delete the unsaved expense after processing it
        await Expense.deleteOne({_id:unsaved_expense._id});
    }
  };


//retrieve the monthly expenses and add them to the unsaved expenses 
module.exports.import_monthly_expenses = async function (userId) {
    const monthlyExpenses = await MonthlyExpense.find({author:userId});
    const todaysDate = new Date();
    const month = todaysDate.getMonth()+1;
    const year = todaysDate.getFullYear();
    for(let monthlyExpense of monthlyExpenses){
        const newUnsavedExpense = new Expense({
            name:monthlyExpense.name,
            type:monthlyExpense.type,
            cost:monthlyExpense.cost,
            date:new Date(),
            month,
            year,
            saved:false,
            author:req.session.user
        })
        await newUnsavedExpense.save();
    }
};