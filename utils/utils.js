function getMutualGuilds(kullanıcıSunucuları, sunucular) {
  const validGuilds = kullanıcıSunucuları.filter(
    guild => (guild.permissions & 0x8) === 0x8
  );
  const included = [];
  const excluded = validGuilds.filter(guild => {
    const findGuild = sunucular.find(g => g.id === guild.id);
    if (!findGuild) return guild;
    included.push(findGuild);
  });

  return { excluded, included };
}

module.exports = { getMutualGuilds };
