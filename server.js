const url = require("url");
const path = require("path");
const express = require("express");
const passport = require("passport");
const session = require("express-session");
const rateLimit = require("express-rate-limit");
const Strategy = require("passport-discord").Strategy;
const ejs = require("ejs");
const bodyParser = require("body-parser");
const { Intents, Discord, discord } = require("discord.js");
const config = require("../config.js");
const roles = config.server.roles;
const channels = config.server.channels;
const app = express();
const MemoryStore = require("memorystore")(session);
const fetch = require("node-fetch");
const cookieParser = require("cookie-parser");
const referrerPolicy = require("referrer-policy");
const methodOverride = require("method-override");
const nodemailer = require("nodemailer");

//mail sistemine ellemeyin
let transfer = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "themechanicsweb@gmail.com",
    pass: "$xXx==ThEmecHaniCs==xXX$<html>using.Windows.System//#/**<!---->",
  },
});

app.use(
  referrerPolicy({
    policy: "strict-origin",
  })
);
// MODELS
const botsdata = require("./database/models/botlist/bots.js");
const voteSchema = require("./database/models/botlist/vote.js");
const codesSchema = require("./database/models/codes.js");
const uptimeSchema = require("./database/models/uptime.js");
const banSchema = require("./database/models/site-ban.js");
const maintenceSchema = require("./database/models/bakim.js");
const testcode = require("./database/models/testcode.js");
const prof = require("./database/models/profile.js");
const bdfdmod = require("./database/models/bdfdmod.js");
const bdfdekonomi = require("./database/models/bdfdekonomi.js");
const bdfdeglence = require("./database/models/bdfdeğlence.js");
const ısk = require("./database/models/isteksikayet.js");
const form = require("./database/models/form.js");
const yorum = require("./database/models/fyorum.js");
const bakim = require("./database/models/bakim.js");
const euser = require("./database/models/egitimuser.js");
const server = require("./database/models/server.js");
const patlat = require("./database/models/botlist/patlat.js");
const market = require("./database/models/market.js");
const islem = require("./database/models/islem.js");
const mc = require("./database/models/market-coin.js");
const mpanel = require("./database/models/market-panel.js");

//nodemailer mail tanımlama

app.use(methodOverride("X-HTTP-Method-Override"));
app.use(methodOverride("_method"));

