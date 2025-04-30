const { EmbedBuilder } = require('discord.js');
const { shakiraVibes } = require('../utils/shakiraVibes');

module.exports = {
  name: '+vibe',
  async execute(message, args, client) {
    console.log('Exécution de !vibe');
    const vibe = shakiraVibes[Math.floor(Math.random() * shakiraVibes.length)];
    const embed = new EmbedBuilder()
      .setColor('#FF0000')
      .setTitle('Shakira Vibe! 💃')
      .setDescription(vibe.quote)
      .setImage(vibe.gif)
      .setFooter({ text: 'ShakiBot 🌟' });
    await message.reply({ embeds: [embed] });
  },
};