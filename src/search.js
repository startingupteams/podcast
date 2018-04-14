const fetch = require('node-fetch');


module.exports = (searchTerm, searchLimit = 2) =>
    fetch(`https://itunes.apple.com/search?term=${searchTerm}&limit=${searchLimit}&entry=podcast`)
        .then(r => r.json())
        .then(r => r.results
          .filter(r => r.kind === "podcast" && r.collectionPrice === 0)
          .map(r => ({
            artistName: r.artistName,
            artworkUrl: r.artworkUrl600,
            collectionId: r.collectionId,
            collectionName: r.collectionName,
            collectionViewUrl: r.collectionViewUrl,
            genres: r.genres,
            primaryGenreName: r.primaryGenreName,
            releaseDate: r.releaseDate,
            trackCount: r.trackCount,
          })))
