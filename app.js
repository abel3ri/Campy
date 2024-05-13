const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const ejsMate = require("ejs-mate");
const methodOverride = require("method-override");
const ExpressError = require("./utils/ExpressError");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalPassport = require("passport-local");
const User = require("./models/user");

const reviewRoutes = require("./routes/review");
const campgroundRoutes = require("./routes/campground");
const userRoutes = require("./routes/users");

if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

(async () => {
  try {
    await mongoose.connect("mongodb://127.0.0.1:27017/yelp-camp");
    console.log("db connected!");
  } catch (err) {
    console.log(err.message);
  }
})();

const app = express();

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

const sessionConfig = {
  secret: "thisshouldbeabettersecret",
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  },
};
app.use(session(sessionConfig));
app.use(flash());

//! Passport related middleware
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalPassport(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(express.static(`${__dirname}/public`));

app.use((req, res, next) => {
  // console.log(req.session);
  res.locals.currentUser = req.user;
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

//! Routes handling middlewares

app.use("/", userRoutes);
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/reviews", reviewRoutes);

app.get("/", (req, res) => {
  res.render("home");
});

app.all("*", (req, res, next) => {
  next(new ExpressError("Page not found!", 404));
});

app.use((err, req, res, next) => {
  // const { statusCode = 500, message = "Something went wrong!" } = err;
  if (!err.message) err.message = "Something Went Wrong!";
  if (!err.statusCode) err.statusCode = 500;
  res.status(err.statusCode).render("error", { err });
});

app.listen(3000, () => {
  console.log("Serving on port 3000");
});
