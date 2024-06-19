const express = require("express"); // Express.js for backend framework
const cors = require("cors"); // para ma integrate yung port ng front end and back end
const { mongoose } = require("mongoose"); // Connects to MongoDB database
const cookieParser = require("cookie-parser");
const fs = require("fs");
const path = require("path");
const app = express(); // Creates an Express application instance

// Models
const User = require("./models/UserModel"); // Imports the User model from the models directory

// Security
const jwt = require("jsonwebtoken");
const verifyJWT = require("./utils/authUtils");

const bcrypt = require("bcryptjs"); // For password hashing
require("dotenv").config(); // Loads environment variables from .env file

// Middleware for encrypting password
const bcryptSalt = bcrypt.genSaltSync(13); // Generates a salt for password hashing
//Middleware for isAdmin Authentication
const verifyAdmin = require("./middlewares/verifyAdmin");

app.use(express.json()); // Parses incoming JSON data in requests coz json lng ang tinatanggap sa api
app.use(cookieParser());

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
  const { name, email, password, isAdmin } = req.body; // Destructures user data from request body

  try {
    const createdUser = await User.create({
      // Attempts to create a new user document
      name,
      email,
      password: bcrypt.hashSync(password, bcryptSalt),
      isAdmin, // Hashes password before saving
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
          name: LoggedInUser.name,
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
          res.cookie("token", token).json(LoggedInUser);
        }
      );
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } else {
    res.status(404).json({ message: "User not found" });
  }
});

app.get("/profile", (req, res) => {
  const { token } = req.cookies;
  if (token) {
    jwt.verify(token, process.env.JWT_SECRET, {}, async (err, userData) => {
      if (err) throw err;
      const { name, email, _id, isAdmin } = await User.findById(userData.id);
      res.json({ name, email, _id, isAdmin });
    });
  } else {
    res.json(null);
  }
});

app.post("/logout", (req, res) => {
  res.cookie("token", "").json(true);
});

// Starts the server on the PORT environment variable

//TESTIN--------------------------------------------
const multer = require("multer");
const Document = require("./models/Document");

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

app.post("/upload", upload.single("file"), async (req, res) => {
  const { file } = req;
  const userId = req.body.userId; // Get userId from the request body

  const newDocument = new Document({
    filename: file.filename,
    originalname: file.originalname,
    contentType: file.mimetype,
    size: file.size,
    path: file.path,
    userId: new mongoose.Types.ObjectId(userId),
  });

  try {
    await newDocument.save();
    res.status(201).send("File uploaded successfully");
  } catch (error) {
    console.error("Error saving document:", error);
    res.status(500).send(error);
  }
});

app.get("/documents", async (req, res) => {
  const userId = req.query.userId; // Get userId from the query parameters
  console.log("Fetching documents for user ID:", userId);
  try {
    const documents = await Document.find({ userId });
    res.status(200).json(documents);
  } catch (err) {
    console.error("Error fetching documents:", err);
    res.status(500).send(err);
  }
});

app.get("/users", async (req, res) => {
  try {
    // Fetch users with their documents
    const usersWithDocuments = await User.aggregate([
      {
        $lookup: {
          from: "documents",
          localField: "_id",
          foreignField: "userId",
          as: "documents",
        },
      },
    ]);

    res.status(200).json(usersWithDocuments);
  } catch (error) {
    console.error("Error fetching users and documents:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Update the DELETE endpoint for documents
app.delete("/documents/:documentId", async (req, res) => {
  const { documentId } = req.params;

  try {
    // Find the document by ID
    const document = await Document.findById(documentId);
    if (!document) {
      return res.status(404).send("Document not found");
    }

    // Delete document from database
    await Document.findByIdAndDelete(documentId);

    // Delete document from uploads directory
    const filePath = path.join(__dirname, "uploads", document.filename);
    fs.unlink(filePath, (err) => {
      if (err) {
        console.error("Error deleting file:", err);
        return res.status(500).send("Error deleting file");
      }
      console.log("File deleted successfully");
    });

    res.status(200).send("Document deleted successfully");
  } catch (error) {
    console.error("Error deleting document:", error);
    res.status(500).send("Internal server error");
  }
});

const Memo = require("./models/Memo");

app.get("/memos", async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  try {
    const memos = await Memo.find()
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
    res.status(200).json(memos);
  } catch (error) {
    console.error("Error fetching memos:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/memos", async (req, res) => {
  const { title, content } = req.body;

  try {
    const memo = new Memo({ title, content });
    await memo.save();
    res.status(201).json(memo);
  } catch (error) {
    console.error("Error creating memo:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.delete("/memos/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const memo = await Memo.findById(id);
    if (!memo) {
      return res.status(404).json({ message: "Memo not found" });
    }

    await memo.deleteOne(); // Use deleteOne() to delete the memo
    res.status(200).json({ message: "Memo deleted successfully" });
  } catch (error) {
    console.error("Error deleting memo:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.put("/memos/:id", async (req, res) => {
  const { id } = req.params;
  const { title, content } = req.body;

  try {
    const memo = await Memo.findById(id);
    if (!memo) {
      return res.status(404).json({ message: "Memo not found" });
    }

    // Update memo fields
    memo.title = title;
    memo.content = content;

    await memo.save(); // Save the updated memo
    res.status(200).json(memo); // Return the updated memo as JSON response
  } catch (error) {
    console.error("Error updating memo:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Start the Server
app.listen(process.env.PORT);
