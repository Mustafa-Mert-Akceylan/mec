const mongoose = require("mongoose");
const schema = new mongoose.Schema({
  formsahipid: String,
  formsahip:String,
  ytsayı:String,
  ytsunucu:String,
  özgecmis:String,
  neden:String,
  sonmesaj:String,
  formdurum:String,
  aktifsüre:String

});
module.exports = mongoose.model("yf", schema);
