const mongoose = require("mongoose");

const bdfdmodSchema = new mongoose.Schema({
  kodisim: {
    type: String,
    required: true
  },
  kodac: {
    type: String,
    required: true
  },
  sahip: {
    type: String,
    required: true
  },
  prefix: {
    type: String,
    required: true
  },
  sahipid: {
    type: String,
    required: true
  },
  sahipfoto: {
    type: String,
    required: true
  },
  code: {
    type: String,
    required: true
  }
});

const bdfdmod = mongoose.model("bdfdmod", bdfdmodSchema);

module.exports = bdfdmod;
