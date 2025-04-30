module.exports = {
    name: '+stop',
    async execute(message, args, client, distube) {
      if (!hasDJRole(message.member)) return message.reply('❌ Seuls les DJs peuvent arrêter la lecture !');
      const queue = distube.getQueue(message.guild);
      if (!queue) return message.reply('❌ Aucune chanson en cours de lecture.');
      try {
        await distube.stop(message.guild);
        message.reply('⏹️ Lecture arrêtée et file vidée.');
      } catch (err) {
        console.error(err);
        message.reply('❌ Une erreur est survenue.');
      }
    },
  };
  
  function hasDJRole(member) {
    return member.roles.cache.some(role => role.name.toLowerCase() === 'dj');
  }