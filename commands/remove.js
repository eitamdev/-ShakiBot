module.exports = {
    name: '+remove',
    execute(message, args, client, distube) {
      if (!hasDJRole(message.member)) return message.reply('❌ Seuls les DJs peuvent supprimer une chanson !');
      const queue = distube.getQueue(message.guild);
      if (!queue) return message.reply('❌ Aucune chanson en cours de lecture.');
      if (!args[0]) return message.reply('❌ Utilise !remove <numéro>.');
      const index = parseInt(args[0]) - 1;
      if (isNaN(index) || index < 0 || index >= queue.songs.length) {
        return message.reply('❌ Numéro de chanson invalide.');
      }
      try {
        const removedSong = queue.songs[index];
        queue.songs.splice(index, 1);
        message.reply(`🗑️ Supprimé : [${removedSong.name}](${removedSong.url}).`);
      } catch (err) {
        console.error(err);
        message.reply('❌ Une erreur est survenue.');
      }
    },
  };
  
  function hasDJRole(member) {
    return member.roles.cache.some(role => role.name.toLowerCase() === 'dj');
  }