module.exports = {
    name: '+seek',
    async execute(message, args, client, distube) {
      const queue = distube.getQueue(message.guild);
      if (!queue) return message.reply('❌ Aucune chanson en cours de lecture.');
      if (!args[0]) return message.reply('❌ Utilise !seek <secondes>.');
      const seconds = parseInt(args[0]);
      if (isNaN(seconds) || seconds < 0) {
        return message.reply('❌ Les secondes doivent être un nombre positif.');
      }
      try {
        await distube.seek(message.guild, seconds);
        message.reply(`⏰ Avancé à ${seconds} secondes.`);
      } catch (err) {
        console.error(err);
        message.reply('❌ Une erreur est survenue ou temps invalide.');
      }
    },
  };