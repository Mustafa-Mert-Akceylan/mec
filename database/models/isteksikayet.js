const mongoose = require('mongoose');

const sıkSchema = new mongoose.Schema({
id: {
    type: String,
    required: true
  },
 acıklama: {
    type: String,
    required: true
  },
   türü: {
    type: String,
    required: true
  },
   nedeni: {
    type: String,
    required: true
  }
  

});

const sık = mongoose.model('sık', sıkSchema);

module.exports = sık;

