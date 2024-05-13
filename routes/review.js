const express = require("express");
const { validateSchema } = require("../middleware");
const catchAsync = require("../utils/catchAsync");
const { reviewSchema } = require("../schemas");
const { isLoggedIn, isReviewAuthor } = require("../middleware");
const reviews = require("../controllers/reviews");

const router = express.Router({ mergeParams: true });

const validateReview = validateSchema(reviewSchema);

router.post("/", isLoggedIn, validateReview, catchAsync(reviews.createReview));

router.delete(
  "/:reviewId",
  isLoggedIn,
  isReviewAuthor,
  catchAsync(reviews.deleteReview)
);

module.exports = router;
