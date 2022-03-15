const discord = require("discord.js");
const mcoin = require("../database/models/market-coin.js");
const mpanel = require("../database/models/market-panel.js");
module.exports.config = {
  name:`panel-kur`,
  aliases: ["pk"],
  code: async (client, message, args ,req) => {
    let c = await mpanel.findOne({
        userID: message.author.id
      });
    if(c) return message.channel.send("Zaten panele sahipsin")
    
    
    if(!c){
      message.channel.send("Panel kuruldu **+panel** komutunu kullana bilirsin")
      
          const Mpanel = new mpanel({
        userID:message.author.id,
        email:"bos",
        twouveryf:false,
        pasword:"bos"
   })
   Mpanel.save()
    }
  }

};