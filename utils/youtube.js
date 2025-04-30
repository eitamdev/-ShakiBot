const { google } = require('googleapis');

const youtube = google.youtube({
  version: 'v3',
  auth: process.env.YOUTUBE_API_KEY,
});

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

module.exports = { searchYouTube };