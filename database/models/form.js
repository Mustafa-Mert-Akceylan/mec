
const mongoose = require('mongoose');

const formSchema = new mongoose.Schema({
formsahip: {
    type: String,
    required: true
  },
  formsahipid: {
    type: String,
    required: true
  },
   formbaslık: {
    type: String,
    required: true
  },
    formaçıklama: {
    type: String,
    required: true
  },
  formkategori: {
    type: String,
    required: true
  },

 
});

const form = mongoose.model('form', formSchema);

module.exports = form;
