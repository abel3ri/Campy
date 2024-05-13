const Campground = require("./models/campground");
const Review = require("./models/review");
const ExpressError = require("./utils/ExpressError");

module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.session.returnTo = req.originalUrl;
    req.flash("error", "Yout must be signed in");
    return res.redirect("/login");
  } else return next();
};

module.exports.storeReturnTo = (req, res, next) => {
  if (req.session.returnTo) {
    res.locals.returnTo = req.session.returnTo;
  }
  next();
};

module.exports.isAuthor = async (req, res, next) => {
  const campId = req.params.id;
  const campground = await Campground.findById(campId);
  if (req.user.equals(campground.author)) {
    return next();
  } else {
    req.flash("error", "Sorry, you're not authorized to perform this action.");
    res.redirect(`/campgrounds/${campId}`);
  }
};

// const validateCampground = (req, res, next) => {
//   const { error } = campgroundSchema.validate(req.body);
//   if (error) {
//     const message = error.details.map((el) => el.message).join(",");
//     throw new ExpressError(message, 400);
//   } else {
//     next();
//   }
// };

module.exports.validateSchema = function (schema) {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      const message = error.details.map((el) => el.message).join(", ");
      throw new ExpressError(message, 400);
    } else {
      next();
    }
  };
};

module.exports.isReviewAuthor = async (req, res, next) => {
  const { id, reviewId } = req.params;
  const review = await Review.findById(reviewId);
  if (!review.author.equals(req.user._id)) {
    req.flash("error", "Sorry, you're not authorized to perform this action.");
    return res.redirect(`/campgrounds/${id}`);
  }
  next();
};
