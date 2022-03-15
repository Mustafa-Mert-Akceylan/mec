const mongoose = require("mongoose");
let islem = new mongoose.Schema({
userID: String,
targetID:String,
esyaID:String,
fiyat:{type: Number, default: null},

  
});


module.exports = mongoose.model("islem", islem);