const { EmbedBuilder } = require('discord.js');
const { totalSongsPlayed, totalPlayTime } = require('../client');

module.exports = {
  name: '+stats',
  execute(message, args, client, distube) {
    const embed = new EmbedBuilder()
      .setColor('#00FF99')
      .setTitle('📊 Statistiques du bot')
      .addFields(
        { name: 'Chansons jouées', value: `${totalSongsPlayed}`, inline: true },
        { name: 'Temps total', value: `${Math.floor(totalPlayTime / 60)} minutes`, inline: true },
        { name: 'Serveurs actifs', value: `${client.guilds.cache.size}`, inline: true }
      )
      .setTimestamp();
    message.reply({ embeds: [embed] });
  },
};