
const fs = require("node:fs/promises");
const homeDir = require('os').homedir(); // get home directory path

// helps with file upload  ---------------------
const multer = require("multer")
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'public/expenses_uploads') // where the file will be uploaded
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname) // using the same name as the original file
    }
  })
const upload = multer({ storage })
// exports the middleware to upload files
module.exports.upload =upload;
// ---------------------------------------------


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
    // for(let expense of expenses){
    for(let i = 0 ;i<expenses.length;i++){
        let expense_data="";
        expense_data+=expenses[i].name+",";
        expense_data+=expenses[i].type+",";
        expense_data+=expenses[i].cost+",";
        expense_data+=expenses[i].date+",";
        expense_data+=expenses[i].month+",";
        expense_data+=expenses[i].year+",";
        expense_data+=expenses[i].saved;
        //adding a new line
        if(i !== expenses.length-1)
          expense_data+="\n"
        file_content.push(expense_data);
    }
}


function extract_expenses(file_content){
  const extracted_expenses = [];
  // first row has the header (not part of expenses)
  const lines = file_content.split(/\r?\n/); 

  // skip the fist row 
  for(let i = 1;i<lines.length;i++){
    const expnese_data = lines[i].split(",");
    const expense_as_object = {
      name:expnese_data[0],
      type:expnese_data[1],
      cost:Number(expnese_data[2]) || 0,// getting cost as a Number and not a String
      date:expnese_data[3],
      month:expnese_data[4],
      year:expnese_data[5],
      saved:expnese_data[6]
    }
    extracted_expenses.push(expense_as_object);
  }

  return extracted_expenses;

}

function delete_expenses_csv_file(path){
  fs.unlink(path, (err) => {
    if (err) {
      console.error(err);
      return;
    }
    console.log('File deleted successfully!');
  });
}

///////////////////////////////////
///////////////////////////////////
///////////////////////////////////

// exported functions

// return a CSV file with all user's expenses
module.exports.get_expenses_as_csv = async function (expenses) {
    const file_content = [];
    create_expenses_table_header(file_content);
    add_expenses(expenses,file_content);
    return file_content;
};

//returns a list of expenses from the csv file
module.exports.get_expenses_from_file = async function (file_path) {
    // read file content and store them
    const file_content = await fs.readFile(file_path,"utf-8");
    // extract the expenses and return them as a list
    extracted_expenses = extract_expenses(file_content);
    // when we upload the file, it goes to public/expenses_uploads
    // we don't want to keep it there, so we delete it after we parse it
    delete_expenses_csv_file(file_path)
    return extracted_expenses;

};







