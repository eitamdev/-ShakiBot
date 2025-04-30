const Genius = require('genius-lyrics');
const genius = new Genius.Client(process.env.GENIUS_API_TOKEN);

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

module.exports = { getLyrics };