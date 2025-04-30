const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: '+help',
  execute(message, args, client, distube) {
    const embed = new EmbedBuilder()
      .setColor('#00FFFF')
      .setTitle('📖 Aide - Commandes du bot Shakira')
      .setDescription('Voici la liste des commandes disponibles pour vibrer avec Shakira :')
      .addFields(
        { name: '!play <chanson/playlist>', value: 'Joue une chanson ou une playlist depuis YouTube. Ex : !play Despacito.', inline: false },
        { name: '!search <recherche>', value: 'Recherche jusqu’à 5 chansons sur YouTube et choisis un numéro. Ex : !search Waka Waka.', inline: false },
        { name: '!stop', value: 'Arrête la lecture et vide la file (DJ uniquement).', inline: false },
        { name: '!skip', value: 'Passe à la chanson suivante (DJ uniquement).', inline: false },
        { name: '!queue', value: 'Affiche la file d\'attente.', inline: false },
        { name: '!pause', value: 'Met la lecture en pause.', inline: false },
        { name: '!resume', value: 'Reprend la lecture.', inline: false },
        { name: '!volume <0-100>', value: 'Ajuste le volume.', inline: false },
        { name: '!loop <off|song|queue>', value: 'Active/désactive la répétition.', inline: false },
        { name: '!nowplaying', value: 'Affiche la chanson en cours avec une barre de progression.', inline: false },
        { name: '!seek <secondes>', value: 'Avance à une position spécifique dans la chanson.', inline: false },
        { name: '!remove <numéro>', value: 'Supprime une chanson de la file (DJ uniquement).', inline: false },
        { name: '!shuffle', value: 'Mélange la file d\'attente.', inline: false },
        { name: '!clear', value: 'Vide la file (sauf la chanson en cours, DJ uniquement).', inline: false },
        { name: '!jump <numéro>', value: 'Saute à une chanson spécifique dans la file (DJ uniquement).', inline: false },
        { name: '!filter <nom|clear>', value: 'Applique ou supprime un filtre audio (ex. bassboost, 8d).', inline: false },
        { name: '!stats', value: 'Affiche les statistiques du bot.', inline: false },
        { name: '!history', value: 'Affiche l\'historique des chansons jouées.', inline: false },
        { name: '!lyrics', value: 'Affiche les paroles de la chanson en cours.', inline: false },
        { name: '!vibe', value: 'Booste l’ambiance avec une citation et un GIF de Shakira !', inline: false },
        { name: '!dj', value: 'Vérifie si tu as le rôle DJ pour contrôler la musique.', inline: false },
        { name: '!help', value: 'Affiche ce message.', inline: false }
      )
      .setTimestamp();
    message.reply({ embeds: [embed] });
  },
};