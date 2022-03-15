const mongoose = require("mongoose");
let hm = new mongoose.Schema({
userID: String,
biography: {type: String, default: null},
website: {type: String, default: null},
github: {type: String, default: null},
twitter: {type: String, default: null},
instagram: {type: String, default: null},
webcoin: {type: Number, default: 0 },
maas: {type: Boolean, default: null},
pre: {type: Boolean, default: null},
formbaslık: {type: String, default: null},
formaçıklama: {type: String, default: null},
formkategori: {type: String, default: null},
serverinfoID:{type: String, default: null},
serverinfoAvatar:{type: String, default: null},
serverinfoName:{type: String, default: null},
serverinfoOwner:{type: String, default: null},
serverSituation:{type: String, default: null},
yarismabotıd:{type: String, default: null},
yarismajoin:{type: Boolean, default: null},
yarismakontrol:{type: Boolean, default: null},
yarismapuan:{type: Number, default: null},
  
});


module.exports = mongoose.model("profiles", hm);