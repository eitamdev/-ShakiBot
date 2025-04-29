require('dotenv').config();
const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ActivityType, InteractionResponseFlags } = require('discord.js');
const { DisTube } = require('distube');
const { YtDlpPlugin } = require('@distube/yt-dlp');
const { google } = require('googleapis');
const Genius = require('genius-lyrics');

// Création du client Discord avec les bonnes intentions
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// Création de l'instance de DisTube avec le plugin YouTube
const distube = new DisTube(client, {
  plugins: [new YtDlpPlugin()],
});

// Initialisation de l'API YouTube
const youtube = google.youtube({
  version: 'v3',
  auth: process.env.YOUTUBE_API_KEY,
});

// Initialisation de l'API Genius
const genius = new Genius.Client(process.env.GENIUS_API_TOKEN);

// Statut dynamique Shakira
const shakiraStatuses = [
  { name: 'Waka Waka Time! 🎶', type: ActivityType.Playing },
  { name: 'Hips Don’t Lie! 💃', type: ActivityType.Playing },
  { name: 'Te Felicito! 😎', type: ActivityType.Listening },
  { name: 'La Tortura Vibes! 🔥', type: ActivityType.Playing },
  { name: 'Shakira, Shakira! 🌟', type: ActivityType.Playing },
];
function updateStatus() {
  const status = shakiraStatuses[Math.floor(Math.random() * shakiraStatuses.length)];
  client.user.setPresence({
    activities: [status],
    status: 'online',
  });
}
client.on('ready', () => {
  console.log(`🤖 Bot connecté en tant que ${client.user.tag}`);
  updateStatus();
  setInterval(updateStatus, 30000); // Change toutes les 30 secondes
});

// Historique des chansons jouées
const songHistory = new Map(); // guildId -> [{name, url, user, timestamp}]
// File d'attente de recherche
const searchQueue = new Map(); // guildId -> {results, message, user}

// Statistiques globales
let totalSongsPlayed = 0;
let totalPlayTime = 0; // en secondes

// Vérification du rôle DJ
function hasDJRole(member) {
  return member.roles.cache.some(role => role.name.toLowerCase() === 'dj');
}

// Citations et GIFs Shakira pour !vibe
const shakiraVibes = [
  { quote: "¡Waka Waka, eh eh! Let’s dance! 💃", gif: "https://media.giphy.com/media/xT9IghIG1tVv3u3v5C/giphy.gif" },
  { quote: "My hips don’t lie, and neither does my music! 😎", gif: "https://media.giphy.com/media/3o7btPCcdNniyf0ArS/giphy.gif" },
  { quote: "Te Felicito, you’ve got great taste! 🎶", gif: "https://media.giphy.com/media/l0Iyl55kTeh71nTWw/giphy.gif" },
  { quote: "Feel the rhythm, feel the heat! 🔥", gif: "https://media.giphy.com/media/3o7aD2vHxYukJ3z3eM/giphy.gif" },
  { quote: "Shakira, Shakira! Let’s vibe! 🌟", gif: "https://media.giphy.com/media/26FPy3QZQqGtDcxWC/giphy.gif" },
];

// Fonction pour rechercher des vidéos sur YouTube
async function searchYouTube(query, maxResults = 1) {
  try {
    const res = await youtube.search.list({
      part: 'snippet',
      q: query,
      type: 'video',
      maxResults,
    });

    if (res.data.items.length > 0) {
      const videos = res.data.items.map(item => ({
        url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
        title: item.snippet.title,
        thumbnail: item.snippet.thumbnails?.default?.url || '',
      }));
      console.log(`Recherche YouTube : ${videos.length} résultats`);
      return videos;
    }
    return null;
  } catch (err) {
    console.error('Erreur YouTube:', err);
    return null;
  }
}

// Fonction pour rechercher des playlists sur YouTube
async function searchYouTubePlaylist(query) {
  try {
    const playlistId = query.split('list=')[1].split('&')[0];
    const res = await youtube.playlistItems.list({
      part: 'snippet',
      playlistId: playlistId,
      maxResults: 50,
    });

    if (res.data.items.length > 0) {
      const videos = res.data.items.map((item) => ({
        url: `https://www.youtube.com/watch?v=${item.snippet.resourceId.videoId}`,
        title: item.snippet.title,
        thumbnail: item.snippet.thumbnails?.default?.url || '',
      }));
      console.log(`Playlist YouTube trouvée : ${videos.length} vidéos`);
      return videos;
    }
    return null;
  } catch (err) {
    console.error('Erreur YouTube Playlist:', err);
    return null;
  }
}

