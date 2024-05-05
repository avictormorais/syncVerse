let atualUrl = window.location.href;
let streamingService
let verses = []
let currentTrack = ''

if (atualUrl.includes("deezer.com")) {
    streamingService = 'deezer'
} else if (atualUrl.includes("spotify.com")) {
    streamingService = 'spotify'
} else if (atualUrl.includes("music.youtube.com")) {
    streamingService = 'youtube'
}

class verse {
    constructor(verse, time) {
        if(verse == undefined || verse == null || verse == ""){
            this.verse = '♩ ♩ ♩'
        } else{
            this.verse = verse;
        }
        this.time = time;
    }
}
async function getLyrics(query){
    try {
        const response = await fetch(`https://lrclib.net/api/search?${query}`);
        const data = await response.json();
        let lyricResult = data.find(result => result.syncedLyrics).syncedLyrics;
        lyricResult.split('\n').forEach(lyric => {
            verses.push(new verse(lyric.split('] ')[1], lyric.split('] ')[0].replace('[', '').split('.')[0]));
        });
        return true;
    } catch (error) {
        return false;
    }
}

function findVerseByTime(time) {
    let currentVerse = '♩ ♩ ♩';
    let previousVerse = '♩ ♩ ♩';
    let nextVerse = '♩ ♩ ♩';

    for (let i = 0; i < verses.length; i++) {
        if (verses[i].time === time) {
            currentVerse = verses[i].verse;
            previousVerse = verses[i - 1].verse || '♩ ♩ ♩';
            nextVerse = verses[i + 1].verse || '';
            break;
        } else if (verses[i].time > time) {
            nextVerse = verses[i].verse;
            previousVerse = verses[i - 1].verse || '♩ ♩ ♩';
            break;
        }
    }

    return {
        currentVerse,
        previousVerse,
        nextVerse
    };
}

let queryElements = {
    "services": {
      "spotify": {
        "track": "a[data-testid='context-item-link']",
        "divArtists": "div[data-testid='context-item-info-subtitles']",
        "artist": "a[data-testid='context-item-info-artist'][draggable='true']",
        "divSpan": "div[data-testid='now-playing-widget']"
      }
    }
}

const selectors = queryElements.services.spotify;
const trackSelector = selectors.track;
const divArtists = selectors.divArtists;
const artistSelector = selectors.artist;
const divSelector = selectors.divSpan;

if(streamingService){
    const logoSpan = document.createElement('span');
    logoSpan.style.width = '25px';
    logoSpan.style.height = '25px';
    logoSpan.style.cursor = 'pointer';
    logoSpan.style.marginLeft = '10px';
    logoSpan.style.display = 'flex';
    const logoImage = document.createElement('img');
    logoImage.src = 'https://raw.githubusercontent.com/avictormorais/syncVerse/d1c085aeec623c590c324e44efb151020fef5010/icon.png?raw=true';
    logoImage.style.width = '100%';
    logoImage.style.height = '100%';
    logoSpan.appendChild(logoImage);

    logoSpan.addEventListener('click', () => {
        console.log('logo clicked')
    });

    let intervalId = setInterval(() => {
        let div = document.querySelector(divSelector);
        if (div) {
            clearInterval(intervalId);
            div.appendChild(logoSpan);
        }
    }, 1000);
}

setInterval(() => {
    if(document.querySelector(trackSelector)){
        let track = document.querySelector(trackSelector).innerHTML;
        let artistsList;
        let divListArtists
        if(divArtists != ''){
            divListArtists = document.querySelector(divArtists);
            artistsList = divListArtists.querySelectorAll(artistSelector);  
        } else{
            artistsList = document.querySelectorAll(artistSelector);  
        }
        let artists = '';
        artistsList.forEach(artist => {
            if(artist.innerHTML){
                artists += `${artist.innerHTML} `;
            }
        });
        if(track && artists && currentTrack !== `${track} ${artists}`){
            verses = [];
            currentTrack = `${track} ${artists}`;
            getLyrics(`track_name=${track}&artist_name=${artists}`).then(() => {
                if(verses.length > 0){
                    console.log(verses)
                }
            });
        }
    }
}, 1000);