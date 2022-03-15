const mongoose = require("mongoose");
const schema = new mongoose.Schema({
  botID: String,
});
module.exports = mongoose.model("sds", schema);
