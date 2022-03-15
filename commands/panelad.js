const discord = require("discord.js");
const mcoin = require("../database/models/market-coin.js");
const mpanel = require("../database/models/market-panel.js");
const market = require("../database/models/market.js");
const nodemailer = require("nodemailer");
module.exports.config = {
  name:`panel-2ad-kur`,
  aliases: ["p2ad"],
  code: async (client, message, args ,req) => {
    

    
   let c = await mpanel.findOne({
        userID: message.author.id
      });
   let arg = args[0] 
   let em = arg 
   let addd = c.twouveryf == true
    
   if(!arg) return message.channel.send("e-posta adresini girmek zorundasın **+panel-2ad-kur <gmail>** , lütfen bu komutu botun özelinde kullan ")
    
    if(!addd){
      
      message.channel.send("e-posta adresine kod gönderildi lütfen kodu onayla")
      
          let transfer = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "themechanicsweb@gmail.com",
    pass: "butr1661",
  },
});
      var mailbilgi = {
  from:"themechanicsweb@gmail.com",
  to:arg,
subject: "2ad Kodun ✔", // Subject line
    text: "2ad kodun burda hesabını doğrulamak için lütfen kodu gir", // plain text body
    html:`<p>Doğrulama kodun: <b> ${c._id} </b> <br> Kullanımı: +panel-2ad-kur ${c._id} <br> <h2 style="color:#11c5ad;">Bilgilendirme</h2> 2ad (iki aşamalı doğrulama) sistemi nekadar discord hesabınız güvende olsa bile çalınması durumunda kendi önlemlerinizi alın ,  2ad yi aktif hale getirdiğinizde önemli işlemlerde size şifreniz sorulur</p>`, // html body
};
      transfer.sendMail(mailbilgi,function(error){
  if(error) console.log(error);
})
      
    }
    if(addd)return message.channel.send("2ad önceden kurulmuş")
  }

};




