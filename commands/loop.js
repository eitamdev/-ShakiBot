module.exports = {
    name: '+loop',
    async execute(message, args, client, distube) {
      const queue = distube.getQueue(message.guild);
      if (!queue) return message.reply('❌ Aucune chanson en cours de lecture.');
      const mode = args[0]?.toLowerCase();
      let repeatMode;
      if (mode === 'off') repeatMode = 0;
      else if (mode === 'song') repeatMode = 1;
      else if (mode === 'queue') repeatMode = 2;
      else return message.reply('❌ Utilise !loop <off|song|queue>.');
      try {
        await distube.setRepeatMode(message.guild, repeatMode);
        const modeText = repeatMode === 0 ? 'désactivée' : repeatMode === 1 ? 'chanson' : 'file';
        message.reply(`🔁 Répétition ${modeText}.`);
      } catch (err) {
        console.error(err);
        message.reply('❌ Une erreur est survenue.');
      }
    },
  };