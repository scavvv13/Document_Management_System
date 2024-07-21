const mongoose = require("mongoose");

const documentSchema = new mongoose.Schema({
  filename: String,
  originalname: String,
  contentType: String,
  size: Number,
  path: String,
  previewImageUrl: String,
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  createdAt: { type: Date, default: Date.now },
  sharedWith: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  folderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Folder",
    default: null,
  },
});

const Document = mongoose.model("Document", documentSchema);

module.exports = Document;
