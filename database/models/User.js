const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  discordId: {
    type: String,
    required: true,
    unique: true
  },
  discordTag: {
    type: String,
    required: true,
    unique: true
  },
  avatar: {
    type: String,
    required: true
  },
  includedGuilds: {
    type: Array,
    required: true
  },
  excludedGuilds: {
    type: Array,
    require: true
  },
  email: {
    type: String,
    unique: true,
    required: true
  }
});

module.exports = mongoose.model("User", UserSchema);
