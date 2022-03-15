const discord = require("discord.js");
const mts = require("../database/models/market.js");
module.exports.config = {
  name:`adadmintest`,
  aliases: ["t", "t"],
  code: async (client, message, args ,req) => {
    const Mts = new mts({
        userID:message.author.id,
        fiyat:args[0]
   })
   Mts.save()
  }

};