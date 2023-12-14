const express = require("express");
const app = express();
const mongoose = require("mongoose");
const port = 8080;
const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const { listingSchema, reviewSchema } = require("./schema.js");
const Review = require("./models/review.js");



const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

main()
  .then(() => {
    console.log("Connected to db.");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(MONGO_URL);
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

//Root route
app.get("/", (req, res) => {
  res.send("Hey, I'm root.");
});

const validateListing = (req, res, next) => {
  let { error } = listingSchema.validate(req.body);
  if (error) {
    let errMsg = error.details.map((el)=>el.message).join(",");
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
};

const validateReview = (req, res, next) => {
  let { error } = reviewSchema.validate(req.body);
  if (error) {
    let errMsg = error.details.map((el)=>el.message).join(",");
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
};

//Index Route
// app.get("/listings",async (req,res)=>{
//   await Listing.find({}).then((res)=>{
//     console.log(res);
//   });
// });
app.get(
  "/listings",
  wrapAsync(async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
  })
);

//Show Route-Read
app.get(
  "/listings/:id",
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id).populate("reviews");
    res.render("listings/show.ejs", { listing });
  })
);

//New Route - Create
app.get("/listing/new", (req, res) => {
  res.render("listings/new.ejs");
});

//Create Route
app.post(
  "/listings",
  validateListing,
  wrapAsync(async (req, res, next) => {
    //let {title,description,image,price,location,country} =req.body;
    // let listing =  req.body.listing;
    const newListing = new Listing(req.body.listing);
    await newListing.save();
    res.redirect("/listings");
  })
);

//Edit Route
app.get(
  "/listings/:id/edit",
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs", { listing });
  })
);

//Update Route
app.put(
  "/listings/:id",
  validateListing,
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findByIdAndUpdate(id, req.body.listing);
    res.redirect(`/listings/${id}`);
  })
);

//Delete Route
app.delete(
  "/listings/:id",
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndDelete(id);
    res.redirect("/listings");
  })
);



//Reviews
//Post route
app.post("/listings/:id/reviews", validateReview , wrapAsync(async(req,res)=>{
let listing = await Listing.findById(req.params.id);
let newReview = new Review(req.body.review);
listing.reviews.push(newReview);
await newReview.save();
await listing.save();
// console.log("New review saved");
// res.send("new review saved");
res.redirect(`/listings/${listing._id}`);
}));

// app.get("/testListing",async (req,res)=>{
//  let sampleListing = new Listing({
//   title:"My New Villa",
//   description: "By the beach",
//   price:1200,
//   location: "Calangute, Goa",
//   country: "India"
//  });
//  await sampleListing.save();
//  console.log("Sample was saved.");
//  res.send("Successful testing");
// });

//PAge not found error -invalid route
app.all("*", (req, res, next) => {
  next(new ExpressError(404, "Page not found!!!"));
});

//Error Handling Middleware
app.use((err, req, res, next) => {
  let { statusCode = 500, message = "Something went wrong" } = err;
  res.status(statusCode).render("error.ejs", { message });
  // res.status(statusCode).send(message);
});

app.listen(port, () => {
  console.log(`Listening to port ${port}`);
});
