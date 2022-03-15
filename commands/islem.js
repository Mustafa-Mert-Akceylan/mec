const discord = require("discord.js");
const mts = require("../database/models/market.js");
const is = require("../database/models/islem.js");
const mcoin = require("../database/models/market-coin.js");
module.exports.config = {
  name:`kabul`,
  aliases: ["kabul"],
  code: async (client, message, args ,req) => {
    const onaykod = args[0]
    const onaytrue = onaykod == message.author.id
    
 

    let o = await is.findOne({
        targetID: onaykod
      });


   

     // error 
    if(!onaytrue) return message.channel.send("Bu işlemi sadece müşteri kabul ede bilir")
    if(!o) return message.channel.send("İşlem onay kodu bulunamadı")

     // error bitti  
      
    message.channel.send(
      new discord.MessageEmbed()
      .setColor('#0099ff')
      .setTitle("Satış işlemi Tamamlandı...")
      .setDescription(`Önceden açılan satış işlemi müşteri tarafından onaylandı , işlem bittiği için kapatıldı`)
      .addFields(
      { name:"Satıcı", value:`<@${o.userID}>`, inline: true },
      { name:"Target", value:`<@${o.targetID}>`, inline: true },
      { name: '\u200B', value: '\u200B' },
      { name:"Eşya ID", value:`${o.esyaID}`, inline: true },
      { name:"Fiyat", value:`${o.fiyat}`, inline: true },
        


      )
  
      .setTimestamp()
    )
    



  }

};