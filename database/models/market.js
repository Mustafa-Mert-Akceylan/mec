const mongoose = require("mongoose");
let market = new mongoose.Schema({
userID: String,
fiyat:{type: Number, default: null},

  
});


module.exports = mongoose.model("market", market);