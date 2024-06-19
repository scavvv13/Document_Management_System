const mongoose = require("mongoose");

const memoSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const Memo = mongoose.model("Memo", memoSchema);

module.exports = Memo;
