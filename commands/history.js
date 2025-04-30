const { EmbedBuilder } = require('discord.js');
const { songHistory } = require('../client');

module.exports = {
  name: '+history',
  execute(message, args, client, distube) {
    const guildId = message.guild.id;
    const history = songHistory.get(guildId) || [];
    if (!history.length) return message.reply('❌ Aucun historique de chansons.');
    const songs = history
      .map((song, index) => `${index + 1}. [${song.name}](${song.url}) - ${song.user} (${new Date(song.timestamp).toLocaleTimeString()})`)
      .join('\n');
    const embed = new EmbedBuilder()
      .setColor('#FF66CC')
      .setTitle('📜 Historique des chansons')
      .setDescription(songs || 'Aucun historique.')
      .setTimestamp();
    message.reply({ embeds: [embed] });
  },
};