const express = require("express"); // Express.js for backend framework
const cors = require("cors"); // para ma integrate yung port ng front end and back end
const { mongoose } = require("mongoose"); // Connects to MongoDB database
const cookieParser = require("cookie-parser");
const fs = require("fs");
const path = require("path");
const app = express(); // Creates an Express application instance
const Notification = require("./models/Notification");
const Folder = require("./models/Folder");
const validator = require("validator");
const { v4: uuidv4 } = require("uuid");

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
const multer = require("multer");
const Document = require("./models/Document");

const createNotification = async (userId, message) => {
  try {
    const notification = new Notification({ userId, message });
    await notification.save();
  } catch (error) {
    console.error("Error creating notification:", error);
  }
};

app.use(express.json()); // Parses incoming JSON data in requests coz json lng ang tinatanggap sa api
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// CORS Configuration
app.use(
  cors({
    origin: ["https://document-management-system-liard.vercel.app/"], // Allow your Vercel domain
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    credentials: true,
  })
);
//nice

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

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
  res.setHeader(
    "Access-Control-Allow-Origin",
    "https://document-management-system-liard.vercel.app"
  );
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Max-Age", "1800");
  res.setHeader("Access-Control-Allow-Headers", "content-type");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "PUT, POST, GET, DELETE, PATCH, OPTIONS"
  );
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
  res.setHeader(
    "Access-Control-Allow-Origin",
    "https://document-management-system-liard.vercel.app"
  );
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Max-Age", "1800");
  res.setHeader("Access-Control-Allow-Headers", "content-type");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "PUT, POST, GET, DELETE, PATCH, OPTIONS"
  );
  const { token } = req.cookies;
  if (token) {
    verifyJWT;
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

const upload = multer({ storage: multer.memoryStorage() });
const AWS = require("aws-sdk");

const s3 = new AWS.S3({
  accessKeyId: process.env.R2_ACCESS_KEY_ID,
  secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  endpoint: "https://0caeaf1335d916eb43eaceecf2663078.r2.cloudflarestorage.com", // Replace with your Cloudflare R2 endpoint
  region: "auto",
  s3ForcePathStyle: true,
  signatureVersion: "v4",
});

const generateSignedUrl = (bucketName, key, expiresIn = 60) => {
  const params = {
    Bucket: bucketName,
    Key: key, // Ensure this matches the key used during upload
    Expires: expiresIn,
  };
  return s3.getSignedUrl("getObject", params);
};

app.get("/documents/:documentId/signed-url", async (req, res) => {
  const documentId = req.params.documentId;
  const document = await Document.findById(documentId);

  if (!document) {
    return res.status(404).json({ error: "Document not found" });
  }

  // Ensure this key corresponds to the file stored in R2
  const signedUrl = generateSignedUrl(
    process.env.R2_BUCKET_NAME,
    document.filename
  );
  res.json({ signedUrl });
});

app.post("/upload", upload.single("file"), async (req, res) => {
  verifyJWT;
  const { file } = req;
  const { userId, folderId } = req.body;

  if (!file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  if (!userId) {
    return res.status(400).json({ message: "userId is required" });
  }

  try {
    // Upload file to R2
    const r2Response = await s3
      .upload({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: file.originalname, // Use originalname or another key based on your needs
        Body: file.buffer, // File buffer from multer
        ContentType: file.mimetype,
      })
      .promise();

    const fileUrl = `https://${process.env.R2_BUCKET_NAME}.r2.cloudflarestorage.com/${file.originalname}`;

    const newDocument = new Document({
      filename: file.originalname,
      originalname: file.originalname,
      contentType: file.mimetype,
      previewImageUrl: fileUrl, // Save the full URL here
      size: file.size,
      path: file.path, // This might not be needed for cloud storage
      userId: new mongoose.Types.ObjectId(userId),
      folderId: folderId ? new mongoose.Types.ObjectId(folderId) : null,
    });

    await newDocument.save();

    // Create notification after saving the document
    await createNotification(userId, "Your document has been uploaded.");

    // Respond to the client after both document save and notification creation
    res.status(201).json({
      message: "Document uploaded successfully",
      document: newDocument,
    });
  } catch (error) {
    console.error("Error saving document:", error);
    res.status(500).json({ message: "Failed to upload document" });
  }
});

app.get("/documents/:documentId/content", async (req, res) => {
  const { documentId } = req.params;

  try {
    const document = await Document.findById(documentId);
    if (!document) {
      return res.status(404).send("Document not found");
    }

    // Get the file from R2
    const params = {
      Bucket: process.env.R2_BUCKET_NAME,
      Key: document.filename,
    };

    s3.getObject(params, (err, data) => {
      if (err) {
        console.error("Error fetching file from R2:", err);
        return res.status(500).send("Error fetching file");
      }
      // Send the file data as the response
      res.setHeader("Content-Type", document.contentType);
      res.send(data.Body);
    });
  } catch (error) {
    console.error("Error fetching document content:", error);
    res.status(500).send("Internal server error");
  }
});

app.get("/documents", async (req, res) => {
  const { userId } = req.query;

  try {
    // Query documents based on userId or sharedWith field
    const documents = await Document.find({
      $or: [{ userId: userId }, { sharedWith: userId }],
    }).populate("sharedWith", "email");

    // Return documents with preview URLs
    res.status(200).json(documents);
  } catch (error) {
    console.error("Error fetching documents:", error);
    res.status(500).send("Error fetching documents");
  }
});

app.get("/folders/:folderId/documents", async (req, res) => {
  const { folderId } = req.params;

  try {
    const documents = await Document.find({ folderId: folderId });
    res.status(200).json(documents);
  } catch (error) {
    console.error("Error fetching documents by folder:", error);
    res.status(500).json({ message: "Failed to fetch documents" });
  }
});

app.get("/folders", async (req, res) => {
  const { userId } = req.query;
  try {
    const folders = await Folder.find({ userId });
    res.json(folders);
  } catch (error) {
    console.error("Error fetching folders:", error);
    res.status(500).json({ error: "Failed to fetch folders" });
  }
});

app.post("/createFolder", async (req, res) => {
  const { name, parentFolderId, userId } = req.body; // Ensure userId is passed in the request body

  try {
    const newFolder = await Folder.create({ name, userId, parentFolderId });
    res.status(201).json(newFolder);
  } catch (error) {
    console.error("Error creating folder:", error);
    res.status(500).json({ error: "Failed to create folder" });
  }
});

app.get("/users/suggestions", async (req, res) => {
  const uploadedBy = req.query.uploadedBy;

  try {
    const users = await User.find({
      name: { $regex: uploadedBy, $options: "i" },
    });
    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching user suggestions:", error);
    res.status(500).json({ error: "Error fetching user suggestions" });
  }
});

app.get("/documents/suggestions", async (req, res) => {
  const documentName = req.query.documentName;

  try {
    const documents = await Document.find({
      documentName: { $regex: documentName, $options: "i" },
    });
    res.status(200).json(documents);
  } catch (error) {
    console.error("Error fetching document suggestions:", error);
    res.status(500).json({ error: "Error fetching document suggestions" });
  }
});
// Fetch all users with their documents
app.get("/users", async (req, res) => {
  try {
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
  } catch (err) {
    console.error("Error fetching users with documents:", err);
    res.status(500).send(err);
  }
});

app.get("/global-search", async (req, res) => {
  const { query, userId, isAdmin } = req.query;

  try {
    let documentResults = [];
    let userResults = [];

    if (isAdmin) {
      documentResults = await Document.find({
        $or: [
          { originalname: { $regex: query, $options: "i" } },
          { description: { $regex: query, $options: "i" } },
        ],
      }).populate("userId", "name");
    } else {
      // Regular user can only search their own documents
      documentResults = await Document.find({
        userId,
        $or: [
          { originalname: { $regex: query, $options: "i" } },
          { description: { $regex: query, $options: "i" } },
        ],
      }).populate("userId", "name");
    }

    // Always search for users regardless of isAdmin status
    userResults = await User.find({
      $or: [
        { name: { $regex: query, $options: "i" } },
        { email: { $regex: query, $options: "i" } },
      ],
    });

    const formattedResults = [
      ...documentResults.map((doc) => ({
        _id: doc._id,
        originalname: doc.originalname,
        description: doc.description,
        uploadedBy: doc.userId.name,
        type: "document",
      })),
      ...userResults.map((user) => ({
        _id: user._id,
        name: user.name,
        email: user.email,
        type: "user",
      })),
    ];

    res.status(200).json(formattedResults);
  } catch (error) {
    console.error("Error fetching search results:", error);
    res.status(500).json({ error: "Error fetching search results" });
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

    // Delete document from the database
    await Document.findByIdAndDelete(documentId);

    // Delete document from R2 bucket
    const deleteParams = {
      Bucket: process.env.R2_BUCKET_NAME,
      Key: document.filename,
    };

    s3.deleteObject(deleteParams, (err, data) => {
      if (err) {
        console.error("Error deleting file from R2:", err);
        return res.status(500).send("Error deleting file from R2");
      }
      console.log("File deleted successfully from R2");
      res.status(200).send("Document deleted successfully");
    });
  } catch (error) {
    console.error("Error deleting document:", error);
    res.status(500).send("Internal server error");
  }
});

// DELETE user and their documents
app.delete("/users/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    // Validate if userId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).send("Invalid user ID");
    }

    // Find the user by ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).send("User not found");
    }

    // Delete user's documents from database
    await Document.deleteMany({ user: userId });

    // Delete user from database
    await User.findByIdAndDelete(userId);

    res.status(200).send("User and associated documents deleted successfully");
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).send("Internal server error");
  }
});

