module.exports = {
    name: '+shuffle',
    async execute(message, args, client, distube) {
      const queue = distube.getQueue(message.guild);
      if (!queue) return message.reply('❌ Aucune chanson en cours de lecture.');
      try {
        await distube.shuffle(message.guild);
        message.reply('🔀 File mélangée.');
      } catch (err) {
        console.error(err);
        message.reply('❌ Une erreur est survenue.');
      }
    },
  };