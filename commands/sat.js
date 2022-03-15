const discord = require("discord.js");
const mts = require("../database/models/market.js");
const is = require("../database/models/islem.js");
const mcoin = require("../database/models/market-coin.js");
module.exports.config = {
  name:`sat`,
  aliases: ["s", "s"],
  code: async (client, message, args ,req) => {
    const target = args[0]
    const esyaid = args[1]

    
 
    let u = await mcoin.findOne({
        userID: message.author.id
      });
    let t = await mcoin.findOne({
        userID: target
      });
      let c = await mts.findOne({
        _id: esyaid
      });

   

     // error 
     if(!target) return message.channel.send("Satış yapıcağınız kullanıcı id sini girin ** !sat <müşteri id> <eşya id>**")
      if(!esyaid) return message.channel.send("Lütfen satmak istediğiniz ürünün ID sini girin ** !sat <müşteri id> <eşya id>**")
      if(!u) return   message.channnel.send(`${message.author.id} coin sisteminde sizinle ilgili bir veri bulamadım lütfen hesabınızın olup olmadığını kontrol etmek içib **!cüzdan** yazın`)
      if(!t) return   message.channel.send(`${target}Bu ID ye sahip kullanıcı sistemde bulunamadı.`)
      if(!c) return  message.channel.send(`${esyaid} id ye sahip bir eşya bulamadım lütfen eşyanızı kontrol edin`)
     // error bitti  
      
    message.channel.send(
      new discord.MessageEmbed()
      .setColor('#0099ff')
      .setTitle("Satış işlemi başlatıldı...")
      .setDescription(`**<@${u.userID}>** satıcı **${c._id}** id li eşyayı satma işlemi başlattı`)
      .addFields(
      { name: 'Satıcı', value:`<@${u.userID}>`, inline: true },
      { name: 'Müşteri', value:`<@${t.userID}>`, inline: true },
      { name: 'Eşya', value:`${c._id}`, inline: true },  
      { name: '\u200B', value: '\u200B' },
      { name:"Bekleniyor....", value:`<@${t.userID}> işlemi kabul etmesi bekleniyor`, inline: true },
      { name:"Eşya fiyat", value:`${c.fiyat} Mechanics Doları`, inline: true },
      { name:"Kabul işlemi", value:`+kabul ${t.userID} `, inline: true },
      )
  
      .setTimestamp()
    )
    
    
        const İS = new is({
        userID:message.author.id,
        targetID:t.userID,
        esyaID:c._id,
        fiyat:c.fiyat,
          
   })
   İS.save()


  }

};