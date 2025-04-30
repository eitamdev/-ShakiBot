const { Client, GatewayIntentBits } = require('discord.js');
const { DisTube } = require('distube');
const { YtDlpPlugin } = require('@distube/yt-dlp');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// Configuration de DisTube
const distube = new DisTube(client, {
  plugins: [new YtDlpPlugin()],
});
console.log('DisTube initialisé:', distube ? 'OK' : 'Erreur');

// Variables globales
const songHistory = new Map();
const searchQueue = new Map();
let totalSongsPlayed = 0;
let totalPlayTime = 0;

module.exports = { client, distube, songHistory, searchQueue, totalSongsPlayed, totalPlayTime };