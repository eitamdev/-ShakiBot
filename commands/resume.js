module.exports = {
    name: '+resume',
    async execute(message, args, client, distube) {
      const queue = distube.getQueue(message.guild);
      if (!queue) return message.reply('❌ Aucune chanson en cours de lecture.');
      if (!queue.paused) return message.reply('❌ La lecture n\'est pas en pause.');
      try {
        await distube.resume(message.guild);
        message.reply('▶️ Lecture reprise.');
      } catch (err) {
        console.error(err);
        message.reply('❌ Une erreur est survenue.');
      }
    },
  };