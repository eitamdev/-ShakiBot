module.exports = {
    name: '+skip',
    async execute(message, args, client, distube) {
      if (!hasDJRole(message.member)) return message.reply('❌ Seuls les DJs peuvent sauter la chanson !');
      const queue = distube.getQueue(message.guild);
      if (!queue) return message.reply('❌ Aucune chanson en cours de lecture.');
      if (queue.songs.length <= 1) return message.reply('❌ Aucune chanson suivante dans la file.');
      try {
        await distube.skip(message.guild);
        message.reply('⏭️ Chanson suivante.');
      } catch (err) {
        console.error(err);
        message.reply('❌ Une erreur est survenue ou aucune chanson à passer.');
      }
    },
  };
  
  function hasDJRole(member) {
    return member.roles.cache.some(role => role.name.toLowerCase() === 'dj');
  }