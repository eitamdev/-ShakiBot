const { shakiraStatuses } = require('../utils/shakiraVibes');

module.exports = {
  name: 'ready',
  execute(client) {
    console.log(`🤖 Bot connecté en tant que ${client.user.tag}`);
    updateStatus(client);
    setInterval(() => updateStatus(client), 30000);
  },
};

function updateStatus(client) {
  const status = shakiraStatuses[Math.floor(Math.random() * shakiraStatuses.length)];
  client.user.setPresence({
    activities: [status],
    status: 'online',
  });
}