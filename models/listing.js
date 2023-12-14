const mongoose = require("mongoose");
const Schema = mongoose.Schema;

//Listing Schema
const listingSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,
  image: {
    type: String,
    //Setting a default image
    default:"https://unsplash.com/photos/beach-shttps://images.unsplash.com/photo-1506477331477-33d5d8b3dc85?q=80&w=1468&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3Dhore-during-day-time-7uXn7nudorc",
    set: (v) => 
       v === ""
        ? "https://images.unsplash.com/photo-1506477331477-33d5d8b3dc85?q=80&w=1468&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        : v,
    
  },
  price: Number,
  location: String,
  country: String,
  reviews:[{
    type:Schema.Types.ObjectId, //one to many relationship
    ref: "Review",
  }  ],
});

//Creating Listing Model using the listingSchema
const Listing = mongoose.model("Listing", listingSchema);

//Exporting the model to app.js
module.exports = Listing;
