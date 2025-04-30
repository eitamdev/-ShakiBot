const { EmbedBuilder } = require('discord.js');
const { searchYouTube } = require('../utils/youtube');
const { searchQueue } = require('../client');

module.exports = {
  name: '+search',
  async execute(message, args, client, distube) {
    if (!args.length) return message.reply('Tu dois spécifier une recherche ! Ex : !search Despacito');

    const channel = message.member?.voice?.channel;
    if (!channel) return message.reply('Tu dois être dans un canal vocal !');

    const query = args.join(' ');
    try {
      const results = await searchYouTube(query, 5);
      if (!results || results.length === 0) {
        return message.reply('❌ Aucun résultat trouvé pour cette recherche sur YouTube.');
      }

      const embed = new EmbedBuilder()
        .setColor('#FFD700')
        .setTitle('🔍 Résultats de la recherche (YouTube)')
        .setDescription(
          results
            .map((video, index) => `${index + 1}. [${video.title}](${video.url})`)
            .join('\n')
        )
        .setFooter({ text: 'Réponds avec le numéro (1-5) pour choisir une chanson.' })
        .setTimestamp();

      await message.reply({ embeds: [embed] });
      searchQueue.set(message.guild.id, {
        results,
        message,
        user: message.author,
      });

      setTimeout(() => {
        if (searchQueue.has(message.guild.id)) {
          searchQueue.delete(message.guild.id);
          message.channel.send('⏰ Temps écoulé pour choisir une chanson.');
        }
      }, 30000);
    } catch (err) {
      console.error('Erreur lors de la recherche (youtube):', err);
      message.reply('❌ Une erreur est survenue lors de la recherche sur YouTube.');
    }
  },
};