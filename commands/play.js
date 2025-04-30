const { searchYouTube } = require('../utils/youtube');

module.exports = {
  name: '+play',
  async execute(message, args, client, distube) {
    console.log(`Exécution de !play, distube défini : ${distube ? 'Oui' : 'Non'}`);
    if (!distube) {
      console.error('DisTube non défini dans play.js');
      return message.reply('❌ Erreur interne : DisTube non initialisé.');
    }

    if (!args.length) return message.reply('Tu dois spécifier une chanson ! Ex : !play Waka Waka');

    const channel = message.member?.voice?.channel;
    if (!channel) return message.reply('Tu dois être dans un canal vocal !');

    const query = args.join(' ');
    try {
      const videos = await searchYouTube(query, 1);
      if (!videos) return message.reply('❌ Aucun résultat trouvé sur YouTube.');

      console.log(`Tentative de lecture : ${videos[0].url} (youtube)`);
      await distube.play(channel, videos[0].url, {
        member: message.member,
        textChannel: message.channel,
        message,
        metadata: { title: videos[0].title, thumbnail: videos[0].thumbnail },
      });
      message.reply(`🎶 Ajouté : [${videos[0].title}](${videos[0].url}) (YouTube)`);
    } catch (err) {
      console.error('Erreur dans play.js:', err);
      message.reply('❌ Une erreur est survenue.');
    }
  },
};