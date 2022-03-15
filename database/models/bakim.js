const mongoose = require("mongoose");

const bakimSchema = new mongoose.Schema({
  bakımmod: {
    type: String,
    required: true,
    unique: true
  }
});

module.exports = mongoose.model("bakim", bakimSchema);
