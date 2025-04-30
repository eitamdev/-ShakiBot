module.exports = {
    name: '+filter',
    async execute(message, args, client, distube) {
      const queue = distube.getQueue(message.guild);
      if (!queue) return message.reply('❌ Aucune chanson en cours de lecture.');
      const filter = args[0]?.toLowerCase();
      if (!filter) return message.reply('❌ Utilise !filter <nom|clear> (ex. bassboost, 8d).');
      try {
        if (filter === 'clear') {
          await distube.setFilter(message.guild, false);
          message.reply('🧼 Filtres supprimés.');
        } else {
          await distube.setFilter(message.guild, filter);
          message.reply(`🎛️ Filtre appliqué : ${filter}.`);
        }
      } catch (err) {
        console.error(err);
        message.reply('❌ Filtre invalide ou erreur survenue. Filtres disponibles : bassboost, 8d, nightcore, vaporwave, etc.');
      }
    },
  };