const mongoose = require("mongoose");

const bdfdeglenceSchema = new mongoose.Schema({
  kodisim: {
    type: String,
    required: true
  },
  kodac: {
    type: String,
    required: true
  },
  prefix: {
    type: String,
    required: true
  },
  sahip: {
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

const bdfdeglence = mongoose.model("bdfdeglence", bdfdeglenceSchema);

module.exports = bdfdeglence;
