const mongoose = require("mongoose");

const documentSchema = new mongoose.Schema({
  filename: String,
  originalname: String,
  contentType: String,
  size: Number,
  path: String,
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  createdAt: { type: Date, default: Date.now }, // Add createdAt field
});

const Document = mongoose.model("Document", documentSchema);

module.exports = Document;
