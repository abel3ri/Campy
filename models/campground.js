const mongoose = require("mongoose");
const { Schema } = mongoose;
const Review = require("./review");

// prettier-ignore
const campgroundSchema = new Schema({
  title: String,
  images: [
    { 
      url: String, 
      filename: String
     }
  ],
  price: Number,
  description: String,
  location: String,
  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: "Review",
    },
  ],
  author: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
});

campgroundSchema.post("findOneAndDelete", async (campground) => {
  if (campground) {
    await Review.deleteMany({
      _id: {
        $in: campground.reviews,
      },
    });
  }
});

module.exports = mongoose.model("Campground", campgroundSchema);
