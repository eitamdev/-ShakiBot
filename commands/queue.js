const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: '+queue',
  execute(message, args, client, distube) {
    const queue = distube.getQueue(message.guild);
    if (!queue) return message.reply('❌ La file est vide.');
    const songs = queue.songs
      .map((song, index) => `${index + 1}. [${song.name}](${song.url}) - ${song.formattedDuration}`)
      .join('\n');
    const embed = new EmbedBuilder()
      .setColor('#0000FF')
      .setTitle('📜 File d\'attente')
      .setDescription(songs || 'Aucune chanson dans la file.')
      .setTimestamp();
    message.reply({ embeds: [embed] });
  },
};