app.patch("/users/:id/make-admin", async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isAdmin: true },
      { new: true }
    );

    // Create notification for the user
    await createNotification(user._id, `You have been granted admin rights.`);

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Revoke admin rights
app.patch("/users/:id/revoke-admin", async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isAdmin: false },
      { new: true }
    );

    // Create notification for the user
    await createNotification(user._id, `Your admin rights have been revoked.`);

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
app.put("/users/:userId", async (req, res) => {
  const { userId } = req.params;
  const { isAdmin } = req.body;

  try {
    // Find user by ID and update isAdmin field
    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      { isAdmin },
      { new: true } // Return the updated document
    );

    if (!updatedUser) {
      return res.status(404).send("User not found");
    }

    // Respond with updated user object
    res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).send("Internal server error");
  }
});

const Memo = require("./models/Memo");
const UserModel = require("./models/UserModel");

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

    // Example: Notify all users about the new memo
    const users = await User.find(); // Adjust this query as needed
    const notificationPromises = users.map((user) =>
      createNotification(user._id, `New memo "${memo.title}" has been created.`)
    );
    await Promise.all(notificationPromises);

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

// Endpoint to fetch notifications
app.get("/notifications", async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }
    const notifications = await Notification.find({ userId }).sort({
      date: -1,
    });
    res.json(notifications);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Endpoint to mark a notification as read
