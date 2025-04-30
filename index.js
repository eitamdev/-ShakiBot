require('dotenv').config();
const { client, distube } = require('./client');
const { loadCommands } = require('./commandHandler');
const fs = require('fs');
const path = require('path');

client.commands = new Map();

// Charger les commandes
loadCommands(client);

// Charger les événements
const eventsPath = path.join(__dirname, 'events');
fs.readdirSync(eventsPath).forEach(file => {
  const event = require(`./events/${file}`);
  const eventName = file.split('.')[0];
  console.log(`Chargement de l'événement : ${eventName}`);
  client.on(eventName, (...args) => {
    console.log(`Événement déclenché : ${eventName}`);
    event.execute(...args, client, distube);
  });
});

// Log pour vérifier distube
console.log(`DisTube dans index.js : ${distube ? 'Oui' : 'Non'}`);

// Connexion
client.login(process.env.DISCORD_TOKEN);