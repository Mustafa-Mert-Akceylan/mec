const discord = require("discord.js");
const config = require("../../config.js");
const roles = config.server.roles;
module.exports.config = {
  name:`yardım`,
  aliases: ["y", "y"],
  code: async (client, message, args ,req) => {
  message.channel.send("Sistem yapım aşamasında...")
  }

};