// Fonction pour obtenir les paroles avec Genius
async function getLyrics(songName, artistName) {
  try {
    const searchQuery = artistName ? `${songName} ${artistName}` : songName;
    const songs = await genius.songs.search(searchQuery);
    if (songs.length) {
      const lyrics = await songs[0].lyrics();
      return lyrics || 'Aucune parole trouvée.';
    }
    return 'Aucune parole trouvée pour cette chanson.';
  } catch (err) {
    console.error('Erreur Genius:', err);
    return 'Erreur lors de la récupération des paroles.';
  }
}

// Gestion des événements DisTube
distube.on('playSong', (queue, song) => {
  totalSongsPlayed++;
  totalPlayTime += song.duration;

  // Ajouter à l'historique
  const guildId = queue.textChannel.guild.id;
  if (!songHistory.has(guildId)) songHistory.set(guildId, []);
  songHistory.get(guildId).push({
    name: song.name,
    url: song.url,
    user: song.user.tag,
    timestamp: new Date(),
  });
  if (songHistory.get(guildId).length > 50) songHistory.get(guildId).shift(); // Limite à 50 chansons

  const progressBar = '▬'.repeat(10).split('').map((c, i) => (i / 10 < 0.1 ? '🔵' : c)).join('');
  const embed = new EmbedBuilder()
    .setColor('#00FF00')
    .setTitle('🎶 Maintenant en lecture')
    .setDescription(`[${song.name}](${song.url})`)
    .addFields(
      { name: 'Progression', value: `${progressBar} ${queue.formattedCurrentTime} / ${song.formattedDuration}` },
      { name: 'Durée', value: song.formattedDuration, inline: true },
      { name: 'Demandé par', value: song.user.tag, inline: true },
      { name: 'Volume', value: `${queue.volume}%`, inline: true }
    )
    .setThumbnail(song.thumbnail)
    .setTimestamp();

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('pause_resume').setLabel(queue.paused ? '▶️ Reprendre' : '⏸️ Pause').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('skip').setLabel('⏭️ Sauter').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('stop').setLabel('⏹️ Stop').setStyle(ButtonStyle.Danger)
  );

  queue.textChannel.send({ embeds: [embed], components: [row] });
});

distube.on('addSong', (queue, song) => {
  const embed = new EmbedBuilder()
    .setColor('#FFFF00')
    .setTitle('➕ Ajouté à la file')
    .setDescription(`[${song.name}](${song.url})`)
    .addFields(
      { name: 'Durée', value: song.formattedDuration, inline: true },
      { name: 'Demandé par', value: song.user.tag, inline: true }
    )
    .setThumbnail(song.thumbnail)
    .setTimestamp();
  queue.textChannel.send({ embeds: [embed] });
});

distube.on('addList', (queue, playlist) => {
  const embed = new EmbedBuilder()
    .setColor('#FF00FF')
    .setTitle('📚 Playlist ajoutée')
    .setDescription(`Playlist : ${playlist.name} (${playlist.songs.length} chansons)`)
    .addFields(
      { name: 'Ajouté par', value: playlist.user.tag, inline: true },
      { name: 'Durée totale', value: playlist.formattedDuration, inline: true }
    )
    .setThumbnail(playlist.thumbnail)
    .setTimestamp();
  queue.textChannel.send({ embeds: [embed] });
});

distube.on('finish', (queue) => {
  queue.textChannel.send('✅ La file de lecture est terminée. Je quitte le canal vocal.');
  queue.voice.leave();
});

distube.on('disconnect', (queue) => {
  queue.textChannel.send('👋 Déconnecté du canal vocal.');
});

distube.on('error', (channel, error) => {
  console.error('Erreur DisTube:', error);
  if (channel && typeof channel.send === 'function') {
    channel.send(`❌ Une erreur est survenue : ${error.message}`);
  } else {
    console.warn('Canal invalide pour envoyer l\'erreur:', channel);
  }
});

