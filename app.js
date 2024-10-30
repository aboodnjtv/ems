const mongoose = require("mongoose");
// const ejs = require("ejs");
const ejsMate = require("ejs-mate");
const path = require("path");
const methodOverride = require("method-override");
const express = require("express");
const app = express();
const ExpressError = require("./utils/ExpressError");
const session = require("express-session");
////////////////////////////////////////////
// require routes
const itemRoutes = require("./routes/items");
const ingredientRoutes = require("./routes/ingredients");
const userRoutes = require("./routes/user");
const servicesRoutes = require("./routes/services");
const expensesRoutes = require("./routes/expenses");
const expensesSettingsRoutes = require("./routes/expensesSettings");

// connect to database
require("./config/db");

app.engine("ejs", ejsMate);

//------------------------- app.set
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));

//------------------------- app.use
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true })); // to parse req.body
app.use(methodOverride("_method")); // so we could send PUT and DELETE requests
app.use(session({ secret: "sessionsecret" })); // use session


// res.locals
app.use((req, res, next) => {
  res.locals.currentUser = req.session.user;
  next();
});
//routes
app.use("/", itemRoutes); // use item routes
app.use("/", ingredientRoutes); // use item routes
app.use("/", userRoutes); // use user routes
app.use("/", servicesRoutes); // use services routes
app.use("/", expensesRoutes); // use expenses routes
app.use("/", expensesSettingsRoutes); // use expenses settings routes



//home page
app.get("/",(req, res) => {
  res.render("home");
});


//404 page does not exits
app.all("*", (req, res) => {
  throw new ExpressError("Page is not found", 404);
});

// error handler (to render the error template)
app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  if (!err.message) {
    err.message = "Something went worng";
  }
  res.status(statusCode).render("error", { err });
});

app.listen(3000, () => {
  console.log("Serving on port 3000");
});
