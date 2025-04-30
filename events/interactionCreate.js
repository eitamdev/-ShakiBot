const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
  name: 'interactionCreate',
  async execute(interaction, client, distube) {
    if (!interaction.isButton()) {
      await interaction.reply({ content: '❌ Action non supportée.', ephemeral: true });
      return;
    }

    if (!distube) {
      console.error('DisTube non défini dans interactionCreate');
      await interaction.reply({ content: '❌ Erreur interne : DisTube non initialisé.', ephemeral: true });
      return;
    }

    const queue = distube.getQueue(interaction.guild);
    if (!queue) {
      await interaction.reply({ content: '❌ Aucune chanson en cours de lecture.', ephemeral: true });
      return;
    }

    try {
      if (interaction.customId === 'pause_resume') {
        if (queue.paused) {
          await distube.resume(interaction.guild);
          await interaction.reply('▶️ Lecture reprise.');
        } else {
          await distube.pause(interaction.guild);
          await interaction.reply('⏸️ Lecture en pause.');
        }
      } else if (interaction.customId === 'skip') {
        if (!hasDJRole(interaction.member)) {
          await interaction.reply({ content: '❌ Seuls les DJs peuvent sauter la chanson !', ephemeral: true });
          return;
        }
        await distube.skip(interaction.guild);
        await interaction.reply('⏭️ Chanson suivante.');
      } else if (interaction.customId === 'stop') {
        if (!hasDJRole(interaction.member)) {
          await interaction.reply({ content: '❌ Seuls les DJs peuvent arrêter la lecture !', ephemeral: true });
          return;
        }
        await distube.stop(interaction.guild);
        await interaction.reply('⏹️ Lecture arrêtée.');
      }

      const embed = interaction.message.embeds[0];
      const newRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('pause_resume').setLabel(queue.paused ? '▶️ Reprendre' : '⏸️ Pause').setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId('skip').setLabel('⏭️ Sauter').setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId('stop').setLabel('⏹️ Stop').setStyle(ButtonStyle.Danger)
      );
      await interaction.message.edit({ embeds: [embed], components: [newRow] });
    } catch (err) {
      console.error('Erreur dans interactionCreate:', err);
      await interaction.reply({ content: '❌ Une erreur est survenue.', ephemeral: true });
    }
  },
};

function hasDJRole(member) {
  return member.roles.cache.some(role => role.name.toLowerCase() === 'dj');
}