// Gestion des interactions avec les boutons
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isButton()) return;
  const queue = distube.getQueue(interaction.guild);
  if (!queue) {
    await interaction.reply({ content: '❌ Aucune chanson en cours de lecture.', flags: InteractionResponseFlags.Ephemeral });
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
        await interaction.reply({ content: '❌ Seuls les DJs peuvent sauter la chanson !', flags: InteractionResponseFlags.Ephemeral });
        return;
      }
      await distube.skip(interaction.guild);
      await interaction.reply('⏭️ Chanson suivante.');
    } else if (interaction.customId === 'stop') {
      if (!hasDJRole(interaction.member)) {
        await interaction.reply({ content: '❌ Seuls les DJs peuvent arrêter la lecture !', flags: InteractionResponseFlags.Ephemeral });
        return;
      }
      await distube.stop(interaction.guild);
      await interaction.reply('⏹️ Lecture arrêtée.');
    }
    // Mettre à jour l'embed pour refléter l'état
    const embed = interaction.message.embeds[0];
    const newRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('pause_resume').setLabel(queue.paused ? '▶️ Reprendre' : '⏸️ Pause').setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId('skip').setLabel('⏭️ Sauter').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId('stop').setLabel('⏹️ Stop').setStyle(ButtonStyle.Danger)
    );
    await interaction.message.edit({ embeds: [embed], components: [newRow] });
  } catch (err) {
    console.error(err);
    await interaction.reply({ content: '❌ Une erreur est survenue.', flags: InteractionResponseFlags.Ephemeral });
  }
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  const args = message.content.split(' ').slice(1);
  const command = message.content.split(' ')[0].toLowerCase();

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

  if (command === '!play') {
    if (!args.length) return message.reply('Tu dois spécifier une chanson ou une playlist ! Ex : !play Despacito');

    const channel = message.member?.voice?.channel;
    if (!channel) return message.reply('Tu dois être dans un canal vocal !');

    const query = args.join(' ');
    let videos;
    try {
      if (query.includes('list=')) {
        // Playlist YouTube
        videos = await searchYouTubePlaylist(query);
      } else {
        // Recherche ou lien YouTube
        videos = await searchYouTube(query, 1);
      }

      if (!videos) {
        return message.reply('❌ Aucun résultat trouvé sur YouTube.');
      }

      try {
        console.log(`Tentative de lecture : ${videos[0].url} (youtube)`);
        if (videos.length > 1) {
          console.log(`Ajout de ${videos.length} vidéos de la playlist`);
          await distube.play(channel, videos.map(v => v.url), {
            member: message.member,
            textChannel: message.channel,
            message,
            metadata: videos.map(v => ({ title: v.title, thumbnail: v.thumbnail })),
          });
          message.reply(`📚 Ajout de ${videos.length} chansons de la playlist YouTube.`);
        } else {
          console.log(`Ajout d'une vidéo : ${videos[0].title}`);
          await distube.play(channel, videos[0].url, {
            member: message.member,
            textChannel: message.channel,
            message,
            metadata: { title: videos[0].title, thumbnail: videos[0].thumbnail },
          });
          message.reply(`🎶 Ajouté : [${videos[0].title}](${videos[0].url}) (YouTube)`);
        }
      } catch (playErr) {
        console.error('Erreur lors de la lecture (youtube):', playErr);
        message.reply('❌ Une erreur est survenue pendant la lecture sur YouTube.');
      }
    } catch (err) {
      console.error('Erreur lors de la recherche (youtube):', err);
      message.reply('❌ Une erreur est survenue lors de la recherche sur YouTube.');
    }
  }

  if (command === '!search') {
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

      // Supprimer la file de recherche après 30 secondes
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
  }

  if (command === '!stop') {
    if (!hasDJRole(message.member)) return message.reply('❌ Seuls les DJs peuvent arrêter la lecture !');
    const queue = distube.getQueue(message.guild);
    if (!queue) return message.reply('❌ Aucune chanson en cours de lecture.');
    try {
      await distube.stop(message.guild);
      message.reply('⏹️ Lecture arrêtée et file vidée.');
    } catch (err) {
      console.error(err);
      message.reply('❌ Une erreur est survenue.');
    }
  }

  if (command === '!skip') {
    if (!hasDJRole(message.member)) return message.reply('❌ Seuls les DJs peuvent sauter la chanson !');
    const queue = distube.getQueue(message.guild);
    if (!queue) return message.reply('❌ Aucune chanson en cours de lecture.');
    if (queue.songs.length <= 1) return message.reply('❌ Aucune chanson suivante dans la file.');
    try {
      await distube.skip(message.guild);
      message.reply('⏭️ Chanson suivante.');
    } catch (err) {
      console.error(err);
      message.reply('❌ Une erreur est survenue ou aucune chanson à passer.');
    }
  }

  if (command === '!queue') {
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
  }

  if (command === '!pause') {
    const queue = distube.getQueue(message.guild);
    if (!queue) return message.reply('❌ Aucune chanson en cours de lecture.');
    if (queue.paused) return message.reply('❌ La lecture est déjà en pause.');
    try {
      await distube.pause(message.guild);
      message.reply('⏸️ Lecture en pause.');
    } catch (err) {
      console.error(err);
      message.reply('❌ Une erreur est survenue.');
    }
  }

  if (command === '!resume') {
    const queue = distube.getQueue(message.guild);
    if (!queue) return message.reply('❌ Aucune chanson en cours de lecture.');
    if (!queue.paused) return message.reply('❌ La lecture n\'est pas en pause.');
    try {
      await distube.resume(message.guild);
      message.reply('▶️ Lecture reprise.');
    } catch (err) {
      console.error(err);
      message.reply('❌ Une erreur est survenue.');
    }
  }

  if (command === '!volume') {
    const queue = distube.getQueue(message.guild);
    if (!queue) return message.reply('❌ Aucune chanson en cours de lecture.');
    if (!args[0]) return message.reply(`🔊 Volume actuel : ${queue.volume}%. Utilise !volume <nombre> pour changer.`);
    const volume = parseInt(args[0]);
    if (isNaN(volume) || volume < 0 || volume > 100) {
      return message.reply('❌ Le volume doit être un nombre entre 0 et 100.');
    }
    try {
      await distube.setVolume(message.guild, volume);
      message.reply(`🔊 Volume réglé à ${volume}%.`);
    } catch (err) {
      console.error(err);
      message.reply('❌ Une erreur est survenue.');
    }
  }

  if (command === '!loop') {
    const queue = distube.getQueue(message.guild);
    if (!queue) return message.reply('❌ Aucune chanson en cours de lecture.');
    const mode = args[0]?.toLowerCase();
    let repeatMode;
    if (mode === 'off') repeatMode = 0;
    else if (mode === 'song') repeatMode = 1;
    else if (mode === 'queue') repeatMode = 2;
    else return message.reply('❌ Utilise !loop <off|song|queue>.');
    try {
      await distube.setRepeatMode(message.guild, repeatMode);
      const modeText = repeatMode === 0 ? 'désactivée' : repeatMode === 1 ? 'chanson' : 'file';
      message.reply(`🔁 Répétition ${modeText}.`);
    } catch (err) {
      console.error(err);
      message.reply('❌ Une erreur est survenue.');
    }
  }

  if (command === '!nowplaying') {
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
  }

  if (command === '!seek') {
    const queue = distube.getQueue(message.guild);
    if (!queue) return message.reply('❌ Aucune chanson en cours de lecture.');
    if (!args[0]) return message.reply('❌ Utilise !seek <secondes>.');
    const seconds = parseInt(args[0]);
    if (isNaN(seconds) || seconds < 0) {
      return message.reply('❌ Les secondes doivent être un nombre positif.');
    }
    try {
      await distube.seek(message.guild, seconds);
      message.reply(`⏰ Avancé à ${seconds} secondes.`);
    } catch (err) {
      console.error(err);
      message.reply('❌ Une erreur est survenue ou temps invalide.');
    }
  }

  if (command === '!remove') {
    if (!hasDJRole(message.member)) return message.reply('❌ Seuls les DJs peuvent supprimer une chanson !');
    const queue = distube.getQueue(message.guild);
    if (!queue) return message.reply('❌ Aucune chanson en cours de lecture.');
    if (!args[0]) return message.reply('❌ Utilise !remove <numéro>.');
    const index = parseInt(args[0]) - 1;
    if (isNaN(index) || index < 0 || index >= queue.songs.length) {
      return message.reply('❌ Numéro de chanson invalide.');
    }
    try {
      const removedSong = queue.songs[index];
      queue.songs.splice(index, 1);
      message.reply(`🗑️ Supprimé : [${removedSong.name}](${removedSong.url}).`);
    } catch (err) {
      console.error(err);
      message.reply('❌ Une erreur est survenue.');
    }
  }

  if (command === '!shuffle') {
    const queue = distube.getQueue(message.guild);
    if (!queue) return message.reply('❌ Aucune chanson en cours de lecture.');
    try {
      await distube.shuffle(message.guild);
      message.reply('🔀 File mélangée.');
    } catch (err) {
      console.error(err);
      message.reply('❌ Une erreur est survenue.');
    }
  }

  if (command === '!clear') {
    if (!hasDJRole(message.member)) return message.reply('❌ Seuls les DJs peuvent vider la file !');
    const queue = distube.getQueue(message.guild);
    if (!queue) return message.reply('❌ Aucune chanson en cours de lecture.');
    try {
      queue.songs = [queue.songs[0]]; // Garde la chanson en cours
      message.reply('🧹 File d\'attente vidée (sauf chanson en cours).');
    } catch (err) {
      console.error(err);
      message.reply('❌ Une erreur est survenue.');
    }
  }

  if (command === '!jump') {
    if (!hasDJRole(message.member)) return message.reply('❌ Seuls les DJs peuvent sauter à une chanson !');
    const queue = distube.getQueue(message.guild);
    if (!queue) return message.reply('❌ Aucune chanson en cours de lecture.');
    if (!args[0]) return message.reply('❌ Utilise !jump <numéro>.');
    const index = parseInt(args[0]) - 1;
    if (isNaN(index) || index < 0 || index >= queue.songs.length) {
      return message.reply('❌ Numéro de chanson invalide.');
    }
    try {
      await distube.jump(message.guild, index);
      message.reply(`⏩ Sauté à la chanson numéro ${index + 1}.`);
    } catch (err) {
      console.error(err);
      message.reply('❌ Une erreur est survenue.');
    }
  }

  if (command === '!filter') {
    const queue = distube.getQueue(message.guild);
    if (!queue) return message.reply('❌ Aucune chanson en cours de lecture.');
    const filter = args[0]?.toLowerCase();
    if (!filter) return message.reply('❌ Utilise !filter <nom|clear> (ex. bassboost, 8d).');
    try {
      if (filter === 'clear') {
        await distube.setFilter(message.guild, false);
        message.reply('🧼 Filtres supprimés.');
      } else {
        await distube.setFilter(message.guild, filter);
        message.reply(`🎛️ Filtre appliqué : ${filter}.`);
      }
    } catch (err) {
      console.error(err);
      message.reply('❌ Filtre invalide ou erreur survenue. Filtres disponibles : bassboost, 8d, nightcore, vaporwave, etc.');
    }
  }

  if (command === '!stats') {
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
  }

  if (command === '!history') {
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
  }

  if (command === '!lyrics') {
    const queue = distube.getQueue(message.guild);
    if (!queue) return message.reply('❌ Aucune chanson en cours de lecture.');
    const song = queue.songs[0];
    try {
      const lyrics = await getLyrics(song.name);
      const embed = new EmbedBuilder()
        .setColor('#FFD700')
        .setTitle(`🎤 Paroles : ${song.name}`)
        .setDescription(lyrics.slice(0, 2000) || 'Aucune parole trouvée.')
        .setTimestamp();
      message.reply({ embeds: [embed] });
    } catch (err) {
      console.error(err);
      message.reply('❌ Une erreur est survenue lors de la récupération des paroles.');
    }
  }

  if (command === '!vibe') {
    const vibe = shakiraVibes[Math.floor(Math.random() * shakiraVibes.length)];
    const embed = new EmbedBuilder()
      .setColor('#FF69B4')
      .setTitle('💃 Shakira Vibe!')
      .setDescription(vibe.quote)
      .setImage(vibe.gif)
      .setTimestamp();
    message.reply({ embeds: [embed] });
  }

  if (command === '!dj') {
    if (hasDJRole(message.member)) {
      message.reply('🎧 Tu es déjà un DJ ! Tu peux utiliser des commandes comme !skip, !stop, !clear, !jump, !remove.');
    } else {
      message.reply('❌ Tu n’as pas le rôle DJ. Demande à un admin de t’ajouter le rôle "DJ" pour contrôler la musique !');
    }
  }

  if (command === '!help') {
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
  }
});

client.login(process.env.DISCORD_TOKEN);