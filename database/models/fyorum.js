
const mongoose = require('mongoose');

const yorumSchema = new mongoose.Schema({
  yorumid: {
    type: String,
    required: true,
  }

 
});

const yorum = mongoose.model('yorum', yorumSchema);

module.exports = yorum;
 
