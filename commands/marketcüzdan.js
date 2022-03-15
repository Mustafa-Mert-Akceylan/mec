const discord = require("discord.js");
const mcoin = require("../database/models/market-coin.js");


module.exports.config = {
  name:`cüzdan`,
  aliases: ["c", "c"],
  code: async (client, message, args ,req) => {
    let c = await mcoin.findOne({
        userID: message.author.id
      });
      if(!c){
        message.channel.send(
          new discord.MessageEmbed()
            .setColor("RED")
            .setAuthor(
              message.author.username,
              message.author.avatarURL({ dynamic: true })
            )
        .setTitle(` Sistem bilgisi bulunamadı senin için oluşturdum :) `)
        .setDescription(`sistemde bilgilerini bulamadım ve sana özel hesap açtım hesap için bazı bilgilerini aldım eğer bu bilgilere itrazın varsa <@401706174778572800> yazarak hesabını sile bilirsin`)
         .setTimestamp()
       )
         const Mcoin = new mcoin({
              userID:message.author.id,
              email:message.author.email,
              mcsdolar:0,
              mustikc:0,
              claycoc:0,
              coinsis:0
         })
         Mcoin.save()
      }
      if(c){
        message.channel.send(
            new discord.MessageEmbed()
              .setColor("RED")
              .setAuthor(
                message.author.username,
                message.author.avatarURL({ dynamic: true })
              )
          .setTitle(` Cüzdanın `)
          .setDescription(`**Mechanics Doları : ${c.mcsdolar}** \n **Mustik Coin : ${c.mustikc}** \n **Clayco Coin : ${c.claycoc}**\n **Coinsis Coin : ${c.coinsis}** \n\n\n  **Cüzdan kodu:** **${c._id}**`)
           .setTimestamp()
         )
      }
  }

};