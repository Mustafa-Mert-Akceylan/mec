const mongoose = require('mongoose');

const testcodeSchema = new mongoose.Schema({
dil: {
    type: String,
    required: true
  },
   kod: {
    type: String,
    required: true
  },
  sahip: {
    type: String,
    required: true
  },
    sahip: {
    type: String,
    required: true
  },
   longDesc: {
    type: String,
    required: true
  },
   code: {
    type: String,
    required: true
  },
    altyapı: {
    type: String,
    required: false
  },
 
});

const testcode = mongoose.model('testcode', testcodeSchema);

module.exports = testcode;
