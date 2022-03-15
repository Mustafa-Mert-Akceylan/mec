module.exports = {
  bot: {
    token: process.env['token'],
    prefix: "+",
    owners: ["401706174778572800" , "771311848993587210" , "807863820977831946","661827402069966869"],
    mongourl: process.env['mongo'],
      
  },

  website: {
    callback: "https://themechanics.gq/callback",
    secret: process.env['mongo'],
    clientID: "902586375805739038",
    tags: [
      "Moderasyon",
      "Eğlence",
      "Minecraft",
      "Ekonomi",
      "Koruma",
      "NSFW",
      "Anime",
      "Davet",
      "Müzik",
      "Logging",
      "Web Dashboard",
      "Reddit",
      "Youtube",
      "Twitch",
      "Crypto",
      "Level Sistemi",
      "Oyun",
      "Rol Yapma / Roleplay",
      "Yarar",
      "Türkçe"
    ]
  },

  server: {
    id: "760256683364188205",
    serverid: "842385252340072460",
    roles: {
      yonetici: "848288379648475140",
      moderator: "851038889152872478",
      codeshare:"909909546930176000",
      kp: "848288379648475140",
      sitecreator: "606828535423959041",
      profile: {
        sponsor: "825443775039406101",
        bughunter:"901807580265984061",
        booster: "760260510611669023",
        özel:"888474567381753906",
        p1:"764759062000566314",
        p2:"792084588218155078",
        p25:"917413340878364702",
        p3:"909549881893466202",
        p4:"909556873613701130",
        supporter: "852167808421855252",
        destekci: "760260510611669023",
        level1: "909817167736868914",
        level2: "909818755171893318",
        level3: "909820001874231367",
        level4: "909819033635913780",
        level5: "909820579673149440",
        davet1: "812091174500171826",
        davet2: "812091232485769267",
        davet3: "812091306305388555",
        davet4: "812091364887625838",
        davet5: "812091407757475849",
        davet6: "812091446399860766",
        davet7: "812091499809996871"
      },
      codeshare: {
        bdfd: "788150909141254165",
        aoijs: "788150909141254165",
        javascript: "788150909141254165",
        html: "788150909141254165"
      },
      botlist: {
        developer: "851388120489394187",
        certified_developer: "851388220968271902",
        bot: "851038845624385546",
        certified_bot: "851038845624385546"
      }
    },
    channels: {
      codelog: "760272032662552596",
      login: "851072392603631636",
      webstatus: "851029904258498580",
      uptimelog: "851072325150441492",
      botlog: "851072287696093194",
      votes: "851072287696093194",
      voteLog: "901726551811428353"
    }
  },
   yardım: {
  kod:"zort"
    }
};
