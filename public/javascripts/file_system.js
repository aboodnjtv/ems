
const fs = require("node:fs/promises");
const homeDir = require('os').homedir(); // See: https://www.npmjs.com/package/os



// creates the table header for expenses
function create_expenses_table_header(file_content){
    const table_header = [
        "name",
        "type",
        "cost",
        "date",
        "month",
        "year",
        "saved"
    ]
    let table_header_as_string = "";
    for(let i = 0; i<table_header.length;i++){
        table_header_as_string+=table_header[i];
        // separate by commas
        if(i<table_header.length-1)
            table_header_as_string+=",";
    }
    //adding a new line
    table_header_as_string+="\n"; 
    file_content.push(table_header_as_string);
}

// adds all expenses to file content
function add_expenses(expenses,file_content){
    for(let expense of expenses){
        let expense_data="";
        expense_data+=expense.name+",";
        expense_data+=expense.type+",";
        expense_data+=expense.cost+",";
        expense_data+=expense.date+",";
        expense_data+=expense.month+",";
        expense_data+=expense.year+",";
        expense_data+=expense.saved;
        //adding a new line
        expense_data+="\n"
        file_content.push(expense_data);
    }
}

///////////////////////////////////
///////////////////////////////////
///////////////////////////////////

// exported functions

// downloads all expenses
module.exports.download_expenses = async function (expenses) {
    const file_content = [];
    create_expenses_table_header(file_content);
    add_expenses(expenses,file_content)
    await fs.writeFile(`${homeDir}/Desktop/expenses.csv`,file_content);
};