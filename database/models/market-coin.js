const mongoose = require("mongoose");
let coin = new mongoose.Schema({
userID: String,
email:String,
mcsdolar:{type: Number, default: null},
mustikc:{type: Number, default: null},
claycoc:{type: Number, default: null},
coinsis:{type: Number, default: null},



  
});


module.exports = mongoose.model("mcsdolar", coin);