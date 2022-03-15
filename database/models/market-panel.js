const mongoose = require("mongoose");
let mpanel = new mongoose.Schema({
userID: String,
email:String,
pasword:String,
twouveryf:Boolean,
});


module.exports = mongoose.model("mpanel", mpanel);