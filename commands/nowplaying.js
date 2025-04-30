const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
  name: '+nowplaying',
  execute(message, args, client, distube) {
    const queue = distube.getQueue(message.guild);
    if (!queue) return message.reply('❌ Aucune chanson en cours de lecture.');
    const song = queue.songs[0];
    const progress = queue.currentTime / song.duration;
    const progressBar = '▬'.repeat(10).split('').map((c, i) => (i / 10 < progress ? '🔵' : c)).join('');
    const embed = new EmbedBuilder()
      .setColor('#FF9900')
      .setTitle('🎵 En cours de lecture')
      .setDescription(`[${song.name}](${song.url})`)
      .addFields(
        { name: 'Progression', value: `${progressBar} ${queue.formattedCurrentTime} / ${song.formattedDuration}` },
        { name: 'Volume', value: `${queue.volume}%`, inline: true },
        { name: 'Demandé par', value: song.user.tag, inline: true }
      )
      .setThumbnail(song.thumbnail)
      .setTimestamp();

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('pause_resume').setLabel(queue.paused ? '▶️ Reprendre' : '⏸️ Pause').setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId('skip').setLabel('⏭️ Sauter').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId('stop').setLabel('⏹️ Stop').setStyle(ButtonStyle.Danger)
    );

    message.reply({ embeds: [embed], components: [row] });
  },
};