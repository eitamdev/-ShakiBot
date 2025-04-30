const { EmbedBuilder } = require('discord.js');
const { getLyrics } = require('../utils/genius');

module.exports = {
  name: '+lyrics',
  async execute(message, args, client, distube) {
    const queue = distube.getQueue(message.guild);
    if (!queue) return message.reply('❌ Aucune chanson en cours de lecture.');
    const song = queue.songs[0];
    try {
      const lyrics = await getLyrics(song.name);
      const embed = new EmbedBuilder()
        .setColor('#FFD700')
        .setTitle(`🎤 Paroles : ${song.name}`)
        .setDescription(lyrics.slice(0, 2000) || 'Aucune parole trouvée.')
        .setTimestamp();
      message.reply({ embeds: [embed] });
    } catch (err) {
      console.error(err);
      message.reply('❌ Une erreur est survenue lors de la récupération des paroles.');
    }
  },
};