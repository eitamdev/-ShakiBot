module.exports = {
    name: '+dj',
    execute(message, args, client, distube) {
      if (hasDJRole(message.member)) {
        message.reply('🎧 Tu es déjà un DJ ! Tu peux utiliser des commandes comme !skip, !stop, !clear, !jump, !remove.');
      } else {
        message.reply('❌ Tu n’as pas le rôle DJ. Demande à un admin de t’ajouter le rôle "DJ" pour contrôler la musique !');
      }
    },
  };
  
  function hasDJRole(member) {
    return member.roles.cache.some(role => role.name.toLowerCase() === 'dj');
  }