module.exports = async (client) => {
  const templateDir = path.resolve(`${process.cwd()}${path.sep}src/views`);
  app.use(
    "/css",
    express.static(path.resolve(`${templateDir}${path.sep}assets/css`))
  );
  app.use(
    "/js",
    express.static(path.resolve(`${templateDir}${path.sep}assets/js`))
  );
  app.use(
    "/img",
    express.static(path.resolve(`${templateDir}${path.sep}assets/img`))
  );

  passport.serializeUser((user, done) => done(null, user));
  passport.deserializeUser((obj, done) => done(null, obj));

  passport.use(
    new Strategy(
      {
        clientID: config.website.clientID,
        clientSecret: config.website.secret,
        callbackURL: config.website.callback,
        scope: ["identify", "guilds", "guilds.join"],
      },
      (accessToken, refreshToken, profile, done) => {
        process.nextTick(() => done(null, profile));
      }
    )
  );

  app.use(
    session({
      store: new MemoryStore({
        checkPeriod: 86400000,
      }),
      secret:
        "#@%#&^$^$%@$^$&%#$%@#$%$^%&$%^#$%@#$%#E%#%@$FEErfgr3g#%GT%536c53cc6%5%tv%4y4hrgrggrgrgf4n",
      resave: false,
      saveUninitialized: false,
    })
  );

  app.use(passport.initialize());
  app.use(passport.session());

  app.engine("html", ejs.renderFile);
  app.set("view engine", "html");

  app.use(bodyParser.json());
  app.use(
    bodyParser.urlencoded({
      extended: true,
    })
  );

  const apiRequestLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 30, // limit each IP to 2 requests per windowMs
    handler: function (req, res /*next*/) {
      return res
        .status(429)
        .send(
          "Siteye çok fazla kişi giriş yaptı lütfen azalmasını bekleyin  max user:100"
        );
    },
  });
  //app.use(apiRequestLimiter);

  const renderTemplate = (res, req, template, data = {}) => {
    const baseData = {
      bot: client,
      path: req.path,
      _token: req.session["_token"],
      user: req.isAuthenticated() ? req.user : null,
    };
      res.render(
        path.resolve(`${templateDir}${path.sep}${template}`),
        Object.assign(baseData, data)
      );
    
  };

  const checkAuth = (req, res, next) => {
    if (req.isAuthenticated()) return next();
    req.session.backURL = req.url;
    res.redirect("/login");
  };
  const checkMaintence = async (req, res, next) => {
    const d = await maintenceSchema.findOne({
      server: config.server.id,
    });
    if (d) {
      if (req.isAuthenticated()) {
        let usercheck = client.guilds.cache
          .get(config.server.id)
          .members.cache.get(req.user.id)
          .members.cache.get(req.user.email);
        if (usercheck) {
          if (usercheck.roles.cache.get(roles.yonetici)) {
            next();
          } else {
            res.redirect("/hata?kodu=031&mesaj=Site bakımda kardeşim.");
          }
        } else {
          res.redirect("/hata?kodu=031&mesaj=Site bakımda kardeşim");
        }
      } else {
        res.redirect("/hata?kodu=031&mesaj=Site bakımda kardeşim");
      }
    } else {
      next();
    }
  };

  function generateRandom(length) {
    var result = [];
    var characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
      result.push(
        characters.charAt(Math.floor(Math.random() * charactersLength))
      );
    }
    return result.join("");
  }

  app.get(
    "/login",
    (req, res, next) => {
      if (req.session.backURL) {
        req.session.backURL = req.session.backURL;
      } else if (req.headers.referer) {
        const parsed = url.parse(req.headers.referer);
        if (parsed.hostname === app.locals.domain) {
          req.session.backURL = parsed.path;
        }
      } else {
        res.redirect("https://themechanics-web.glitch.me/");
      }
      next();
    },
    passport.authenticate("discord", /*oto auth*/ { prompt: "none" })
  );
  app.get(
    "/callback",
    passport.authenticate("discord", {
      failureRedirect:
        "/error?code=999&message=We encountered an error while connecting.",
    }),
    async (req, res) => {
      let banned = await banSchema.findOne({
        user: req.user.id,
      });

      if (banned) {
        client.users.fetch(req.user.id).then(async (a) => {
          client.channels.cache.get(channels.login).send(
            new Discord.MessageEmbed()
              .setAuthor(
                a.username,
                a.avatarURL({
                  dynamic: true,
                })
              )
              .setThumbnail(
                a.avatarURL({
                  dynamic: true,
                })
              )
              .setColor("RED")
              .setDescription(
                `[**${a.username}**#${a.discriminator}](https://themechanics-web.glitch.me//user/${a.id}) isimli kullanıcı **siteye** giriş yapmaya çalıştı fakat siteden engellendiği için giriş yapamadı.`
              )
              .addField("Kullanıcı Adı", a.username)
              .addField("Kullanıcı Etiket", a.discriminator)
              .addField("Discord Kimliği", a.id)
          );
        });
        req.session.destroy(() => {
          res.json({
            login: false,
            message: "Hey Sanırım Siteden Banlısın",
            logout: true,
          });
          req.logout();
        });
      } else {
        try {
          const request = require("request");
          request({
            url: `https://discordapp.com/api/v8/guilds/${config.server.id}/members/${req.user.id}`,
            method: "PUT",
            json: {
              access_token: req.user.accessToken,
            },
            headers: {
              Authorization: `Bot ${client.token}`,
            },
          });
        } catch {}
        res.redirect(req.session.backURL || "/");
        client.users.fetch(req.user.id).then(async (a) => {});
      }
    }
  );
  app.get("/logout", function (req, res) {
    req.session.destroy(() => {
      req.logout();
      res.redirect("/");
    });
  });

  const http = require("http").createServer(app);
  const io = require("socket.io")(http);
  io.on("connection", (socket) => {
    io.emit("userCount", io.engine.clientsCount);
  });
  http.listen(3000);

  //------------------- EXTRA -------------------//
  app.get("/test", checkMaintence, async (req, res) => {
    const botdata = await botsdata.find();
    const patlats = await patlat.find().sort({ Date: -1 });
    const bakimmod = await bakim.findOne({ bakımmod: "aktif" });
    if (bakimmod) {
      renderTemplate(res, req, "404/bakım.ejs", {
        config,
        roles,
        botdata,
        getuser,
      });
    }

    renderTemplate(res, req, "test.ejs", {
      config,
      roles,
      botdata,
      getuser,
      bakim,
      patlats,
    });
  });

  app.get("/", checkMaintence, async (req, res) => {
    const botdata = await botsdata.find();
    const patlats = await patlat.find().sort({ Date: -1 });
    const bakimmod = await bakim.findOne({ bakımmod: "aktif" });
    if (bakimmod) {
      renderTemplate(res, req, "404/bakım.ejs", {
        config,
        roles,
        botdata,
        getuser,
      });
    }
    //ip logger aşağıda
    //console.log(req.headers["x-forwarded-for"].split(",")[0]);
    renderTemplate(res, req, "index.ejs", {
      config,
      roles,
      botdata,
      getuser,
      bakim,
      patlats,
    });
  });
  app.get("/yarisma", checkMaintence, async (req, res) => {
    console.log(req.headers["x-forwarded-for"].split(",")[0]);
    const botdata = await botsdata.find();
    const patlats = await patlat.find().sort({ Date: -1 });
    const bakimmod = await bakim.findOne({ bakımmod: "aktif" });
    if (bakimmod) {
      renderTemplate(res, req, "404/bakım.ejs", {
        config,
        roles,
        botdata,
        getuser,
      });
    }

    renderTemplate(res, req, "yarisma/index.ejs", {
      config,
      roles,
      botdata,
      getuser,
      bakim,
      patlats,
    });
  });

  app.post("/yarisma/join", checkMaintence, checkAuth, async (req, res) => {
    const pdata = await profiledata.findOne({
      userID: req.user.id,
    });

    if (pdata.yarismajoin == true) {
      res.send("Daha önceden katılmışsın , sadece birkez katıla bilirsin");
    } else {
      await profiledata.findOneAndUpdate(
        { userID: req.user.id },
        { yarismabotıd: req.body.ID }
      );
      await profiledata.findOneAndUpdate(
        { userID: req.user.id },
        { yarismajoin: true }
      );
      await profiledata.findOneAndUpdate(
        { userID: req.user.id },
        { yarismapuan: 0 }
      );
      await profiledata.findOneAndUpdate(
        { userID: req.user.id },
       { yarismakontrol: false }
      );
      res.redirect("/");
    }
  });

  app.get("/forum", checkMaintence, async (req, res) => {
    console.log(req.headers["x-forwarded-for"].split(",")[0]);
    const botdata = await botsdata.find();
    renderTemplate(res, req, "./form/index.ejs", {
      config,
      roles,
      botdata,
      getuser,
      bakim,
    });
  });

  app.get("/anilar", checkMaintence, async (req, res) => {
    console.log(req.headers["x-forwarded-for"].split(",")[0]);
    const botdata = await botsdata.find();
    const patlats = await patlat.find().sort({ Date: -1 });
    const bakimmod = await bakim.findOne({ bakımmod: "aktif" });
    if (bakimmod) {
      renderTemplate(res, req, "404/bakım.ejs", {
        config,
        roles,
        botdata,
        getuser,
      });
    }

    renderTemplate(res, req, "anılar.ejs", {
      config,
      roles,
      botdata,
      getuser,
      bakim,
      patlats,
    });
  });

  app.get(
    "/webcoin/:userID/edit",
    checkMaintence,
    checkAuth,
    async (req, res) => {
      console.log(req.headers["x-forwarded-for"].split(",")[0]);
      client.users.fetch(req.user.id).then(async (member) => {
        const pdata = await profiledata.findOne({
          userID: member.id,
        });
        renderTemplate(res, req, "profile/cüzdan.ejs", {
          member,
          req,
          roles,
          config,
          pdata,
          member,
          form,
        });
      });
    }
  );

  app.post(
    "/premium/:userID/add",
    checkMaintence,
    checkAuth,
    async (req, res) => {
      const pdata = await profiledata.findOne({
        userID: req.user.id,
      });
      let rBody = req.body;
      if (pdata.webcoin > 3000) {
        await profiledata.findOneAndUpdate(
          { userID: req.user.id },
          { pre: true }
        );
        await profiledata.findOneAndUpdate(
          { userID: req.user.id },
          { $inc: { webcoin: -3000 } }
        );
        res.redirect(
          `/user/${req.user.id}/?success=true&message=Satın alım işlemi başarılı bilgiler dc özele gönderildi.`
        );

        client.users.cache.get(req.user.id).send(
          new discord.MessageEmbed()
            .setColor("#0099ff")
            .addFields(
              {
                name: "Satın alan kullanıcı",
                value: `${req.user.id}`,
                inline: true,
              },
              { name: "\u200B", value: "\u200B" },
              { name: "Tutar", value: `3000`, inline: true },
              {
                name: "Güncel Mechanics Doların",
                value: pdata.webcoin - 3000,
                inline: true,
              }
            )
            .setTimestamp()
        );
      }

      if (pdata.webcoin <= 3000) {
        const pdata = await profiledata.findOne({
          userID: req.user.id,
        });
        res.redirect(
          `/user/${req.user.id}/?error=true&message=Üzgünüm bakiyen yetersiz.`
        );
      }
    }
  );

  app.post(
    "/maas/:userID/edit",
    checkMaintence,
    checkAuth,
    async (req, res) => {
      client.users.fetch(req.user.id).then(async (member) => {
        const pdata = await profiledata.findOne({
          userID: member.id,
        });
        let cacheServer = client.guilds.cache
          .get(config.server.id)
          .members.cache.get(member.id);
        if (pdata.maas == false) {
          if (cacheServer) {
            let bughunter = cacheServer.roles.cache.get(
              roles.profile.bughunter
            );
            let p1 = cacheServer.roles.cache.get(roles.profile.p1);
            let p2 = cacheServer.roles.cache.get(roles.profile.p2);
            let p25 = cacheServer.roles.cache.get(roles.profile.p25);
            let p3 = cacheServer.roles.cache.get(roles.profile.p3);
            let p4 = cacheServer.roles.cache.get(roles.profile.p4);

            const pdata = await profiledata.findOne({
              userID: member.id,
            });
            res.redirect("/webcoin/:userID/edit");
          }

          if (cacheServer) {
            let bughunter = cacheServer.roles.cache.get(
              roles.profile.bughunter
            );
            let p1 = cacheServer.roles.cache.get(roles.profile.p1);
            let p2 = cacheServer.roles.cache.get(roles.profile.p2);
            let p25 = cacheServer.roles.cache.get(roles.profile.p25);
            let p3 = cacheServer.roles.cache.get(roles.profile.p3);
            let p4 = cacheServer.roles.cache.get(roles.profile.p4);

            if (pdata.webcoin < 3000) {
              if (p1) {
                await profiledata.findOneAndUpdate(
                  { userID: member.id },
                  { $inc: { webcoin: +7000 } }
                );
              } else if (p2) {
                await profiledata.findOneAndUpdate(
                  { userID: member.id },
                  { $inc: { webcoin: +6000 } }
                );
              } else if (p25) {
                await profiledata.findOneAndUpdate(
                  { userID: member.id },
                  { $inc: { webcoin: +5200 } }
                );
              } else if (p3) {
                await profiledata.findOneAndUpdate(
                  { userID: member.id },
                  { $inc: { webcoin: +5000 } }
                );
              } else if (p4) {
                await profiledata.findOneAndUpdate(
                  { userID: member.id },
                  { $inc: { webcoin: +4500 } }
                );
              }
              if (bughunter) {
                await profiledata.findOneAndUpdate(
                  { userID: member.id },
                  { $inc: { webcoin: +650 } }
                );
              }

              await profiledata.findOneAndUpdate(
                { userID: member.id },
                { $inc: { webcoin: +2000 } }
              );
              await profiledata.findOneAndUpdate(
                { userID: member.id },
                { maas: true }
              );
            } else if (pdata.webcoin <= 4000) {
              if (p1) {
                await profiledata.findOneAndUpdate(
                  { userID: member.id },
                  { $inc: { webcoin: +7000 } }
                );
              } else if (p2) {
                await profiledata.findOneAndUpdate(
                  { userID: member.id },
                  { $inc: { webcoin: +6000 } }
                );
              } else if (p25) {
                await profiledata.findOneAndUpdate(
                  { userID: member.id },
                  { $inc: { webcoin: +5200 } }
                );
              } else if (p3) {
                await profiledata.findOneAndUpdate(
                  { userID: member.id },
                  { $inc: { webcoin: +5000 } }
                );
              } else if (p4) {
                await profiledata.findOneAndUpdate(
                  { userID: member.id },
                  { $inc: { webcoin: +4500 } }
                );
              }
              if (bughunter) {
                await profiledata.findOneAndUpdate(
                  { userID: member.id },
                  { $inc: { webcoin: +650 } }
                );
              }

              await profiledata.findOneAndUpdate(
                { userID: member.id },
                { $inc: { webcoin: +2000 } }
              );
              await profiledata.findOneAndUpdate(
                { userID: member.id },
                { maas: true }
              );
              await profiledata.findOneAndUpdate(
                { userID: member.id },
                { $inc: { webcoin: -500 } }
              );
            } else if (pdata.webcoin <= 5000) {
              if (p1) {
                await profiledata.findOneAndUpdate(
                  { userID: member.id },
                  { $inc: { webcoin: +7000 } }
                );
              } else if (p2) {
                await profiledata.findOneAndUpdate(
                  { userID: member.id },
                  { $inc: { webcoin: +6000 } }
                );
              } else if (p25) {
                await profiledata.findOneAndUpdate(
                  { userID: member.id },
                  { $inc: { webcoin: +5200 } }
                );
              } else if (p3) {
                await profiledata.findOneAndUpdate(
                  { userID: member.id },
                  { $inc: { webcoin: +5000 } }
                );
              } else if (p4) {
                await profiledata.findOneAndUpdate(
                  { userID: member.id },
                  { $inc: { webcoin: +4500 } }
                );
              }
              if (bughunter) {
                await profiledata.findOneAndUpdate(
                  { userID: member.id },
                  { $inc: { webcoin: +650 } }
                );
              }

              await profiledata.findOneAndUpdate(
                { userID: member.id },
                { $inc: { webcoin: +2000 } }
              );
              await profiledata.findOneAndUpdate(
                { userID: member.id },
                { maas: true }
              );
              await profiledata.findOneAndUpdate(
                { userID: member.id },
                { $inc: { webcoin: -750 } }
              );
            } else if (pdata.webcoin <= 6000) {
              if (p1) {
                await profiledata.findOneAndUpdate(
                  { userID: member.id },
                  { $inc: { webcoin: +7000 } }
                );
              } else if (p2) {
                await profiledata.findOneAndUpdate(
                  { userID: member.id },
                  { $inc: { webcoin: +6000 } }
                );
              } else if (p25) {
                await profiledata.findOneAndUpdate(
                  { userID: member.id },
                  { $inc: { webcoin: +5200 } }
                );
              } else if (p3) {
                await profiledata.findOneAndUpdate(
                  { userID: member.id },
                  { $inc: { webcoin: +5000 } }
                );
              } else if (p4) {
                await profiledata.findOneAndUpdate(
                  { userID: member.id },
                  { $inc: { webcoin: +4500 } }
                );
              }
              if (bughunter) {
                await profiledata.findOneAndUpdate(
                  { userID: member.id },
                  { $inc: { webcoin: +650 } }
                );
              }

              await profiledata.findOneAndUpdate(
                { userID: member.id },
                { $inc: { webcoin: +2000 } }
              );
              await profiledata.findOneAndUpdate(
                { userID: member.id },
                { maas: true }
              );
              await profiledata.findOneAndUpdate(
                { userID: member.id },
                { $inc: { webcoin: -1000 } }
              );
            } else if (pdata.webcoin <= 7000) {
              if (p1) {
                await profiledata.findOneAndUpdate(
                  { userID: member.id },
                  { $inc: { webcoin: +7000 } }
                );
              } else if (p2) {
                await profiledata.findOneAndUpdate(
                  { userID: member.id },
                  { $inc: { webcoin: +6000 } }
                );
              } else if (p25) {
                await profiledata.findOneAndUpdate(
                  { userID: member.id },
                  { $inc: { webcoin: +5200 } }
                );
              } else if (p3) {
                await profiledata.findOneAndUpdate(
                  { userID: member.id },
                  { $inc: { webcoin: +5000 } }
                );
              } else if (p4) {
                await profiledata.findOneAndUpdate(
                  { userID: member.id },
                  { $inc: { webcoin: +4500 } }
                );
              }
              if (bughunter) {
                await profiledata.findOneAndUpdate(
                  { userID: member.id },
                  { $inc: { webcoin: +650 } }
                );
              }

              await profiledata.findOneAndUpdate(
                { userID: member.id },
                { $inc: { webcoin: +2000 } }
              );
              await profiledata.findOneAndUpdate(
                { userID: member.id },
                { maas: true }
              );
              await profiledata.findOneAndUpdate(
                { userID: member.id },
                { $inc: { webcoin: -1250 } }
              );
            } else if (pdata.webcoin <= 8000) {
              if (p1) {
                await profiledata.findOneAndUpdate(
                  { userID: member.id },
                  { $inc: { webcoin: +7000 } }
                );
              } else if (p2) {
                await profiledata.findOneAndUpdate(
                  { userID: member.id },
                  { $inc: { webcoin: +6000 } }
                );
              } else if (p25) {
                await profiledata.findOneAndUpdate(
                  { userID: member.id },
                  { $inc: { webcoin: +5200 } }
                );
              } else if (p3) {
                await profiledata.findOneAndUpdate(
                  { userID: member.id },
                  { $inc: { webcoin: +5000 } }
                );
              } else if (p4) {
                await profiledata.findOneAndUpdate(
                  { userID: member.id },
                  { $inc: { webcoin: +4500 } }
                );
              }
              if (bughunter) {
                await profiledata.findOneAndUpdate(
                  { userID: member.id },
                  { $inc: { webcoin: +650 } }
                );
              }

              await profiledata.findOneAndUpdate(
                { userID: member.id },
                { $inc: { webcoin: +2000 } }
              );
              await profiledata.findOneAndUpdate(
                { userID: member.id },
                { maas: true }
              );
              await profiledata.findOneAndUpdate(
                { userID: member.id },
                { $inc: { webcoin: -1500 } }
              );
            } else if (pdata.webcoin <= 9000) {
              if (p1) {
                await profiledata.findOneAndUpdate(
                  { userID: member.id },
                  { $inc: { webcoin: +7000 } }
                );
              } else if (p2) {
                await profiledata.findOneAndUpdate(
                  { userID: member.id },
                  { $inc: { webcoin: +6000 } }
                );
              } else if (p25) {
                await profiledata.findOneAndUpdate(
                  { userID: member.id },
                  { $inc: { webcoin: +5200 } }
                );
              } else if (p3) {
                await profiledata.findOneAndUpdate(
                  { userID: member.id },
                  { $inc: { webcoin: +5000 } }
                );
              } else if (p4) {
                await profiledata.findOneAndUpdate(
                  { userID: member.id },
                  { $inc: { webcoin: +4500 } }
                );
              }
              if (bughunter) {
                await profiledata.findOneAndUpdate(
                  { userID: member.id },
                  { $inc: { webcoin: +650 } }
                );
              }

              await profiledata.findOneAndUpdate(
                { userID: member.id },
                { $inc: { webcoin: +2000 } }
              );
              await profiledata.findOneAndUpdate(
                { userID: member.id },
                { maas: true }
              );
              await profiledata.findOneAndUpdate(
                { userID: member.id },
                { $inc: { webcoin: -1750 } }
              );
            } else if (pdata.webcoin <= 10000) {
              if (p1) {
                await profiledata.findOneAndUpdate(
                  { userID: member.id },
                  { $inc: { webcoin: +7000 } }
                );
              } else if (p2) {
                await profiledata.findOneAndUpdate(
                  { userID: member.id },
                  { $inc: { webcoin: +6000 } }
                );
              } else if (p25) {
                await profiledata.findOneAndUpdate(
                  { userID: member.id },
                  { $inc: { webcoin: +5200 } }
                );
              } else if (p3) {
                await profiledata.findOneAndUpdate(
                  { userID: member.id },
                  { $inc: { webcoin: +5000 } }
                );
              } else if (p4) {
                await profiledata.findOneAndUpdate(
                  { userID: member.id },
                  { $inc: { webcoin: +4500 } }
                );
              }
              if (bughunter) {
                await profiledata.findOneAndUpdate(
                  { userID: member.id },
                  { $inc: { webcoin: +650 } }
                );
              }

              await profiledata.findOneAndUpdate(
                { userID: member.id },
                { $inc: { webcoin: +2000 } }
              );
              await profiledata.findOneAndUpdate(
                { userID: member.id },
                { maas: true }
              );
              await profiledata.findOneAndUpdate(
                { userID: member.id },
                { $inc: { webcoin: -2000 } }
              );
            } else if (pdata.webcoin <= 12000) {
              if (p1) {
                await profiledata.findOneAndUpdate(
                  { userID: member.id },
                  { $inc: { webcoin: +7000 } }
                );
              } else if (p2) {
                await profiledata.findOneAndUpdate(
                  { userID: member.id },
                  { $inc: { webcoin: +6000 } }
                );
              } else if (p25) {
                await profiledata.findOneAndUpdate(
                  { userID: member.id },
                  { $inc: { webcoin: +5200 } }
                );
              } else if (p3) {
                await profiledata.findOneAndUpdate(
                  { userID: member.id },
                  { $inc: { webcoin: +5000 } }
                );
              } else if (p4) {
                await profiledata.findOneAndUpdate(
                  { userID: member.id },
                  { $inc: { webcoin: +4500 } }
                );
              }
              if (bughunter) {
                await profiledata.findOneAndUpdate(
                  { userID: member.id },
                  { $inc: { webcoin: +650 } }
                );
              }

              await profiledata.findOneAndUpdate(
                { userID: member.id },
                { $inc: { webcoin: +2000 } }
              );
              await profiledata.findOneAndUpdate(
                { userID: member.id },
                { maas: true }
              );
              await profiledata.findOneAndUpdate(
                { userID: member.id },
                { $inc: { webcoin: -3000 } }
              );
            } else if (pdata.webcoin <= 15000) {
              if (p1) {
                await profiledata.findOneAndUpdate(
                  { userID: member.id },
                  { $inc: { webcoin: +7000 } }
                );
              } else if (p2) {
                await profiledata.findOneAndUpdate(
                  { userID: member.id },
                  { $inc: { webcoin: +6000 } }
                );
              } else if (p25) {
                await profiledata.findOneAndUpdate(
                  { userID: member.id },
                  { $inc: { webcoin: +5200 } }
                );
              } else if (p3) {
                await profiledata.findOneAndUpdate(
                  { userID: member.id },
                  { $inc: { webcoin: +5000 } }
                );
              } else if (p4) {
                await profiledata.findOneAndUpdate(
                  { userID: member.id },
                  { $inc: { webcoin: +4500 } }
                );
              }
              if (bughunter) {
                await profiledata.findOneAndUpdate(
                  { userID: member.id },
                  { $inc: { webcoin: +650 } }
                );
              }

              await profiledata.findOneAndUpdate(
                { userID: member.id },
                { $inc: { webcoin: +2000 } }
              );
              await profiledata.findOneAndUpdate(
                { userID: member.id },
                { maas: true }
              );
              await profiledata.findOneAndUpdate(
                { userID: member.id },
                { $inc: { webcoin: -4000 } }
              );
            } else if (pdata.webcoin <= 20000) {
              if (p1) {
                await profiledata.findOneAndUpdate(
                  { userID: member.id },
                  { $inc: { webcoin: +7000 } }
                );
              } else if (p2) {
                await profiledata.findOneAndUpdate(
                  { userID: member.id },
                  { $inc: { webcoin: +6000 } }
                );
              } else if (p25) {
                await profiledata.findOneAndUpdate(
                  { userID: member.id },
                  { $inc: { webcoin: +5200 } }
                );
              } else if (p3) {
                await profiledata.findOneAndUpdate(
                  { userID: member.id },
                  { $inc: { webcoin: +5000 } }
                );
              } else if (p4) {
                await profiledata.findOneAndUpdate(
                  { userID: member.id },
                  { $inc: { webcoin: +4500 } }
                );
              }
              if (bughunter) {
                await profiledata.findOneAndUpdate(
                  { userID: member.id },
                  { $inc: { webcoin: +650 } }
                );
              }

              await profiledata.findOneAndUpdate(
                { userID: member.id },
                { $inc: { webcoin: +2000 } }
              );
              await profiledata.findOneAndUpdate(
                { userID: member.id },
                { maas: true }
              );
              await profiledata.findOneAndUpdate(
                { userID: member.id },
                { $inc: { webcoin: -5500 } }
              );
            } else if (pdata.webcoin <= 30000) {
              if (p1) {
                await profiledata.findOneAndUpdate(
                  { userID: member.id },
                  { $inc: { webcoin: +7000 } }
                );
              } else if (p2) {
                await profiledata.findOneAndUpdate(
                  { userID: member.id },
                  { $inc: { webcoin: +6000 } }
                );
              } else if (p25) {
                await profiledata.findOneAndUpdate(
                  { userID: member.id },
                  { $inc: { webcoin: +5200 } }
                );
              } else if (p3) {
                await profiledata.findOneAndUpdate(
                  { userID: member.id },
                  { $inc: { webcoin: +5000 } }
                );
              } else if (p4) {
                await profiledata.findOneAndUpdate(
                  { userID: member.id },
                  { $inc: { webcoin: +4500 } }
                );
              }
              if (bughunter) {
                await profiledata.findOneAndUpdate(
                  { userID: member.id },
                  { $inc: { webcoin: +650 } }
                );
              }

              await profiledata.findOneAndUpdate(
                { userID: member.id },
                { $inc: { webcoin: +2000 } }
              );
              await profiledata.findOneAndUpdate(
                { userID: member.id },
                { maas: true }
              );
              await profiledata.findOneAndUpdate(
                { userID: member.id },
                { $inc: { webcoin: -6300 } }
              );
            } else if (pdata.webcoin <= 40000) {
              if (p1) {
                await profiledata.findOneAndUpdate(
                  { userID: member.id },
                  { $inc: { webcoin: +7000 } }
                );
              } else if (p2) {
                await profiledata.findOneAndUpdate(
                  { userID: member.id },
                  { $inc: { webcoin: +6000 } }
                );
              } else if (p25) {
                await profiledata.findOneAndUpdate(
                  { userID: member.id },
                  { $inc: { webcoin: +5200 } }
                );
              } else if (p3) {
                await profiledata.findOneAndUpdate(
                  { userID: member.id },
                  { $inc: { webcoin: +5000 } }
                );
              } else if (p4) {
                await profiledata.findOneAndUpdate(
                  { userID: member.id },
                  { $inc: { webcoin: +4500 } }
                );
              }
              if (bughunter) {
                await profiledata.findOneAndUpdate(
                  { userID: member.id },
                  { $inc: { webcoin: +650 } }
                );
              }

              await profiledata.findOneAndUpdate(
                { userID: member.id },
                { $inc: { webcoin: +2000 } }
              );
              await profiledata.findOneAndUpdate(
                { userID: member.id },
                { maas: true }
              );
              await profiledata.findOneAndUpdate(
                { userID: member.id },
                { $inc: { webcoin: -8400 } }
              );
            } else if (pdata.webcoin <= 50000) {
              if (p1) {
                await profiledata.findOneAndUpdate(
                  { userID: member.id },
                  { $inc: { webcoin: +7000 } }
                );
              } else if (p2) {
                await profiledata.findOneAndUpdate(
                  { userID: member.id },
                  { $inc: { webcoin: +6000 } }
                );
              } else if (p25) {
                await profiledata.findOneAndUpdate(
                  { userID: member.id },
                  { $inc: { webcoin: +5200 } }
                );
              } else if (p3) {
                await profiledata.findOneAndUpdate(
                  { userID: member.id },
                  { $inc: { webcoin: +5000 } }
                );
              } else if (p4) {
                await profiledata.findOneAndUpdate(
                  { userID: member.id },
                  { $inc: { webcoin: +4500 } }
                );
              }
              if (bughunter) {
                await profiledata.findOneAndUpdate(
                  { userID: member.id },
                  { $inc: { webcoin: +650 } }
                );
              }

              await profiledata.findOneAndUpdate(
                { userID: member.id },
                { $inc: { webcoin: +2000 } }
              );
              await profiledata.findOneAndUpdate(
                { userID: member.id },
                { maas: true }
              );
              await profiledata.findOneAndUpdate(
                { userID: member.id },
                { $inc: { webcoin: -11000 } }
              );
            } else if (pdata.webcoin <= 75000) {
              if (p1) {
                await profiledata.findOneAndUpdate(
                  { userID: member.id },
                  { $inc: { webcoin: +7000 } }
                );
              } else if (p2) {
                await profiledata.findOneAndUpdate(
                  { userID: member.id },
                  { $inc: { webcoin: +6000 } }
                );
              } else if (p25) {
                await profiledata.findOneAndUpdate(
                  { userID: member.id },
                  { $inc: { webcoin: +5200 } }
                );
              } else if (p3) {
                await profiledata.findOneAndUpdate(
                  { userID: member.id },
                  { $inc: { webcoin: +5000 } }
                );
              } else if (p4) {
                await profiledata.findOneAndUpdate(
                  { userID: member.id },
                  { $inc: { webcoin: +4500 } }
                );
              }
              if (bughunter) {
                await profiledata.findOneAndUpdate(
                  { userID: member.id },
                  { $inc: { webcoin: +650 } }
                );
              }

              await profiledata.findOneAndUpdate(
                { userID: member.id },
                { $inc: { webcoin: +2000 } }
              );
              await profiledata.findOneAndUpdate(
                { userID: member.id },
                { maas: true }
              );
              await profiledata.findOneAndUpdate(
                { userID: member.id },
                { $inc: { webcoin: -15000 } }
              );
            } else if (pdata.webcoin <= 100000) {
              if (p1) {
                await profiledata.findOneAndUpdate(
                  { userID: member.id },
                  { $inc: { webcoin: +7000 } }
                );
              } else if (p2) {
                await profiledata.findOneAndUpdate(
                  { userID: member.id },
                  { $inc: { webcoin: +6000 } }
                );
              } else if (p25) {
                await profiledata.findOneAndUpdate(
                  { userID: member.id },
                  { $inc: { webcoin: +5200 } }
                );
              } else if (p3) {
                await profiledata.findOneAndUpdate(
                  { userID: member.id },
                  { $inc: { webcoin: +5000 } }
                );
              } else if (p4) {
                await profiledata.findOneAndUpdate(
                  { userID: member.id },
                  { $inc: { webcoin: +4500 } }
                );
              }
              if (bughunter) {
                await profiledata.findOneAndUpdate(
                  { userID: member.id },
                  { $inc: { webcoin: +650 } }
                );
              }

              await profiledata.findOneAndUpdate(
                { userID: member.id },
                { $inc: { webcoin: +2000 } }
              );
              await profiledata.findOneAndUpdate(
                { userID: member.id },
                { maas: true }
              );
              await profiledata.findOneAndUpdate(
                { userID: member.id },
                { $inc: { webcoin: -17500 } }
              );
            } else {
              if (p1) {
                await profiledata.findOneAndUpdate(
                  { userID: member.id },
                  { $inc: { webcoin: +7000 } }
                );
              } else if (p2) {
                await profiledata.findOneAndUpdate(
                  { userID: member.id },
                  { $inc: { webcoin: +6000 } }
                );
              } else if (p25) {
                await profiledata.findOneAndUpdate(
                  { userID: member.id },
                  { $inc: { webcoin: +5200 } }
                );
              } else if (p3) {
                await profiledata.findOneAndUpdate(
                  { userID: member.id },
                  { $inc: { webcoin: +5000 } }
                );
              } else if (p4) {
                await profiledata.findOneAndUpdate(
                  { userID: member.id },
                  { $inc: { webcoin: +4500 } }
                );
              }
              if (bughunter) {
                await profiledata.findOneAndUpdate(
                  { userID: member.id },
                  { $inc: { webcoin: +650 } }
                );
              }

              await profiledata.findOneAndUpdate(
                { userID: member.id },
                { $inc: { webcoin: +2000 } }
              );
              await profiledata.findOneAndUpdate(
                { userID: member.id },
                { maas: true }
              );
              await profiledata.findOneAndUpdate(
                { userID: member.id },
                { $inc: { webcoin: -30000 } }
              );
            }

            res.redirect("/webcoin/:userID/edit");
          }
        } else {
          res.redirect("/webcoin/:userID/edit");
        }
      });
    }
  );

  app.get("/reklam", checkMaintence, async (req, res) => {
    const botdata = await botsdata.find();
    const patlats = await patlat.find().sort({ Date: -1 });
    const bakimmod = await bakim.findOne({ bakımmod: "aktif" });
    if (bakimmod) {
      renderTemplate(res, req, "404/bakım.ejs", {
        config,
        roles,
        botdata,
        getuser,
      });
    }

    renderTemplate(res, req, "reklam/reklampano1.ejs", {
      config,
      roles,
      botdata,
      getuser,
      bakim,
      patlats,
    });
  });

  app.get("/videos", checkMaintence, async (req, res) => {
    console.log(req.headers["x-forwarded-for"].split(",")[0]);
    const botdata = await botsdata.find();
    renderTemplate(res, req, "videolar/videos.ejs", {
      config,
      roles,
      botdata,
      getuser,
    });
  });

  app.get("/user/search", checkMaintence, async (req, res) => {
    console.log(req.headers["x-forwarded-for"].split(",")[0]);
    const botdata = await botsdata.find();
    renderTemplate(res, req, "user/arama.ejs", {
      config,
      roles,
      botdata,
      getuser,
    });
  });

  app.get("/discord", (req, res) => {
    console.log(req.headers["x-forwarded-for"].split(",")[0]);
    res.redirect("https://discord.gg/ME2F7SHKmS");
  });
  app.get("/team", checkMaintence, async (req, res) => {
    console.log(req.headers["x-forwarded-for"].split(",")[0]);
    renderTemplate(res, req, "pages/team.ejs", {
      req,
      roles,
      config,
    });
  });
  app.get("/error", (req, res) => {
    console.log(req.headers["x-forwarded-for"].split(",")[0]);
    renderTemplate(res, req, "pages/error.ejs", {
      req,
      config,
      res,
      roles,
      channels,
    });
  });
  app.get("/partners", checkMaintence, (req, res) => {
    console.log(req.headers["x-forwarded-for"].split(",")[0]);
    const Database = require("void.db");
    const db = new Database(
      path.join(__dirname, "./database/json/partners.json")
    );
    renderTemplate(res, req, "partners.ejs", {
      roles,
      config,
      db,
    });
  });

  app.get("/bot-rules", checkMaintence, (req, res) => {
    console.log(req.headers["x-forwarded-for"].split(",")[0]);
    renderTemplate(res, req, "/botlist/bot-rules.ejs", {
      config,
      roles,
    });
  });

  //-- Eğitim sistemi --//

  app.get("/egitim/giris", checkMaintence, async (req, res) => {
    console.log(req.headers["x-forwarded-for"].split(",")[0]);
    let data = await codesSchema.find();
    euser
      .find()
      .then((result) => {
        renderTemplate(res, req, "/egitim/giris.ejs", {
          req,
          testcode: result,
          roles,
          config,
          data,
          euser: result,
        });
      })
      .catch((err) => {
        console.log(err);
      });
  });

  app.get("/egitim/yenihesap", checkMaintence, async (req, res) => {
    console.log(req.headers["x-forwarded-for"].split(",")[0]);
    const botdata = await botsdata.find();
    const bakimmod = await bakim.findOne({ bakımmod: "aktif" });
    if (bakimmod) {
      renderTemplate(res, req, "404/bakım.ejs", {
        config,
        roles,
        botdata,
        getuser,
      });
    }

    renderTemplate(res, req, "egitim/hesapkayıt/kayıtgiris.ejs", {
      config,
      roles,
      botdata,
      getuser,
      bakim,
    });
  });

  app.get("/egitim/yenihesapd", checkMaintence, async (req, res) => {
    console.log(req.headers["x-forwarded-for"].split(",")[0]);
    const botdata = await botsdata.find();
    const bakimmod = await bakim.findOne({ bakımmod: "aktif" });
    if (bakimmod) {
      renderTemplate(res, req, "404/bakım.ejs", {
        config,
        roles,
        botdata,
        getuser,
      });
    }

    renderTemplate(res, req, "egitim/hesapkayıt/kayıt.ejs", {
      config,
      roles,
      botdata,
      getuser,
      bakim,
    });
  });
  app.get("/egitimbeta", checkMaintence, async (req, res) => {
    console.log(req.headers["x-forwarded-for"].split(",")[0]);
    let data = await codesSchema.find();
    euser
      .find()
      .then((result) => {
        renderTemplate(res, req, "/egitim/index.ejs", {
          req,
          testcode: result,
          roles,
          config,
          data,
          euser: result,
        });
      })
      .catch((err) => {
        console.log(err);
      });
  });

  app.get("/egitim/:id/panel", checkMaintence, async (req, res) => {
    let data = await codesSchema.find();
    euser
      .find()
      .then((result) => {
        renderTemplate(res, req, "/egitim/panel/index.ejs", {
          req,
          testcode: result,
          roles,
          config,
          data,
          euser: result,
        });
      })
      .catch((err) => {
        console.log(err);
      });
  });

  app.post("/egitim/hesapolustur", checkMaintence, async (req, res) => {
    const Euser = new euser(req.body);
    Euser.save().then((result) => {
      var mailbilgi = {
        from: "themechanicsweb@gmail.com",
        to: `${req.body.email}`,
        subject: `${req.body.discordTag} Eğitim hesabı oluşturuldu`,
        html: "<p>Hesabın sorunsuz oluşturuldu , unutma uyman gereken <a href=`https://themechanics-web.glitch.me/egitim/kurallar`>Kurallar</a> var</p>",
      };
      transfer.sendMail(mailbilgi, function (error) {
        if (error) console.log(error);
        else console.log("mail işlemi tm ");
      });

      res.redirect("/egitim");
    });
  });

  //-- Eğitim sistemi bitti --//

  //-- form paylaş --//
  app.get("/form", checkMaintence, checkAuth, async (req, res) => {
    console.log(req.headers["x-forwarded-for"].split(",")[0]);
    let data = await codesSchema.find();
    form
      .find()
      .then((result) => {
        renderTemplate(res, req, "/form/index.ejs", {
          req,
          testcode: result,
          roles,
          config,
          data,
          form: result,
        });
      })
      .catch((err) => {
        console.log(err);
      });
  });

  app.get("/form/panel", checkMaintence, checkAuth, async (req, res) => {
    console.log(req.headers["x-forwarded-for"].split(",")[0]);
    let data = await codesSchema.find();
    form
      .find()
      .then((result) => {
        renderTemplate(res, req, "/form/panel.ejs", {
          req,
          testcode: result,
          roles,
          config,
          data,
          form: result,
        });
      })
      .catch((err) => {
        console.log(err);
      });
  });

  app.get("/form/olustur", checkMaintence, checkAuth, async (req, res) => {
    console.log(req.headers["x-forwarded-for"].split(",")[0]);
    let data = await codesSchema.find();
    form
      .find()
      .then((result) => {
        renderTemplate(res, req, "/form/olustur.ejs", {
          req,
          testcode: result,
          roles,
          config,
          data,
        });
      })
      .catch((err) => {
        console.log(err);
      });
  });

  app.post("/form/olustur/forms", checkMaintence, async (req, res) => {
    console.log(req.headers["x-forwarded-for"].split(",")[0]);
    const Form = new form(req.body);
    Form.save().then((result) => {
      res.redirect("/form/olustur");

      console.log(req.user);
    });
  });

  app.delete("/form/panel/:id", (req, res) => {
    const id = req.params.id;
    form
      .findByIdAndDelete(id)
      .then((result) => {
        res.redirect("/form/panel");
      })

      .catch((err) => {
        console.log(err);
      });
  });

  app.get("/:id/yorum", checkMaintence, checkAuth, async (req, res) => {
    console.log(req.headers["x-forwarded-for"].split(",")[0]);
    const id = req.params.id;
    form
      .find()
      .then((result) => {
        renderTemplate(res, req, "/form/yorumekle.ejs", {
          req,
          testcode: result,
          roles,
          config,
          form,
        });
      })
      .catch((err) => {
        console.log(err);
      });
  });

  app.post("/yorum/olustur", checkMaintence, async (req, res) => {
    const Yorum = new yorum(req.body);
    Yorum.save().then((result) => {
      res.redirect("/form/olustur", {
        req,
        testcode: result,
        roles,
        config,
      });

      console.log(req.user);
    });
  });

  //-- Form paylaş bitti --/

  //-- Sunucu paylaş --//

  app.get("/sunucu", checkMaintence, async (req, res) => {
    console.log(req.headers["x-forwarded-for"].split(",")[0]);
    const botdata = await botsdata.find();
    renderTemplate(res, req, "sunucu/index.ejs", {
      config,
      roles,
      botdata,
      getuser,
    });
  });

  app.get("/sunucu/paylas/form", checkMaintence, async (req, res) => {
    console.log(req.headers["x-forwarded-for"].split(",")[0]);
    const botdata = await botsdata.find();

    renderTemplate(res, req, "sunucu/form/ekle.ejs", {
      config,
      roles,
      botdata,
      getuser,
    });
  });

  app.post("/sunucu/paylas/forms", checkMaintence, async (req, res) => {
    res.redirect(`/sunucu/paylas/form`);

    console.log(config.user);
  });

  //-- Sunucu paylaş bitti --/

  //-- kullanıcı arama --//

  app.get("/kullanıcı/arama", checkMaintence, async (req, res) => {
    console.log(req.headers["x-forwarded-for"].split(",")[0]);
    const botdata = await botsdata.find();
    renderTemplate(res, req, "user/arama.ejs", {
      config,
      roles,
      botdata,
      getuser,
    });
  });

  app.post("/arama", (req, res) => {
    res.redirect(`/user/${req.body.id}`);

    console.log(req.body.id);
  });

  //-- kullanıcı arama bitti --/

  //--- İstek şikayet ---//

  app.get("/istek-sikayet", checkMaintence, checkAuth, async (req, res) => {
    let data = await codesSchema.find();
    ısk
      .find()
      .then((result) => {
        renderTemplate(res, req, "/yardım/istek-sıkayet/index.ejs", {
          req,
          ısk: result,
          roles,
          config,
          data,
        });
      })
      .catch((err) => {
        console.log(err);
      });
  });

  app.post("/istek-sikayet", (req, res) => {
    const Isk = new ısk(req.body);

    Isk.save()
      .then((result) => {
        res.redirect("/");

        console.log(req.body);

        let rBody = req.body;
        client.channels.cache.get("919672971986083861").send(
          `** <@${rBody["id"]}> tarafından ${rBody["türü"]} form'u gönderildi 
\n form nedeni: ${rBody["nedeni"]}  \n form açıklaması ${rBody["acıklama"]}
            ** `
        );
      })
      .catch((err) => {
        console.log(err);
      });
  });

  //--- İstek şikayet --- bitti//

  //------------------- CODE SHARE  -------------------//
  app.get("/code/:code", checkMaintence, checkAuth, async (req, res) => {
    let kod = req.params.code;
    let koddata = await codesSchema.findOne({
      code: kod,
    });
    if (!koddata)
      return res.redirect(
        "/codes?error=true&message=You entered an invalid code."
      );
    if (
      !client.guilds.cache.get(config.server.id).members.cache.get(req.user.id)
    )
      return res.redirect(
        "/error?code=403&message=To do this, you have to join our discord server."
      );
    if (koddata.codeCategory == "aoi.js") {
      if (
        !client.guilds.cache
          .get(config.server.id)
          .members.cache.get(req.user.id)
          .roles.cache.get(config.server.roles.codeshare.aoijs)
      )
        return res.redirect(
          "/error?code=403&message=Sunucumuzda bulunmuyorsun"
        );
    }
    if (koddata.codeCategory == "discord.py") {
      if (
        !client.guilds.cache
          .get(config.server.id)
          .members.cache.get(req.user.id)
          .roles.cache.get(config.server.roles.codeshare.discordpy)
      )
        return res.redirect(
          "/error?code=403&message=Sunucumuzda bulunmuyorsun"
        );
    }
    if (koddata.codeCategory == "html") {
      if (
        !client.guilds.cache
          .get(config.server.id)
          .members.cache.get(req.user.id)
          .roles.cache.get(config.server.roles.codeshare.html)
      )
        return res.redirect(
          "/error?code=403&message=Sunucumuzda bulunmuyorsun"
        );
    }

    if (koddata.codeCategory == "bdfd") {
      if (
        !client.guilds.cache
          .get(config.server.id)
          .members.cache.get(req.user.id)
          .roles.cache.get(config.server.roles.codeshare.bdfd)
      )
        return res.redirect(
          "/error?code=403&message=Sunucumuzda bulunmuyorsun."
        );
    }
    if (koddata.codeCategory == "javascript") {
      if (
        !client.guilds.cache
          .get(config.server.id)
          .members.cache.get(req.user.id)
          .roles.cache.get(config.server.roles.codeshare.javascript)
      )
        return res.redirect(
          "/error?code=403&message=Sunucumuzda bulunmuyorsun"
        );
    }
    renderTemplate(res, req, "codeshare/codeview.ejs", {
      req,
      roles,
      config,
      koddata,
    });
  });
  app.get("/codes", checkMaintence, checkAuth, async (req, res) => {
    let data = await codesSchema.find();
    renderTemplate(res, req, "codeshare/codes/codes.ejs", {
      req,
      roles,
      config,
      data,
    });
  });

  app.get("/codes/:type", checkMaintence, checkAuth, async (req, res) => {
    let data = await codesSchema.find();
    renderTemplate(res, req, "codeshare/codes/codelist.ejs", {
      req,
      roles,
      config,
      data,
    });
  });

  //---------------- Herkeze açk kod paylaşma sistemi ---------------//

  //---------------- Herkeze açk kod paylaşma sistemi  Kodlar  ---------------//

  app.get("/uye/code/bdfd", checkMaintence, checkAuth, async (req, res) => {
    let data = await codesSchema.find();
    testcode
      .find()
      .then((result) => {
        renderTemplate(res, req, "codeshare/codeüyeler/kodlar/bdfd.ejs", {
          req,
          testcode: result,
          roles,
          config,
          data,
        });
      })
      .catch((err) => {
        console.log(err);
      });
  });

  app.get("/code/bdfd/:id", checkMaintence, checkAuth, async (req, res) => {
    const id = req.params.id;

    testcode
      .findById(id)
      .then((result) => {
        renderTemplate(res, req, "codeshare/codeüyeler/kodid.ejs", {
          req,
          testcode: result,
          roles,
          config,
        });
      })
      .catch((err) => {
        console.log(err);
      });
  });

  app.get("/uye/code/djs", checkMaintence, checkAuth, async (req, res) => {
    let data = await codesSchema.find();
    testcode
      .find()
      .then((result) => {
        renderTemplate(res, req, "codeshare/codeüyeler/kodlar/djs.ejs", {
          req,
          testcode: result,
          roles,
          config,
          data,
        });
      })
      .catch((err) => {
        console.log(err);
      });
  });

  app.get("/code/djs/:id", checkMaintence, checkAuth, async (req, res) => {
    const id = req.params.id;

    testcode
      .findById(id)
      .then((result) => {
        renderTemplate(res, req, "codeshare/codeüyeler/kodid.ejs", {
          req,
          testcode: result,
          roles,
          config,
        });
      })
      .catch((err) => {
        console.log(err);
      });
  });

  app.get("/uye/code/aoi", checkMaintence, checkAuth, async (req, res) => {
    let data = await codesSchema.find();
    testcode
      .find()
      .then((result) => {
        renderTemplate(res, req, "codeshare/codeüyeler/kodlar/aoi.ejs", {
          req,
          testcode: result,
          roles,
          config,
          data,
        });
      })
      .catch((err) => {
        console.log(err);
      });
  });

  app.get("/code/aoi/:id", checkMaintence, checkAuth, async (req, res) => {
    const id = req.params.id;

    testcode
      .findById(id)
      .then((result) => {
        renderTemplate(res, req, "codeshare/codeüyeler/aoi.ejs", {
          req,
          testcode: result,
          roles,
          config,
        });
      })
      .catch((err) => {
        console.log(err);
      });
  });

  app.get("/uye/code/dpy", checkMaintence, checkAuth, async (req, res) => {
    let data = await codesSchema.find();
    testcode
      .find()
      .then((result) => {
        renderTemplate(res, req, "codeshare/codeüyeler/kodlar/dpy.ejs", {
          req,
          testcode: result,
          roles,
          config,
          data,
        });
      })
      .catch((err) => {
        console.log(err);
      });
  });

  app.get("/code/dpy/:id", checkMaintence, checkAuth, async (req, res) => {
    const id = req.params.id;

    testcode
      .findById(id)
      .then((result) => {
        renderTemplate(res, req, "codeshare/codeüyeler/kodid.ejs", {
          req,
          testcode: result,
          roles,
          config,
        });
      })
      .catch((err) => {
        console.log(err);
      });
  });

  //---------------- Herkeze açk kod paylaşma sistemi  Kodlar bitti ---------------//

  app.get("/uye/code", checkMaintence, checkAuth, async (req, res) => {
    let data = await codesSchema.find();
    testcode
      .find()
      .then((result) => {
        renderTemplate(res, req, "codeshare/codeüyeler/anasayfa.ejs", {
          req,
          testcode: result,
          roles,
          config,
          data,
        });
      })
      .catch((err) => {
        console.log(err);
      });
  });

  app.get("/kod-paylas/ekle", checkMaintence, checkAuth, async (req, res) => {
    let data = await codesSchema.find();
    testcode
      .find()
      .then((result) => {
        renderTemplate(res, req, "codeshare/codeüyeler/kodekle.ejs", {
          req,
          testcode: result,
          roles,
          config,
          data,
        });
      })
      .catch((err) => {
        console.log(err);
      });
  });

  app.get(
    "/kod-paylas/ekle/bdfdmod",
    checkMaintence,
    checkAuth,
    async (req, res) => {
      let data = await codesSchema.find();
      bdfdmod
        .find()
        .then((result) => {
          renderTemplate(res, req, "codeshare/codeüyeler/kodlar/bdfd/mod.ejs", {
            req,
            bdfdmod: result,
            roles,
            config,
            data,
          });
        })
        .catch((err) => {
          console.log(err);
        });
    }
  );

  app.get(
    "/kod-paylas/ekle/bdfd-ekonomi",
    checkMaintence,
    checkAuth,
    async (req, res) => {
      let data = await codesSchema.find();
      bdfdekonomi
        .find()
        .then((result) => {
          renderTemplate(
            res,
            req,
            "codeshare/codeüyeler/kodlar/bdfd/ekonomi.ejs",
            {
              req,
              bdfdekonomi: result,
              roles,
              config,
              data,
            }
          );
        })
        .catch((err) => {
          console.log(err);
        });
    }
  );

  app.get(
    "/kod-paylas/ekle/bdfd-eglence",
    checkMaintence,
    checkAuth,
    async (req, res) => {
      let data = await codesSchema.find();
      bdfdeglence
        .find()
        .then((result) => {
          renderTemplate(
            res,
            req,
            "codeshare/codeüyeler/kodlar/bdfd/eğlence.ejs",
            {
              req,
              bdfdeglence: result,
              roles,
              config,
              data,
            }
          );
        })
        .catch((err) => {
          console.log(err);
        });
    }
  );

  app.get("/uye-panel", checkMaintence, checkAuth, async (req, res) => {
    let data = await codesSchema.find();
    const pdata = await profiledata.findOne({
      userID: req.user.id,
    });
    testcode
      .find()
      .then((result) => {
        renderTemplate(res, req, "admin/uyekod/panel.ejs", {
          req,
          testcode: result,
          pdata,
          roles,
          config,
          data,
        });
      })
      .catch((err) => {
        console.log(err);
      });
  });

  const Swal = require("sweetalert2");

  app.post("/kod-paylas/ekle", (req, res) => {
    const Testcode = new testcode(req.body);

    Testcode.save()
      .then((result) => {
        res.redirect("/uye-panel");

        console.log(req.body);

        let rBody = req.body;
        client.channels.cache.get("872966064764506132").send(
          new Discord.MessageEmbed()
            .setTitle(`${req.user.username}`)
            .setColor("GREEN")
            .setFooter(config.footer)
            .setThumbnail(
              "https://cdn.discordapp.com/icons/760256683364188205/a_c0df129042bb90408b965a44f044e7a9.gif"
            )
            .setDescription(
              `** Üye tarafından herkese açık kod eklendi
            ** `
            )
            .addField("Kod Adı", `${rBody["kodisim"]} `, true)
            .addField("Kod açıklaması", `${rBody["kodac"]} `, true)
            .addField("Kod Kategorisi", "**BDFD**", true)
            .addField("Şartları", "**ONAYLADI**", true)
        );
      })
      .catch((err) => {
        console.log(err);
      });
  });

  app.post("/kod-paylas/ekle/bdfdmod", (req, res) => {
    const Bdfdmod = new bdfdmod(req.body);

    Bdfdmod.save()
      .then((result) => {
        res.redirect("/uye-panel");

        console.log(req.body);

        let rBody = req.body;
        client.channels.cache.get("872966064764506132").send(
          new Discord.MessageEmbed()
            .setTitle(`${req.user.username}`)
            .setColor("GREEN")
            .setFooter(config.footer)
            .setThumbnail(
              "https://cdn.discordapp.com/icons/760256683364188205/a_c0df129042bb90408b965a44f044e7a9.gif"
            )
            .setDescription(
              `** Üye tarafından herkese açık kod eklendi
            ** `
            )
            .addField("Kod Adı", `${rBody["kodisim"]} `, true)
            .addField("Kod açıklaması", `${rBody["kodac"]} `, true)
            .addField("Kod Kategorisi", "**BDFD**", true)
            .addField("Şartları", "**ONAYLADI**", true)
        );
      })
      .catch((err) => {
        console.log(err);
      });
  });

  app.post("/kod-paylas/ekle/bdfd-ekonomi", (req, res) => {
    const Bdfdekonomi = new bdfdekonomi(req.body);

    Bdfdekonomi.save()
      .then((result) => {
        res.redirect("/uye-panel");

        console.log(req.body);

        let rBody = req.body;
        client.channels.cache.get("872966064764506132").send(
          new Discord.MessageEmbed()
            .setTitle(`${req.user.username}`)
            .setColor("GREEN")
            .setFooter(config.footer)
            .setThumbnail(
              "https://cdn.discordapp.com/icons/760256683364188205/a_c0df129042bb90408b965a44f044e7a9.gif"
            )
            .setDescription(
              `** Üye tarafından herkese açık kod eklendi
            ** `
            )
            .addField("Kod Adı", `${rBody["kodisim"]} `, true)
            .addField("Kod açıklaması", `${rBody["kodac"]} `, true)
            .addField("Kod Kategorisi", "**BDFD**", true)
            .addField("Şartları", "**ONAYLADI**", true)
        );
      })
      .catch((err) => {
        console.log(err);
      });
  });

  app.post("/kod-paylas/ekle/bdfd-eglence", (req, res) => {
    const Bdfdeglence = new bdfdeglence(req.body);

    Bdfdeglence.save()
      .then((result) => {
        res.redirect("/uye-panel");

        console.log(req.body);

        let rBody = req.body;
        client.channels.cache.get("872966064764506132").send(
          new Discord.MessageEmbed()
            .setTitle(`${req.user.username}`)
            .setColor("GREEN")
            .setFooter(config.footer)
            .setThumbnail(
              "https://cdn.discordapp.com/icons/760256683364188205/a_c0df129042bb90408b965a44f044e7a9.gif"
            )
            .setDescription(
              `** Üye tarafından herkese açık kod eklendi
            ** `
            )
            .addField("Kod Adı", `${rBody["kodisim"]} `, true)
            .addField("Kod açıklaması", `${rBody["kodac"]} `, true)
            .addField("Kod Kategorisi", "**BDFD**", true)
            .addField("Şartları", "**ONAYLADI**", true)
        );
      })
      .catch((err) => {
        console.log(err);
      });
  });

  //---------------- Herkeze açk kod paylaşma sistemi biti ---------------//

  //------------------- CODE SHARE  -------------------//

  //------------------- UPTİME -------------------//
  const uptimedata = require("./database/models/uptime.js");
  app.get("/uptime/add", checkMaintence, checkAuth, async (req, res) => {
    renderTemplate(res, req, "uptime/ekle.ejs", {
      req,
      roles,
      config,
    });
  });
  app.post("/uptime/add", checkMaintence, checkAuth, async (req, res) => {
    const rBody = req.body;
    if (!rBody["link"]) {
      res.redirect("?error=true&message=Herhangi bir bağlantı yazın.");
    } else {
      if (!rBody["link"].match("https"))
        return res.redirect(
          "?error=true&message=Geçerli bir bağlantı girmelisiniz."
        );
      const updcode = makeidd(5);
      const dde = await uptimedata.findOne({
        link: rBody["link"],
      });
      const dd = await uptimedata.find({
        userID: req.user.id,
      });
      if (dd.length > 9)
        res.redirect("?hata=true&message=Çalışma süresi sınırınız ulaştı.");

      if (dde)
        return res.redirect(
          "?hata=true&message=Bu bağlantı sistemde zaten var."
        );
      client.users.fetch(req.user.id).then((a) => {
        new uptimedata({
          server: config.serverID,
          userName: a.username,
          userID: req.user.id,
          link: rBody["link"],
          code: updcode,
        }).save();
      });
      res.redirect(
        "?basarili=true&message=Eklediğin link artık uptime ediliyor"
      );
    }
  });
  app.get("/uptime/links", checkMaintence, checkAuth, async (req, res) => {
    let uptimes = await uptimedata.find({
      userID: req.user.id,
    });
    renderTemplate(res, req, "uptime/linklerim.ejs", {
      req,
      roles,
      config,
      uptimes,
    });
  });
  app.get(
    "/uptime/:code/delete",
    checkMaintence,
    checkAuth,
    async (req, res) => {
      const dde = await uptimedata.findOne({
        code: req.params.code,
      });
      if (!dde)
        return res.redirect(
          "/uptime/links?hata=true&message=Sistemde böyle bir site yok."
        );
      uptimedata.findOne(
        {
          code: req.params.code,
        },
        async function (err, docs) {
          if (docs.userID != req.user.id)
            return res.redirect(
              "/uptime/links?hata=true&message=Silmeye çalıştığınız bağlantı size ait değil."
            );
          res.redirect(
            "/uptime/links?basarili=true&message=Link başarıyla silindi."
          );
          await uptimedata.deleteOne({
            code: req.params.code,
          });
        }
      );
    }
  );
  //------------------- UPTİME -------------------//

  //------------------- BOT LİST -------------------//

  app.get("/bots", checkMaintence, async (req, res) => {
    let page = req.query.page || 1;
    let data =
      (await botsdata.find()) ||
      (await botsdata.find().filter((b) => b.status === "Approved"));
    if (page < 1) return res.redirect(`/bots`);
    if (data.length <= 0) return res.redirect("/");
    if (page > Math.ceil(data.length / 6)) return res.redirect(`/bots`);
    if (Math.ceil(data.length / 6) < 1) {
      page = 1;
    }
    renderTemplate(res, req, "botlist/bots.ejs", {
      req,
      roles,
      config,
      data,
      page: page,
    });
  });
  app.get("/bots/certified", checkMaintence, async (req, res) => {
    let page = req.query.page || 1;
    let x = await botsdata.find();
    let data = x.filter((b) => b.certificate === "Certified");
    if (page < 1) return res.redirect(`/bots`);
    if (data.length <= 0) return res.redirect("/");
    if (page > Math.ceil(data.length / 6)) return res.redirect(`/bots`);
    if (Math.ceil(data.length / 6) < 1) {
      page = 1;
    }
    renderTemplate(res, req, "botlist/bots-certified.ejs", {
      req,
      roles,
      config,
      data,
      page: page,
    });
  });
  app.get("/search", checkMaintence, async (req, res) => {
    let page = req.query.page || 1;
    let x = await botsdata.find();
    let data = x.filter(
      (a) =>
        (a.status == "Approved" && a.username.includes(req.query.q)) ||
        a.shortDesc.includes(req.query.q)
    );
    if (page < 1) return res.redirect(`/bots`);
    if (data.length <= 0) return res.redirect("/");
    if (page > Math.ceil(data.length / 6)) return res.redirect(`/bots`);
    if (Math.ceil(data.length / 6) < 1) {
      page = 1;
    }
    renderTemplate(res, req, "botlist/search.ejs", {
      req,
      roles,
      config,
      data,
      page: page,
    });
  });
  app.get("/tags", checkMaintence, async (req, res) => {
    renderTemplate(res, req, "botlist/tags.ejs", {
      req,
      roles,
      config,
    });
  });
  app.get("/tag/:tag", checkMaintence, async (req, res) => {
    let page = req.query.page || 1;
    let x = await botsdata.find();
    let data = x.filter(
      (a) => a.status == "Approved" && a.tags.includes(req.params.tag)
    );
    if (page < 1) return res.redirect(`/tag/` + req.params.tag);
    if (data.length <= 0) return res.redirect("/");
    if (page > Math.ceil(data.length / 6))
      return res.redirect(`/tag/` + req.params.tag);
    if (Math.ceil(data.length / 6) < 1) {
      page = 1;
    }
    renderTemplate(res, req, "botlist/tag.ejs", {
      req,
      roles,
      config,
      data,
      page: page,
    });
  });
  app.get("/addbot", checkMaintence, checkAuth, async (req, res) => {
    if (
      !client.guilds.cache.get(config.server.id).members.cache.get(req.user.id)
    )
      return res.redirect(
        "/error?code=403&message=Bunun için discord sunucumuza üye olmanız gerekmektedir.."
      );
    renderTemplate(res, req, "botlist/addbot.ejs", {
      req,
      roles,
      config,
    });
  });
  app.get("/bot/:botID/vote", checkMaintence, async (req, res) => {
    let botdata = await botsdata.findOne({
      botID: req.params.botID,
    });
    if (!botdata)
      return res.redirect(
        "/error?code=404&message=Geçersiz bir bot kimliği girdiniz."
      );
    if (req.user) {
      if (
        !req.user.id === botdata.ownerID ||
        req.user.id.includes(botdata.coowners)
      ) {
        if (botdata.status != "Approved")
          return res.redirect(
            "/error?code=404&message=Geçersiz bir bot kimliği girdiniz."
          );
      }
    }
    renderTemplate(res, req, "botlist/vote.ejs", {
      req,
      roles,
      config,
      botdata,
    });
  });
  app.post("/bot/:botID/vote", checkMaintence, checkAuth, async (req, res) => {
    const votes = require("./database/models/botlist/vote.js");
    let botdata = await botsdata.findOne({
      botID: req.params.botID,
    });
    let x = await votes.findOne({
      user: req.user.id,
      bot: req.params.botID,
    });
    if (x)
      return res.redirect(
        "/error?code=400&message=12 Saatte 1 kez oy verebilirsin."
      );
    await votes.findOneAndUpdate(
      {
        bot: req.params.botID,
        user: req.user.id,
      },
      {
        $set: {
          Date: Date.now(),
          ms: 43200000,
        },
      },
      {
        upsert: true,
      }
    );
    await botsdata.findOneAndUpdate(
      {
        botID: req.params.botID,
      },
      {
        $inc: {
          votes: 1,
          voteuser: req.user.id,
        },
      }
    );
    client.channels.cache
      .get("901726551811428353")
      .send(
        `**${req.user.username}#${req.user.discriminator}** Kişisi **${
          botdata.username
        }** Adlı Bota Oy Verdi **\`(${
          botdata.votes + 1
        } Oy Sayısına Ulaştı !)\`**`
      );

    return res.redirect(
      `/bot/${req.params.botID}/vote?success=true&message=Başarıyla oy verdin ! 12 Saat sonra tekrar verebilirsin`
    );
    renderTemplate(res, req, "botlist/vote.ejs", {
      req,
      roles,
      config,
      botdata,
    });
  });

  app.post("/addbot", checkMaintence, checkAuth, async (req, res) => {
    let rBody = req.body;
    let botvarmi = await botsdata.findOne({
      botID: rBody["botID"],
    });
    if (botvarmi)
      return res.redirect(
        "/error?code=404&message=Eklemeye çalıştığınız bot sistemde mevcut."
      );

    client.users.fetch(req.body.botID).then(async (a) => {
      if (!a.bot)
        return res.redirect(
          "/error?code=404&message=Geçersiz bir bot kimliği girdiniz."
        );
      if (!a)
        return res.redirect(
          "/error?code=404&message=Geçersiz bir bot kimliği girdiniz."
        );
      if (rBody["coowners"]) {
        if (String(rBody["coowners"]).split(",").length > 3)
          return res.redirect(
            "?error=true&message=En fazla 3 Ortak Sahip ekleyebilirsiniz."
          );
        if (String(rBody["coowners"]).split(",").includes(req.user.id))
          return res.redirect(
            "?error=true&message=Kendinizi diğer Ortak Sahiplere ekleyemezsiniz."
          );
      }
      await new botsdata({
        botID: rBody["botID"],
        ownerID: req.user.id,
        ownerName: req.user.usename,
        username: a.username,
        discrim: a.discriminator,
        avatar: a.avatarURL(),
        prefix: rBody["prefix"],
        longDesc: rBody["longDesc"],
        shortDesc: rBody["shortDesc"],
        status: "UnApproved",
        tags: rBody["tags"],
        certificate: "None",
        token: makeToken(24),
      }).save();
      if (rBody["background"]) {
        await botsdata.findOneAndUpdate(
          {
            botID: rBody["botID"],
          },
          {
            $set: {
              backURL: rBody["background"],
            },
          },
          function (err, docs) {}
        );
      }
      if (rBody["github"]) {
        await botsdata.findOneAndUpdate(
          {
            botID: rBody["botID"],
          },
          {
            $set: {
              github: rBody["github"],
            },
          },
          function (err, docs) {}
        );
      }
      if (rBody["website"]) {
        await botsdata.findOneAndUpdate(
          {
            botID: rBody["botID"],
          },
          {
            $set: {
              website: rBody["website"],
            },
          },
          function (err, docs) {}
        );
      }
      if (rBody["support"]) {
        await botsdata.findOneAndUpdate(
          {
            botID: rBody["botID"],
          },
          {
            $set: {
              support: rBody["support"],
            },
          },
          function (err, docs) {}
        );
      }
      if (rBody["coowners"]) {
        if (String(rBody["coowners"]).split(",").length > 3)
          return res.redirect(
            "?error=true&message=En fazla 3 ortak sahip ekleyebilirsiniz"
          );
        if (String(rBody["coowners"]).split(",").includes(req.user.id))
          return res.redirect(
            "?error=true&message=Kendinizi ortak sahipler kısmına ekleyemezsiniz."
          );
        await botsdata.findOneAndUpdate(
          {
            botID: rBody["botID"],
          },
          {
            $set: {
              coowners: String(rBody["coowners"]).split(","),
            },
          },
          function (err, docs) {}
        );
      }
    });
    client.users.fetch(rBody["botID"]).then((a) => {
      client.channels.cache
        .get(channels.botlog)
        .send(`<@${req.user.id}> kişisi **${a.tag}** Adlı botu sisteme ekledi`);
      res.redirect(
        `?success=true&message=Botunuzu sisteme eklendi.&botID=${rBody["botID"]}`
      );
    });
  });

  app.get("/bot/:botID", checkMaintence, async (req, res, next) => {
    let botdata = await botsdata.findOne({
      botID: req.params.botID,
    });
    if (!botdata)
      return res.redirect(
        "/error?code=404&message=Geçersiz bir bot kimliği girdiniz."
      );
    if (botdata.status != "Approved") {
      if (
        req.user.id == botdata.ownerID ||
        botdata.coowners.includes(req.user.id)
      ) {
        let coowner = new Array();
        botdata.coowners.map((a) => {
          client.users.fetch(a).then((b) => coowner.push(b));
        });
        client.users.fetch(botdata.ownerID).then((aowner) => {
          client.users.fetch(req.params.botID).then((abot) => {
            renderTemplate(res, req, "botlist/bot.ejs", {
              req,
              abot,
              config,
              botdata,
              coowner,
              aowner,
              roles,
            });
          });
        });
      } else {
        res.redirect(
          "/error?code=404&message=Bu botu düzenlemek için sahiplerinden biri olmalısınız."
        );
      }
    } else {
      let coowner = new Array();
      botdata.coowners.map((a) => {
        client.users.fetch(a).then((b) => coowner.push(b));
      });
      client.users.fetch(botdata.ownerID).then((aowner) => {
        client.users.fetch(req.params.botID).then((abot) => {
          renderTemplate(res, req, "botlist/bot.ejs", {
            req,
            abot,
            config,
            botdata,
            coowner,
            aowner,
            roles,
          });
        });
      });
    }
  });
  app.post("/bot/:botID", async (req, res) => {
    let botdata = await botsdata.findOne({
      botID: req.params.botID,
    });
    client.users.fetch(botdata.botID).then(async (bot) => {
      client.users.fetch(botdata.ownerID).then(async (owner) => {
        if (bot) {
          await botsdata.findOneAndUpdate(
            {
              botID: botdata.botID,
            },
            {
              $set: {
                ownerName: owner.username,
                username: bot.username,
                discrim: bot.discriminator,
                avatar: bot.avatarURL(),
              },
            }
          );
        } else {
          await botsdata.findOneAndDelete({
            botID: botdata.botID,
          });
        }
      });
    });
    return res.redirect("/bot/" + req.params.botID);
  });

  app.get("/bot/:botID/edit", checkMaintence, checkAuth, async (req, res) => {
    let botdata = await botsdata.findOne({
      botID: req.params.botID,
    });
    if (!botdata)
      return res.redirect(
        "/error?code=404&message=Geçersiz bir bot kimliği girdiniz."
      );
    if (
      req.user.id == botdata.ownerID ||
      botdata.coowners.includes(req.user.id)
    ) {
      renderTemplate(res, req, "botlist/bot-edit.ejs", {
        req,
        config,
        botdata,
        roles,
      });
    } else {
      res.redirect(
        "/error?code=404&message=Bu botu düzenlemek için sahiplerinden biri olmalısınız."
      );
    }
  });

  app.post("/bot/:botID/edit", checkMaintence, checkAuth, async (req, res) => {
    let rBody = req.body;
    let botdata = await botsdata.findOne({
      botID: req.params.botID,
    });
    if (String(rBody["coowners"]).split(",").length > 3)
      return res.redirect(
        "?error=true&message=En fazla 3 Ortak Sahip ekleyebilirsiniz.."
      );
    if (String(rBody["coowners"]).split(",").includes(req.user.id))
      return res.redirect(
        "?error=true&message=Kendinizi diğer Ortak Sahiplere ekleyemezsiniz."
      );
    await botsdata.findOneAndUpdate(
      {
        botID: req.params.botID,
      },
      {
        $set: {
          botID: req.params.botID,
          ownerID: botdata.ownerID,
          prefix: rBody["prefix"],
          longDesc: rBody["longDesc"],
          shortDesc: rBody["shortDesc"],
          tags: rBody["tags"],
          github: rBody["github"],
          website: rBody["website"],
          support: rBody["support"],
          coowners: String(rBody["coowners"]).split(","),
          backURL: rBody["background"],
        },
      },
      function (err, docs) {}
    );
    client.users.fetch(req.params.botID).then((a) => {
      client.channels.cache
        .get(channels.botlog)
        .send(
          `<@${req.user.id}> adlı kişi **${a.tag}** adlı botunu düzenledi. https://themechanics-web.glitch.me/bot/${a.id}`
        );
      res.redirect(
        `?success=true&message=Botunuz başarıyla düzenlenmiştir.&botID=${req.params.botID}`
      );
    });
  });

  app.get("/bot/:botID/delete", async (req, res) => {
    let botdata = await botsdata.findOne({
      botID: req.params.botID,
    });
    if (
      req.user.id === botdata.ownerID ||
      botdata.coowners.includes(req.user.id)
    ) {
      let guild = client.guilds.cache
        .get(config.server.id)
        .members.cache.get(botdata.botID);
      await botsdata.deleteOne({
        botID: req.params.botID,
        ownerID: botdata.ownerID,
      });
      return res.redirect(
        `/user/${req.user.id}?success=true&message=Bot Başarıyla Sistemden Silinmiştir.`
      );
    } else {
      return res.redirect(
        "/error?code=404&message=Geçersiz bir bot kimliği girdiniz."
      );
    }
  });

  //------------------- BOT LİST -------------------//

  //---------------- ADMIN ---------------\\
  const appsdata = require("./database/models/botlist/certificate-apps.js");
  // CERTIFICATE APP
  app.get("/certification", checkMaintence, checkAuth, async (req, res) => {
    renderTemplate(res, req, "/botlist/apps/certification.ejs", {
      req,
      roles,
      config,
    });
  });
  app.get(
    "/certification/apply",
    checkMaintence,
    checkAuth,
    async (req, res) => {
      const userbots = await botsdata.find({
        ownerID: req.user.id,
      });
      renderTemplate(res, req, "/botlist/apps/certificate-app.ejs", {
        req,
        roles,
        config,
        userbots,
        form,
      });
    }
  );
  app.post(
    "/certification/apply",
    checkMaintence,
    checkAuth,
    async (req, res) => {
      const rBody = req.body;
      new appsdata({
        botID: rBody["bot"],
        future: rBody["future"],
      }).save();
      res.redirect(
        "/bots?success=true&message=Sertifika başvurusu yapıldı.&botID=" +
          rBody["bot"]
      );
      let botdata = await botsdata.findOne({
        botID: rBody["bot"],
      });
      client.channels.cache
        .get(channels.botlog)
        .send(
          `**${req.user.username}#${req.user.discriminator}** kişisi **${botdata.username}** botu için sertifika başvurusu yaptı.`
        );
    }
  );
  //
  const checkAdmin = async (req, res, next) => {
    if (req.isAuthenticated()) {
      if (
        client.guilds.cache
          .get(config.server.id)
          .members.cache.get(req.user.id)
          .roles.cache.get(roles.yonetici) ||
        client.guilds.cache
          .get(config.server.id)
          .members.cache.get(req.user.id)
          .roles.cache.get(roles.moderator) ||
        client.guilds.cache
          .get(config.server.id)
          .members.cache.get(req.user.id)
          .roles.cache.get(roles.codeshare)
      ) {
        next();
      } else {
        res.redirect("/error?code=403&message=Bunu yapmaya yetkin yetmez.");
      }
    } else {
      req.session.backURL = req.url;
      res.redirect("/login");
    }
  };

  app.get(
    "/admin/coin/panel",
    checkMaintence,
    checkAdmin,
    checkAuth,
    async (req, res, result) => {
      const botdata = await botsdata.find();
      const codedata = await codesSchema.find();
      const udata = await uptimedata.find();
      prof.find().then((result) => {
        renderTemplate(res, req, "admin/coinsistem/index.ejs", {
          req,
          prof: result,
          roles,
          config,
          codedata,
          botdata,
          udata,
        });
      });
    }
  );

  app.get(
    "/admin/coin/panel/maas",
    checkMaintence,
    checkAdmin,
    checkAuth,
    async (req, res, result) => {
      const botdata = await botsdata.find();
      const codedata = await codesSchema.find();
      const udata = await uptimedata.find();
      prof.find().then((result) => {
        renderTemplate(res, req, "admin/maas.ejs", {
          req,
          prof: result,
          roles,
          config,
          codedata,
          botdata,
          udata,
        });
      });
    }
  );

  app.post(
    "/admin/yarisma/save",
    checkMaintence,
    checkAuth,
    checkAdmin,
    async (req, res) => {
      const pdata = await profiledata.findOne({
        userID: req.body.ıd,
      });
      await profiledata.findOneAndUpdate(
        { userID: req.body.ıd },
        { yarismapuan: req.body.puan }
      );
      await profiledata.findOneAndUpdate(
        { userID: req.body.ıd },
        { yarismakontrol: true }
      );
    }
  );

  //- Ayarlar -//
  app.get(
    "/admin/web/ayarlar",
    checkMaintence,
    checkAdmin,
    checkAuth,
    async (req, res, result) => {
      const botdata = await botsdata.find();
      const codedata = await codesSchema.find();
      const udata = await uptimedata.find();
      const bakimmod = await bakim.find();
      renderTemplate(res, req, "admin/ayarlar/index.ejs", {
        req,
        testcode: result,
        roles,
        config,
        codedata,
        botdata,
        udata,
        bakimmod,
      });
    }
  );

  // - bitti - //

  //---------------- Herkeze açk kod paylaşma  ADMİN sistemi  ---------------//
  app.get(
    "/admin/uye/bdfd",
    checkMaintence,
    checkAdmin,
    checkAuth,
    async (req, res, result) => {
      const botdata = await botsdata.find();
      const codedata = await codesSchema.find();
      const udata = await uptimedata.find();
      testcode.find().then((result) => {
        renderTemplate(res, req, "admin/uyekod/bdfd.ejs", {
          req,
          testcode: result,
          roles,
          config,
          codedata,
          botdata,
          udata,
        });
      });
    }
  );

  app.delete("/admin/uye/bdfd/:id", (req, res) => {
    const id = req.params.id;
    testcode
      .findByIdAndDelete(id)
      .then((result) => {
        res.redirect("https://themechanics-web.glitch.me/admin/uye/bdfd");

        let rBody = req.body;
        client.channels.cache.get("872966064764506132").send(
          new Discord.MessageEmbed()
            .setTitle(`${req.user.username}`)
            .setColor("GREEN")
            .setFooter(config.footer)
            .setThumbnail(
              "https://cdn.discordapp.com/icons/760256683364188205/a_c0df129042bb90408b965a44f044e7a9.gif"
            )
            .setDescription(
              `** Yetkili admin kodu sildi / BDFD
            ** `
            )
        );
      })

      .catch((err) => {
        console.log(err);
      });
  });

  app.get(
    "/admin/uye/bdfd-mod",
    checkMaintence,
    checkAdmin,
    checkAuth,
    async (req, res, result) => {
      const botdata = await botsdata.find();
      const codedata = await codesSchema.find();
      const udata = await uptimedata.find();
      bdfdmod.find().then((result) => {
        renderTemplate(res, req, "admin/uyekod/bdfd-mod.ejs", {
          req,
          bdfdmod: result,
          roles,
          config,
          codedata,
          botdata,
          udata,
          form: result,
        });
      });
    }
  );

  app.delete("/admin/uye/bdfd-mod/:id", (req, res) => {
    const id = req.params.id;
    bdfdmod
      .findByIdAndDelete(id)
      .then((result) => {
        res.redirect("https://themechanics-web.glitch.me/admin/uye/bdfd-mod");

        let rBody = req.body;
        client.channels.cache.get("872966064764506132").send(
          new Discord.MessageEmbed()
            .setTitle(`${req.user.username}`)
            .setColor("GREEN")
            .setFooter(config.footer)
            .setThumbnail(
              "https://cdn.discordapp.com/icons/760256683364188205/a_c0df129042bb90408b965a44f044e7a9.gif"
            )
            .setDescription(
              `** Yetkili admin kodu sildi / BDFD 
            ** `
            )
        );
      })

      .catch((err) => {
        console.log(err);
      });
  });

  app.get(
    "/admin/uye/bdfd-ekonomi",
    checkMaintence,
    checkAdmin,
    checkAuth,
    async (req, res, result) => {
      const botdata = await botsdata.find();
      const codedata = await codesSchema.find();
      const udata = await uptimedata.find();
      bdfdekonomi.find().then((result) => {
        renderTemplate(res, req, "admin/uyekod/bdfd-ekonomi.ejs", {
          req,
          bdfdekonomi: result,
          roles,
          config,
          codedata,
          botdata,
          udata,
          form: result,
        });
      });
    }
  );

  app.delete("/admin/uye/bdfd-ekonomi/:id", (req, res) => {
    const id = req.params.id;
    bdfdekonomi
      .findByIdAndDelete(id)
      .then((result) => {
        res.redirect(
          "https://themechanics-web.glitch.me/admin/uye/bdfd-ekonomi"
        );

        let rBody = req.body;
        client.channels.cache.get("872966064764506132").send(
          new Discord.MessageEmbed()
            .setTitle(`${req.user.username}`)
            .setColor("GREEN")
            .setFooter(config.footer)
            .setThumbnail(
              "https://cdn.discordapp.com/icons/760256683364188205/a_c0df129042bb90408b965a44f044e7a9.gif"
            )
            .setDescription(
              `** Yetkili admin kodu sildi  / BDFD
            ** `
            )
        );
      })

      .catch((err) => {
        console.log(err);
      });
  });

  app.get(
    "/admin/uye/bdfd-eglence",
    checkMaintence,
    checkAdmin,
    checkAuth,
    async (req, res, result) => {
      const botdata = await botsdata.find();
      const codedata = await codesSchema.find();
      const udata = await uptimedata.find();
      bdfdeglence.find().then((result) => {
        renderTemplate(res, req, "admin/uyekod/bdfd-eglence.ejs", {
          req,
          bdfdeglence: result,
          roles,
          config,
          codedata,
          botdata,
          udata,
          form,
        });
      });
    }
  );

  app.delete("/admin/uye/bdfd-eglence/:id", (req, res) => {
    const id = req.params.id;
    bdfdeglence
      .findByIdAndDelete(id)
      .then((result) => {
        res.redirect(
          "https://themechanics-web.glitch.me/admin/uye/bdfd-eglence"
        );

        let rBody = req.body;
        client.channels.cache.get("872966064764506132").send(
          new Discord.MessageEmbed()
            .setTitle(`${req.user.username}`)
            .setColor("GREEN")
            .setFooter(config.footer)
            .setThumbnail(
              "https://cdn.discordapp.com/icons/760256683364188205/a_c0df129042bb90408b965a44f044e7a9.gif"
            )
            .setDescription(
              `** Yetkili admin kodu sildi  / BDFD
            ** `
            )
        );
      })

      .catch((err) => {
        console.log(err);
      });
  });

  //---------------- Herkeze açk kod paylaşma  ADMİN sistemi  BİTTİ ---------------//

  app.get(
    "/admin",
    checkMaintence,
    checkAdmin,
    checkAuth,
    async (req, res, result) => {
      const botdata = await botsdata.find();
      const codedata = await codesSchema.find();
      const udata = await uptimedata.find();
      const from = await codesSchema.find();
      const prof = await codesSchema.find();
      form.find();
      renderTemplate(res, req, "admin/index.ejs", {
        req,
        testcode: result,
        roles,
        config,
        codedata,
        botdata,
        udata,
        form: result,
        prof: result,
      });
    }
  );
  // MINI PAGES
  app.get(
    "/admin/unapproved",
    checkMaintence,
    checkAdmin,
    checkAuth,
    async (req, res) => {
      const botdata = await botsdata.find();
      renderTemplate(res, req, "admin/unapproved.ejs", {
        req,
        roles,
        config,
        botdata,
        form,
      });
    }
  );
  app.get(
    "/admin/approved",
    checkMaintence,
    checkAdmin,
    checkAuth,
    async (req, res) => {
      const botdata = await botsdata.find();
      renderTemplate(res, req, "admin/approved.ejs", {
        req,
        roles,
        config,
        botdata,
        form,
      });
    }
  );
  app.get(
    "/admin/certificate-apps",
    checkMaintence,
    checkAdmin,
    checkAuth,
    async (req, res) => {
      const botdata = await botsdata.find();
      const apps = await appsdata.find();
      renderTemplate(res, req, "admin/certificate-apps.ejs", {
        req,
        roles,
        config,
        apps,
        botdata,
      });
    }
  );
  // SYSTEMS PAGES

  // CONFIRM BOT
  app.get(
    "/admin/confirm/:botID",
    checkMaintence,
    checkAdmin,
    checkAuth,
    async (req, res) => {
      const botdata = await botsdata.findOne({
        botID: req.params.botID,
      });
      if (!botdata)
        return res.redirect(
          "/error?code=404&message=Geçersiz bir bot kimliği girdiniz."
        );
      await botsdata.findOneAndUpdate(
        {
          botID: req.params.botID,
        },
        {
          $set: {
            status: "Approved",
            Date: Date.now(),
          },
        },
        function (err, docs) {}
      );
      client.users.fetch(req.params.botID).then((bota) => {
        client.channels.cache
          .get(channels.botlog)
          .send(
            `<@${botdata.ownerID}> Kişisinin **${bota.tag}** adlı botu **onaylanmıştır**. https://themechanics-web.glitch.me/bot/${bota.id} `
          );
        client.users.cache
          .get(botdata.ownerID)
          .send(
            `**${bota.tag}** adlı botun başarıyla onaylanmıştır. https://themechanics-web.glitch.me/bot/${bota.id}`
          );
      });
      let guild = client.guilds.cache.get(config.server.id);
      if (botdata.coowners) {
        botdata.coowners.map((a) => {
          guild.members.cache.get(a).roles.add(roles.botlist.developer);
        });
      }
      return res.redirect(
        `/admin/unapproved?success=true&message=Bot onaylandı.`
      );
    }
  );
  // DELETE BOT
  app.get(
    "/admin/delete/:botID",
    checkMaintence,
    checkAdmin,
    checkAuth,
    async (req, res) => {
      const botdata = await botsdata.findOne({
        botID: req.params.botID,
      });
      if (!botdata)
        return res.redirect(
          "/error?code=031&message=Geçersiz bir bot kimliği girdiniz."
        );
      let guild = client.guilds.cache.get(config.server.id);
      guild.members.cache.get(botdata.botID).roles.remove(roles.bot);
      await guild.members.cache.get(botdata.botID).kick();
      await botsdata.deleteOne({
        botID: req.params.botID,
        ownerID: botdata.ownerID,
      });
      return res.redirect(`/admin/approved?success=true&message=Bot silindi.`);
    }
  );
  // DECLINE BOT
  app.get(
    "/admin/decline/:botID",
    checkMaintence,
    checkAdmin,
    checkAuth,
    async (req, res) => {
      const botdata = await botsdata.findOne({
        botID: req.params.botID,
      });
      if (!botdata)
        return res.redirect(
          "/error?code=404&message=Geçersiz bir bot kimliği girdiniz."
        );
      renderTemplate(res, req, "admin/decline.ejs", {
        req,
        roles,
        config,
        botdata,
      });
    }
  );
  app.post(
    "/admin/decline/:botID",
    checkMaintence,
    checkAdmin,
    checkAuth,
    async (req, res) => {
      let rBody = req.body;
      let botdata = await botsdata.findOne({
        botID: req.params.botID,
      });
      client.users.fetch(botdata.ownerID).then((sahip) => {
        client.channels.cache
          .get(channels.botlog)
          .send(
            `<@${botdata.ownerID}> kişisinin **${botdata.username}** adlı botu **reddedildi**. `
          );
        client.users.cache
          .get(botdata.ownerID)
          .send(
            `**${botdata.username}** adlı botun reddedilmiştir.\nSebep: **${rBody["reason"]}**\nTarafından: **${req.user.username}**`
          );
      });
      await botsdata.deleteOne({
        botID: req.params.botID,
        ownerID: botdata.ownerID,
      });
      return res.redirect(
        `/admin/unapproved?success=true&message=Bot reddedildi.`
      );
    }
  );

  // CERTIFICATE
  app.get(
    "/admin/certified-bots",
    checkMaintence,
    checkAdmin,
    checkAuth,
    async (req, res) => {
      const botdata = await botsdata.find();
      renderTemplate(res, req, "admin/certified-bots.ejs", {
        req,
        roles,
        config,
        botdata,
      });
    }
  );
  app.get(
    "/admin/certificate/give/:botID",
    checkMaintence,
    checkAdmin,
    checkAuth,
    async (req, res) => {
      await botsdata.findOneAndUpdate(
        {
          botID: req.params.botID,
        },
        {
          $set: {
            certificate: "Certified",
          },
        },
        function (err, docs) {}
      );
      let botdata = await botsdata.findOne({
        botID: req.params.botID,
      });

      client.users.fetch(botdata.botID).then((bota) => {
        client.channels.cache
          .get(channels.botlog)
          .send(
            `<@${botdata.ownerID}> kişisinin **${bota.tag}** adlı botuna **sertifika** verilmiştir.`
          );
        client.users.cache
          .get(botdata.ownerID)
          .send(`**${bota.tag}** adlı botuna **sertifika** verilmiştir.`);
      });
      await appsdata.deleteOne({
        botID: req.params.botID,
      });
      let guild = client.guilds.cache.get(config.server.id); //rol veriyo normalde sertifikada otomatik onu engelledim karşim
      if (botdata.coowners) {
        botdata.coowners.map((a) => {
          if (guild.members.cache.get(a)) {
          }
        });
      }
      return res.redirect(
        `/admin/certificate-apps?success=true&message=Certificate gived.&botID=${req.params.botID}`
      );
    }
  );
  app.get(
    "/admin/certificate/delete/:botID",
    checkMaintence,
    checkAdmin,
    checkAuth,
    async (req, res) => {
      const botdata = await botsdata.findOne({
        botID: req.params.botID,
      });
      if (!botdata)
        return res.redirect(
          "/error?code=404&message=Geçersiz bir bot kimliği girdiniz."
        );
      renderTemplate(res, req, "admin/certificate-delete.ejs", {
        req,
        roles,
        config,
        botdata,
      });
    }
  );
  app.post(
    "/admin/certificate/delete/:botID",
    checkMaintence,
    checkAdmin,
    checkAuth,
    async (req, res) => {
      let rBody = req.body;
      await botsdata.findOneAndUpdate(
        {
          botID: req.params.botID,
        },
        {
          $set: {
            certificate: "None",
          },
        },
        function (err, docs) {}
      );
      let botdata = await botsdata.findOne({
        botID: req.params.botID,
      });
      client.users.fetch(botdata.botID).then((bota) => {
        client.channels.cache
          .get(channels.botlog)
          .send(
            `<@${botdata.ownerID}> kişisinin **${bota.tag}** adlı botundaki **sertifika** silinmiştir .`
          );
        client.users.cache
          .get(botdata.ownerID)
          .send(
            `**${bota.tag}** adlı botunuzdaki **sertifikanız silinmiştir** .\nSebep: **${rBody["reason"]}**`
          );
      });
      await appsdata.deleteOne({
        botID: req.params.botID,
      });
      let guild = client.guilds.cache.get(config.server.id);
      guild.members.cache
        .get(botdata.botID)
        .roles.remove(roles.botlist.certified_bot);
      guild.members.cache
        .get(botdata.ownerID)
        .roles.remove(roles.botlist.certified_developer);
      return res.redirect(
        `/admin/certificate-apps?success=true&message=Sertifika Silindi.`
      );
    }
  );

  // CODE SHARE
  app.get(
    "/admin/codes",
    checkMaintence,
    checkAdmin,
    checkAuth,
    async (req, res) => {
      let koddata = await codesSchema.find();
      renderTemplate(res, req, "admin/codes.ejs", {
        req,
        roles,
        config,
        koddata,
      });
    }
  );
  // ADDCODE
  app.get(
    "/admin/addcode",
    checkMaintence,
    checkAdmin,
    checkAuth,
    async (req, res) => {
      renderTemplate(res, req, "admin/addcode.ejs", {
        req,
        roles,
        config,
      });
    }
  );
  app.post(
    "/admin/addcode",
    checkMaintence,
    checkAdmin,
    checkAuth,
    async (req, res) => {
      const rBody = req.body;
      let kod = makeid(5);
      await new codesSchema({
        code: kod,
        codeName: rBody["codename"],
        codeCategory: rBody["category"],
        codeDesc: rBody["codedesc"],
      }).save();
      if (rBody["main"]) {
        await codesSchema.updateOne(
          {
            code: kod,
          },
          {
            $set: {
              main: req.body.main,
            },
          }
        );
      }
      if (rBody["commands"]) {
        await codesSchema.updateOne(
          {
            code: kod,
          },
          {
            $set: {
              commands: req.body.commands,
            },
          }
        );
      } //[**${req.user.username}(https://z/user/${a.id})
      client.channels.cache.get("760272032662552596").send(
        `**[${req.user.username}](https://themechanics-web.glitch.me/codes/${req.body.category}
            })** kişisi sisteme **${rBody["codename"]}** adıyla bir kod ekledi`
      );
    }
  );

  // EDITCODE
  app.get(
    "/admin/editcode/:code",
    checkMaintence,
    checkAdmin,
    checkAuth,
    async (req, res) => {
      let kod = req.params.code;
      let koddata = await codesSchema.findOne({
        code: kod,
      });
      if (!koddata)
        return res.redirect(
          "/codes?error=true&message=Geçersiz bir kod girdiniz."
        );
      renderTemplate(res, req, "admin/editcode.ejs", {
        req,
        roles,
        config,
        koddata,
      });
    }
  );
  app.post(
    "/admin/editcode/:code",
    checkMaintence,
    checkAdmin,
    checkAuth,
    async (req, res) => {
      const rBody = req.body;
      let kod = req.params.code;
      await codesSchema.findOneAndUpdate(
        {
          code: kod,
        },
        {
          $set: {
            codeName: rBody["codename"],
            codeCategory: rBody["category"],
            codeDesc: rBody["codedesc"],
            main: rBody["main"],
            commands: rBody["commands"],
          },
        },
        function (err, docs) {}
      );
      client.channels.cache
        .get(channels.codelog)
        .send(
          new Discord.MessageEmbed()
            .setThumbnail(
              "https://cdn.discordapp.com/icons/760256683364188205/a_c0df129042bb90408b965a44f044e7a9.gif"
            )
            .setTitle("Kod Düzenlendi!")
            .setColor("GREEN")
            .setDescription(
              `**${req.user.username}#${req.user.discriminator}** adlı yetkili **${rBody["codename"]}** isimli kodu düzenledi.`
            )
            .addField(
              "Kod Linki",
              `[Buraya Tıkla](https://themechanics-web.glitch.me/code/${kod})`,
              true
            )
            .addField("Kod Açıklaması", rBody["codedesc"], true)
            .addField("Kod Kategorisi", rBody["category"], true)
        );
      res.redirect("/code/" + kod);
    }
  );
  // DELETECODE
  app.get(
    "/admin/deletecode/:code",
    checkMaintence,
    checkAdmin,
    checkAuth,
    async (req, res) => {
      await codesSchema.deleteOne({
        code: req.params.code,
      });
      return res.redirect("/admin/codes?error=true&message=Code deleted.");
    }
  );

  // UPTIME
  // UPTIMES
  app.get(
    "/admin/uptimes",
    checkMaintence,
    checkAdmin,
    checkAuth,
    async (req, res) => {
      let updata = await uptimeSchema.find();
      renderTemplate(res, req, "admin/uptimes.ejs", {
        req,
        roles,
        config,
        updata,
      });
    }
  );
  app.get(
    "/admin/deleteuptime/:code",
    checkMaintence,
    checkAdmin,
    checkAuth,
    async (req, res) => {
      await uptimeSchema.deleteOne({
        code: req.params.code,
      });
      return res.redirect("../admin/uptimes?error=true&message=Link deleted.");
    }
  );

  app.get(
    "/admin/maintence",
    checkMaintence,
    checkAdmin,
    checkAuth,
    async (req, res) => {
      if (!config.bot.owners.includes(req.user.id))
        return res.redirect("../admin");
      let bandata = await banSchema.find();
      renderTemplate(res, req, "/admin/administrator/maintence.ejs", {
        req,
        roles,
        config,
        bandata,
      });
    }
  );
  app.post(
    "/admin/maintence",
    checkMaintence,
    checkAdmin,
    checkAuth,
    async (req, res) => {
      if (!config.bot.owners.includes(req.user.id))
        return res.redirect("../admin");
      let bakimdata = await maintenceSchema.findOne({
        server: config.server.id,
      });
      if (bakimdata)
        return res.redirect(
          "../admin/maintence?error=true&message=Bu site için bakım modu zaten etkinleştirildi."
        );
      client.channels.cache
        .get(channels.webstatus)
        .send(`Site **${req.body.reason}** Sebebi ile bakım moduna alınmıştır`)
        .then((a) => {
          new maintenceSchema({
            server: config.server.id,
            reason: req.body.reason,
            bakimmsg: a.id,
          }).save();
        });
      return res.redirect(
        "../admin/maintence?success=true&message=Bakım aktifleştirildi."
      );
    }
  );
  app.post(
    "/admin/unmaintence",
    checkMaintence,
    checkAdmin,
    checkAuth,
    async (req, res) => {
      const dc = require("discord.js");
      if (!config.bot.owners.includes(req.user.id))
        return res.redirect("../admin");
      let bakimdata = await maintenceSchema.findOne({
        server: config.server.id,
      });
      if (!bakimdata)
        return res.redirect(
          "../admin/maintence?error=true&message=Web sitesi zaten bakım modunda değil."
        );
      const bakimsonaerdikardesvcodes = new dc.MessageEmbed()
        .setAuthor("", client.user.avatarURL())
        .setThumbnail(client.user.avatarURL()) //1dk
        .setColor("GREEN"); //tamam sikerler elleme uğraşamam //hayır elleşem
      //tamam amk edit yapma siteye giremiyorum - oto kaydetmeyi kapatak //tm
      //o mesajı tanımlamıilar bir yerden amk nerde bulamıyorum onu silsem olucak
      await client.channels.cache
        .get(channels.webstatus)
        .messages.fetch(bakimdata.bakimmsg)
        .then((a) => {
          a.delete;
          a.channel.send(
            `~~**${bakimdata.reason}**~~ Adlı sebepten bakım moduna alınan site tekrardan hizmet vermektedir`,
            bakimsonaerdikardesvcodes
          ); //editleme kodu yok ki aq kapatınca normal embed mesaj atıyor
        });
      client.channels.cache
        .get(channels.webstatus)
        .send(".")
        .then((b) => {
          b.delete({
            timeout: 500,
          });
        });
      await maintenceSchema.deleteOne(
        {
          server: config.server.id,
        },
        function (error, server) {
          if (error) console.log(error);
        }
      );
      return res.redirect(
        "../admin/maintence?success=true&message=Bakım modu başarıyla kapatıldı."
      );
    }
  );
  app.get(
    "/admin/userban",
    checkMaintence,
    checkAdmin,
    checkAuth,
    async (req, res) => {
      if (!config.bot.owners.includes(req.user.id))
        return res.redirect("../admin");
      let bandata = await banSchema.find();
      renderTemplate(res, req, "/admin/administrator/user-ban.ejs", {
        req,
        roles,
        config,
        bandata,
      });
    }
  );
  app.get(
    "/admin/yarisma",
    checkMaintence,
    checkAdmin,
    checkAuth,
    async (req, res) => {
      if (!config.bot.owners.includes(req.user.id))
        return res.redirect("../admin");
      let pr = await prof.find();
      renderTemplate(res, req, "/admin/administrator/yarisma.ejs", {
        req,
        roles,
        config,
        pr,
        prof,
      });
    }
  );
  app.post(
    "/admin/userban",
    checkMaintence,
    checkAdmin,
    checkAuth,
    async (req, res) => {
      if (!config.bot.owners.includes(req.user.id))
        return res.redirect("../admin");
      new banSchema({
        user: req.body.userID,
        sebep: req.body.reason,
        yetkili: req.user.id,
      }).save();
      return res.redirect(
        "../admin/userban?success=true&message=Kullanıcı banlandı."
      );
    }
  );
  app.post(
    "/admin/userunban",
    checkMaintence,
    checkAdmin,
    checkAuth,
    async (req, res) => {
      if (!config.bot.owners.includes(req.user.id))
        return res.redirect("../admin");
      banSchema.deleteOne(
        {
          user: req.body.userID,
        },
        function (error, user) {
          if (error) console.log(error);
        }
      );
      return res.redirect(
        "../admin/userban?success=true&message=Kullanıcı yasağı kaldırıldı."
      );
    }
  );

  app.get(
    "/admin/partners",
    checkMaintence,
    checkAdmin,
    checkAuth,
    async (req, res) => {
      if (!config.bot.owners.includes(req.user.id))
        return res.redirect("../admin");
      const Database = require("void.db");
      const db = new Database(
        path.join(__dirname, "./database/json/partners.json")
      );
      renderTemplate(res, req, "/admin/administrator/partners.ejs", {
        req,
        roles,
        config,
        db,
      });
    }
  );
  app.post(
    "/admin/partners",
    checkMaintence,
    checkAdmin,
    checkAuth,
    async (req, res) => {
      if (!config.bot.owners.includes(req.user.id))
        return res.redirect("../admin");
      const Database = require("void.db");
      const db = new Database(
        path.join(__dirname, "./database/json/partners.json")
      );
      db.push(`partners`, {
        code: createID(12),
        icon: req.body.icon,
        ownerID: req.body.ownerID,
        serverName: req.body.serverName,
        website: req.body.Website,
        description: req.body.partnerDesc,
      });
      let x = client.guilds.cache
        .get(config.server.id)
        .members.cache.get(req.body.ownerID);
      if (x) {
        x.roles.add(roles.profile.partnerRole);
      }
      return res.redirect(
        "/admin/partners?success=true&message=Partner eklendi."
      );
    }
  );
  //---------------- ADMIN ---------------\\

  //------------------- PROFILE -------------------//

  const profiledata = require("./database/models/profile.js");
  app.get("/user/:userID", checkMaintence, async (req, res) => {
    client.users.fetch(req.params.userID).then(async (a) => {
      let codecount = await codesSchema.find({
        sharer: a.id,
      });
      const pdata = await profiledata.findOne({
        userID: a.id,
      });
      const botdata = await botsdata.find();
      const member = a;
      const uptimecount = await uptimedata.find({
        userID: a.id,
      });
      renderTemplate(res, req, "profile/profile.ejs", {
        member,
        req,
        roles,
        config,
        codecount,
        uptimecount,
        pdata,
        botdata,
        form,
        mc,
      });
    });
  });
  app.get("/user/:userID/edit", checkMaintence, checkAuth, async (req, res) => {
    client.users.fetch(req.user.id).then(async (member) => {
      const pdata = await profiledata.findOne({
        userID: member.id,
      });
      renderTemplate(res, req, "profile/profile-edit.ejs", {
        member,
        req,
        roles,
        config,
        pdata,
        member,
        form,
      });
    });
  });
  app.post(
    "/user/:userID/edit",
    checkMaintence,
    checkAuth,
    async (req, res) => {
      let rBody = req.body;
      await profiledata.findOneAndUpdate(
        {
          userID: req.user.id,
        },
        {
          $set: {
            biography: rBody["biography"],
            website: rBody["website"],
            github: rBody["github"],
            twitter: rBody["twitter"],
            instagram: rBody["instagram"],
          },
        },
        {
          upsert: true,
        }
      );
      return res.redirect(
        "?success=true&message=Profilin Başarıyla Düzenlendi."
      );
    }
  );

  app.post(
    "/user/:userID/coin/edit",
    checkMaintence,
    checkAuth,
    async (req, res) => {
      let rBody = req.body;
      await profiledata.findOneAndUpdate(
        {
          userID: req.user.id,
        },
        {
          $set: {
            webcoin: 0,
            maas: false,
          },
        },
        {
          upsert: true,
        }
      );
      return res.redirect(
        "?success=true&message=Profilin Başarıyla Düzenlendi."
      );
    }
  );
  //------------------- PROFILE -------------------//
  app.set("json spaces", 1);
  //------------------- API  -------------------//
  app.get("/api/bots/:botID", async (req, res) => {
    const botinfo = await botsdata.findOne({
      botID: req.params.botID,
    });

    if (!botinfo)
      return res.json({
        error: "Geçersiz bot girdiniz.",
      });

    res.json({
      avatar: botinfo.avatar,
      botID: botinfo.botID,
      username: botinfo.username,
      discrim: botinfo.discrim,
      shortDesc: botinfo.shortDesc,
      prefix: botinfo.prefix,
      votes: botinfo.votes,
      voteuser: botinfo.voteuser,
      ownerID: botinfo.ownerID,
      owner: botinfo.ownerName,
      coowners: botinfo.coowners,
      tags: botinfo.tags,
      longDesc: botinfo.longDesc,
      certificate: botinfo.certificate,
      github: botinfo.github,
      support: botinfo.support,
      website: botinfo.website,
    });
  });
  app.get("/api/bots/check/:userID/:token", async (req, res) => {
    let token = req.params.token;
    if (!token)
      return res.json({
        error: "Bir bot tokeni girmelisiniz.",
      });
    if (!req.params.userID)
      return res.json({
        error: "Bir kullanıcı kimliği girmelisiniz.",
      });
    const botdata = await botsdata.findOne({
      token: token,
    });
    if (!botdata)
      return res.json({
        error: "Geçersiz bir bot tokeni girdiniz.",
      });
    const vote = await voteSchema.findOne({
      bot: botdata.botID,
      user: req.params.userID,
    });
    if (vote) {
      res.json({
        voted: true,
      });
    } else {
      res.json({
        voted: false,
      });
    }
  });
  app.post("/api/bots/stats", async (req, res) => {
    let token = req.header("Authorization");
    if (!token)
      return res.json({
        error: "Bir bot tokeni girmelisiniz.",
      });
    const botdata = await botsdata.findOne({
      token: token,
    });
    if (!botdata)
      return res.json({
        error: "Geçersiz bir bot tokeni girdiniz.",
      });
    if (botdata) {
      return await botsdata.update(
        {
          botID: botdata.botID,
        },
        {
          $set: {
            serverCount: req.header("serverCount"),
          },
        }
      );
    }
  });

  //------------------- API -------------------//    //------------------- API -------------------//
  app.get("/404", checkMaintence, async (req, res) => {
    const botdata = await botsdata.find();
    const patlats = await patlat.find().sort({ Date: -1 });
    const bakimmod = await bakim.findOne({ bakımmod: "aktif" });

    renderTemplate(res, req, "hata.ejs", {
      config,
      roles,
      botdata,
      getuser,
      bakim,
      patlats,
    });
  });

  //------------------- APP -------------------//
  app.get("/app/welcome", checkMaintence, checkAuth, async (req, res) => {
    client.users.fetch(req.user.id).then(async (member) => {
      const pdata = await profiledata.findOne({
        userID: member.id,
      });
      renderTemplate(res, req, "app/welcome.ejs", {
        member,
        req,
        roles,
        config,
        pdata,
        member,
        form,
      });
    });
  });

  app.get("/app/profile", checkMaintence, checkAuth, async (req, res) => {
    client.users.fetch(req.user.id).then(async (member) => {
      const pdata = await profiledata.findOne({
        userID: member.id,
      });
      renderTemplate(res, req, "app/profile.ejs", {
        member,
        req,
        roles,
        config,
        pdata,
        member,
        form,
      });
    });
  });

  app.get("/app/add/server", checkMaintence, checkAuth, async (req, res) => {
    client.users.fetch(req.user.id).then(async (member) => {
      const pdata = await profiledata.findOne({
        userID: member.id,
      });
      renderTemplate(res, req, "app/add/server.ejs", {
        member,
        req,
        roles,
        config,
        pdata,
        member,
        form,
      });
    });
  });

  app.get("/app/user/settings", checkMaintence, checkAuth, async (req, res) => {
    client.users.fetch(req.user.id).then(async (member) => {
      const pdata = await profiledata.findOne({
        userID: member.id,
      });
      renderTemplate(res, req, "app/user/mpanel.ejs", {
        member,
        req,
        roles,
        config,
        pdata,
        member,
        form,
      });
    });
  });

  app.post("/add/server", checkMaintence, checkAuth, async (req, res) => {
    const pdata = await profiledata.findOne({
      userID: req.user.id,
    });
    console.log(req.body);
    server.Send({ serverID: "854646" });
    res.redirect("/app/welcome/?success=true&message=testtm");
  });

  //public sunucu sistemi
  app.get(`/server/:userID`, checkMaintence, checkAuth, async (req, res) => {
    client.users.fetch(req.user.id).then(async (member) => {
      const pdata = await profiledata.findOne({
        userID: member.id,
      });
      renderTemplate(res, req, "server/index.ejs", {
        member,
        req,
        roles,
        config,
        pdata,
        member,
        form,
      });
    });
  });

  app.post(
    "/login/server/control",
    checkMaintence,
    checkAuth,
    async (req, res) => {
      const pdata = await profiledata.findOne({
        userID: req.user.id,
      });
      if (pdata.serverSituation == "bakim") {
        res.status(15).redirect("/server/err/care");
      }
      if (pdata.serverSituation == "kapalı") {
        res.status(16).redirect("/server/err/off");
      }
      if (pdata.serverSituation == "aktif") {
        let sıd = req.user.id;
        res.status(14).redirect(`/server/${sıd}`);
      }
    }
  );

  //MARKET//

  app.get("/market", checkMaintence, async (req, res) => {
    const botdata = await botsdata.find();
    const patlats = await patlat.find().sort({ Date: -1 });
    const bakimmod = await bakim.findOne({ bakımmod: "aktif" });
    if (bakimmod) {
      renderTemplate(res, req, "404/bakım.ejs", {
        config,
        roles,
        botdata,
        getuser,
      });
    }

    renderTemplate(res, req, "market/index.ejs", {
      config,
      roles,
      botdata,
      getuser,
      bakim,
      patlats,
    });
  });

  
  // market 2ad 
    app.get(`/2adk/:id`, checkMaintence, async (req, res) => {
          let czsd = await mpanel.findOne({
        _id: req.params.id
      });
      let id = czsd._id;
      let sss = czsd.twouveryf == true
      
      if(!sss){
         renderTemplate(res, req, "./market/2ad/index.ejs", {
      config,
      roles,
      getuser,
      bakim,
    });
      }else{
    res.render("Kod daha önceden doğrulanmış")
      }
     
     
  });
  
   app.post(
    "/2ad/profile/active",
    checkMaintence,
    checkAuth,
    async (req, res) => {
   let rb = req.body
   
   if(rb.dc == "on") {
     console.log("dc on")
   }
      if(rb.ep == "on") {
     console.log("dc on")
   }
      if(rb.kls == "on") {
     console.log("dc on")
   }
    }
  );
  //2ad bitti
  
  app.use((req, res) => {
    res.status(404).redirect("/404");
  });
};

function makeid(length) {
  var result = "";
  var characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

function createID(length) {
  var result = "";
  var characters = "123456789";
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

function makeidd(length) {
  var result = "";
  var characters =
    "123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

function makeToken(length) {
  var result = "";
  var characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

function getuser(id) {
  try {
    return client.users.fetch(id);
  } catch (error) {
    return undefined;
  }
}
