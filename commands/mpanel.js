const discord = require("discord.js");
const mcoin = require("../database/models/market-coin.js");
const mpanel = require("../database/models/market-panel.js");
const market = require("../database/models/market.js");
module.exports.config = {
  name:`panel`,
  aliases: ["p"],
  code: async (client, message, args ,req) => {
    let c = await mpanel.findOne({
        userID: message.author.id
      });
        let mc = await mcoin.findOne({
        userID: message.author.id
      });
    
    let m = await market.findOne({
      userID:c.userID
    })
    
    
      if(!mc)return message.channel.send(
          new discord.MessageEmbed()
            .setColor("RED")
            .setAuthor(
              message.author.username,
              message.author.avatarURL({ dynamic: true })
            )
        .setTitle(` Sistem bilgisi bulunamadı`)
        .setDescription(`sistemde bilgilerini bulamadım **+cüzdan** yaz ve tekrar dene`)
         .setTimestamp()
       )
    
       if(!c)return message.channel.send(
          new discord.MessageEmbed()
            .setColor("RED")
            .setAuthor(
              message.author.username,
              message.author.avatarURL({ dynamic: true })
            )
        .setTitle(` Sistem bilgisi bulunamadı`)
        .setDescription(`sistemde bilgilerini bulamadım **+panel-kur** yaz hesabını oluştur`)
         .setTimestamp()
       )
      
      if(c){
         message.channel.send(
      new discord.MessageEmbed()
      .setColor('#0099ff')
      .setTitle("Panel")
      .setDescription(`2 aşamalı doğrulama durumu :**${c.twouveryf}**`)
      .addFields(
    
      { name: 'Aktif satışların', value:`${m._id}`, inline: true },  
      { name: '\u200B', value: '\u200B' },

      )
  
      .setTimestamp()
    )
    
      }
  }

};