app.put("/notifications/:id/read", async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }
    const notification = await Notification.findOne({
      _id: req.params.id,
      userId,
    });
    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }
    notification.read = true;
    await notification.save();
    res.json(notification);
  } catch (error) {
    console.error("Error updating notification:", error);
    res.status(500).json({ message: "Server error" });
  }
});

app.delete("/notifications/:id", async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      userId,
    });
    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }
    res.json({ message: "Notification deleted successfully" });
  } catch (error) {
    console.error("Error deleting notification:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Add this route to your existing routes

app.post("/api/documents/:documentId/share", async (req, res) => {
  const { documentId } = req.params;
  const { email } = req.body;

  try {
    // Validate email format
    if (!validator.isEmail(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    // Find the user and document concurrently
    const [user, document] = await Promise.all([
      User.findOne({ email }).lean(),
      Document.findById(documentId).lean(),
    ]);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }

    // Check if user is already in the sharedWith list
    if (document.sharedWith.includes(user._id)) {
      return res
        .status(200)
        .json({ message: "Document already shared with this user" });
    }

    // Update the document to add user to sharedWith list
    await Document.findByIdAndUpdate(documentId, {
      $addToSet: { sharedWith: user._id },
    });

    // Create a notification for the user
    await createNotification(
      user._id,
      `A document has been shared with you: ${document.originalname}`
    );

    res.status(200).json({ message: `Document shared with ${email}` });
  } catch (error) {
    console.error("Error sharing document:", error);
    res.status(500).json({ message: "Error sharing document" });
  }
});

// Start the server
app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
