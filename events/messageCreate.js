const { searchQueue } = require('../client');

module.exports = {
  name: 'messageCreate',
  async execute(message, client, distube) {
    if (message.author.bot) return;

    const prefix = '+'; // Changé de '!' à '+'
    if (!message.content.startsWith(prefix)) return;

    const args = message.content.slice(prefix.length).trim().split(' ');
    const command = args.shift().toLowerCase();

    console.log(`Commande reçue : ${prefix}${command}`);

    // Gestion de la réponse à une recherche
    if (searchQueue.has(message.guild.id)) {
      const searchData = searchQueue.get(message.guild.id);
      if (message.author.id === searchData.user.id && message.channel.id === searchData.message.channel.id) {
        const choice = parseInt(message.content) - 1;
        if (!isNaN(choice) && choice >= 0 && choice < searchData.results.length) {
          const video = searchData.results[choice];
          try {
            const channel = message.member?.voice?.channel;
            if (!channel) {
              message.reply('Tu dois être dans un canal vocal !');
              searchQueue.delete(message.guild.id);
              return;
            }
            if (!distube) {
              console.error('DisTube non défini dans messageCreate pour recherche');
              message.reply('❌ Erreur interne : DisTube non initialisé.');
              return;
            }
            console.log(`Tentative de lecture : ${video.url} (youtube)`);
            await distube.play(channel, video.url, {
              member: message.member,
              textChannel: message.channel,
              message,
              metadata: { title: video.title, thumbnail: video.thumbnail },
            });
            message.reply(`🎶 Joue : [${video.title}](${video.url})`);
          } catch (err) {
            console.error('Erreur lors de la lecture (youtube):', err);
            message.reply('❌ Une erreur est survenue pendant la lecture sur YouTube.');
          }
          searchQueue.delete(message.guild.id);
          return;
        } else {
          message.reply('❌ Choix invalide. Utilise un numéro entre 1 et 5.');
          return;
        }
      }
    }

    // Exécution des commandes
    const cmd = client.commands.get(`+${command}`); // Changé pour inclure le préfixe
    if (cmd) {
      try {
        console.log(`Exécution de ${cmd.name}, distube défini : ${distube ? 'Oui' : 'Non'}`);
        if (cmd.name !== '+vibe' && cmd.name !== '+help' && cmd.name !== '+dj' && !distube) {
          console.error(`DisTube non défini pour la commande ${command}`);
          return message.reply('❌ Erreur interne : DisTube non initialisé.');
        }
        await cmd.execute(message, args, client, distube);
      } catch (err) {
        console.error(`Erreur lors de l'exécution de ${command}:`, err);
        message.reply('❌ Une erreur est survenue lors de l’exécution de la commande.');
      }
    } else {
      console.log(`Commande ${prefix}${command} non trouvée`);
    }
  },
};