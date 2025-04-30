module.exports = {
    name: '+jump',
    async execute(message, args, client, distube) {
      if (!hasDJRole(message.member)) return message.reply('❌ Seuls les DJs peuvent sauter à une chanson !');
      const queue = distube.getQueue(message.guild);
      if (!queue) return message.reply('❌ Aucune chanson en cours de lecture.');
      if (!args[0]) return message.reply('❌ Utilise !jump <numéro>.');
      const index = parseInt(args[0]) - 1;
      if (isNaN(index) || index < 0 || index >= queue.songs.length) {
        return message.reply('❌ Numéro de chanson invalide.');
      }
      try {
        await distube.jump(message.guild, index);
        message.reply(`⏩ Sauté à la chanson numéro ${index + 1}.`);
      } catch (err) {
        console.error(err);
        message.reply('❌ Une erreur est survenue.');
      }
    },
  };
  
  function hasDJRole(member) {
    return member.roles.cache.some(role => role.name.toLowerCase() === 'dj');
  }