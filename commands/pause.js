module.exports = {
    name: '+pause',
    async execute(message, args, client, distube) {
      const queue = distube.getQueue(message.guild);
      if (!queue) return message.reply('❌ Aucune chanson en cours de lecture.');
      if (queue.paused) return message.reply('❌ La lecture est déjà en pause.');
      try {
        await distube.pause(message.guild);
        message.reply('⏸️ Lecture en pause.');
      } catch (err) {
        console.error(err);
        message.reply('❌ Une erreur est survenue.');
      }
    },
  };