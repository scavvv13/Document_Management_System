const express = require("express"); // Express.js for backend framework
const cors = require("cors"); // para ma integrate yung port ng front end and back end
const { mongoose } = require("mongoose"); // Connects to MongoDB database

const app = express(); // Creates an Express application instance

// Models
const User = require("./models/UserModel"); // Imports the User model from the models directory

// Security
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs"); // For password hashing
require("dotenv").config(); // Loads environment variables from .env file

// Middleware for encrypting password
const bcryptSalt = bcrypt.genSaltSync(13); // Generates a salt for password hashing
//Middleware for isAdmin Authentication
const verifyAdmin = require("./middlewares/verifyAdmin");

app.use(express.json()); // Parses incoming JSON data in requests coz json lng ang tinatanggap sa api

// CORS Configuration
app.use(
  cors({
    credentials: true, // Enables cookies for authentication (if needed)
    origin: "http://localhost:5173", // Allows requests from the frontend port
  })
);

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URL); // Connects to the database using the MONGO_URL environment variable

//------------------------------- ENDPOINTS -------------------------------

// Test Endpoint
app.get("/test", (req, res) => {
  res.json("test ok"); // Sends a test response to verify server functionality
});

// Register User Endpoint
app.post("/RegisterPage", async (req, res) => {
  const { name, email, password } = req.body; // Destructures user data from request body

  try {
    const createdUser = await User.create({
      // Attempts to create a new user document
      name,
      email,
      password: bcrypt.hashSync(password, bcryptSalt), // Hashes password before saving
    });
    res.json(createdUser); // Sends the created user document as response
  } catch (error) {
    console.error(error); // Logs any errors during user creation
    res.status(500).json({ message: "Error creating user" }); // Sends error response
  }
});

//Login User Endpoint
app.post("/LoginPage", async (req, res) => {
  const { email, password } = req.body;
  const LoggedInUser = await User.findOne({ email });

  if (LoggedInUser) {
    const correctPass = bcrypt.compareSync(password, LoggedInUser.password);
    if (correctPass) {
      jwt.sign(
        {
          email: LoggedInUser.email,
          id: LoggedInUser._id,
          isAdmin: LoggedInUser.isAdmin,
        },
        process.env.JWT_SECRET,
        {},
        (err, token) => {
          if (err) {
            console.error(err); // Log any JWT signing errors
            res.status(500).json({ message: "Internal server error" });
            return;
          }
          res.cookie("token", token).json("pass ok");
        }
      );
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } else {
    res.status(404).json({ message: "User not found" });
  }
});

// Start the Server
app.listen(process.env.PORT); // Starts the server on the PORT environment variable
