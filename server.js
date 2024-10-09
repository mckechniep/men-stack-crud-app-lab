const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const app = express();

const mongoose = require("mongoose");
const methodOverride = require("method-override");
const morgan = require("morgan");

const port = process.env.PORT ? process.env.PORT : "3000";


mongoose.connect(process.env.MONGODB_URI);

mongoose.connection.on("connected", () => {
  console.log(`connected to MongoDB ${mongoose.connection.name}.`);
});

// Middleware
app.use(express.urlencoded({ extended: false}));
app.use(methodOverride("_method"));
app.use(morgan("dev"));

// Set up EJS as the view engine
app.set('view engine', 'ejs');

const Dog = require("./models/dog.js");

// GET route for displaying the home page
app.get("/", async (req, res) => {
    res.render("index.ejs");
  });

// GET route for displaying a form to create a new dog
app.get("/dogs/new", (req, res) => {
  res.render("dogs/new.ejs");
});

// POST route for creating a new dog
app.post("/dogs", async (req, res) => {
  await Dog.create(req.body); // Create a new dog using the data from the request body
  res.redirect('/dogs'); // Redirect to the dogs index page
});


// GET route for displaying all dogs
app.get("/dogs", async (req, res) => {
  const dogs = await Dog.find(); // Fetch all dogs from the database
  res.render("dogs/index", { dogs }); // Render the 'index' view with the dogs data
});

// GET route for displaying a specific dog by ID
app.get("/dogs/:id", async (req, res) => {
  try {
    const dog = await Dog.findById(req.params.id);
    if (dog) {
      res.render("dogs/show", { dog });
    } else {
      res.status(404).send("Dog not found");
    }
  } catch (error) {
    res.status(500).send("Error fetching dog");
  }
});
// GET route for showing a form to edit an existing dog
app.get("/dogs/:id/edit", async (req, res) => {
  try {
    const dog = await Dog.findById(req.params.id);
    if (dog) {
      res.render("dogs/edit", { dog });
    } else {
      res.status(404).send("Dog not found");
    }
  } catch (error) {
    res.status(500).send("Error fetching dog for edit");
  }
});

// PUT route for updating a specific dog by ID
app.put("/dogs/:id", async (req, res) => {
  try {
    const updatedDog = await Dog.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (updatedDog) {
      res.redirect(`/dogs/${updatedDog._id}`);
    } else {
      res.status(404).send("Dog not found");
    }
  } catch (error) {
    res.status(500).send("Error updating dog");
  }
});

// DELETE route for deleting a dog
app.delete("/dogs/:id", async (req, res) => {
  await Dog.findByIdAndDelete(req.params.id);
  res.redirect("/dogs");
});


app.listen(3000, () => {
  console.log("Listening on port 3000");
});
