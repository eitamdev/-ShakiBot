module.exports = {
    name: '+volume',
    async execute(message, args, client, distube) {
      const queue = distube.getQueue(message.guild);
      if (!queue) return message.reply('❌ Aucune chanson en cours de lecture.');
      if (!args[0]) return message.reply(`🔊 Volume actuel : ${queue.volume}%. Utilise !volume <nombre> pour changer.`);
      const volume = parseInt(args[0]);
      if (isNaN(volume) || volume < 0 || volume > 100) {
        return message.reply('❌ Le volume doit être un nombre entre 0 et 100.');
      }
      try {
        await distube.setVolume(message.guild, volume);
        message.reply(`🔊 Volume réglé à ${volume}%.`);
      } catch (err) {
        console.error(err);
        message.reply('❌ Une erreur est survenue.');
      }
    },
  };