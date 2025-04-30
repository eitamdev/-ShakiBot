module.exports = {
    name: '+clear',
    execute(message, args, client, distube) {
      if (!hasDJRole(message.member)) return message.reply('❌ Seuls les DJs peuvent vider la file !');
      const queue = distube.getQueue(message.guild);
      if (!queue) return message.reply('❌ Aucune chanson en cours de lecture.');
      try {
        queue.songs = [queue.songs[0]]; // Garde la chanson en cours
        message.reply('🧹 File d\'attente vidée (sauf chanson en cours).');
      } catch (err) {
        console.error(err);
        message.reply('❌ Une erreur est survenue.');
      }
    },
  };
  
  function hasDJRole(member) {
    return member.roles.cache.some(role => role.name.toLowerCase() === 'dj');
  }