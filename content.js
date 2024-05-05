let atualUrl = window.location.href;
let streamingService
let verses = []
let currentTrack = ''
let selectors = []

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
            if(i === 0){
                previousVerse = '';
            } else{
                previousVerse = verses[i - 1].verse;
            }
            if(i === verses.length - 1){
                nextVerse = '';
            } else{
                nextVerse = verses[i + 1].verse;
            }
            return {
                currentVerse,
                previousVerse,
                nextVerse
            };
        }
    }
}


fetch('https://raw.githubusercontent.com/avictormorais/syncVerse/main/queryElements.json')
.then(response => response.json())
.then(data => {
    const selector = data.services[streamingService];
    selectors = {
        track: selector.track,
        divArtists: selector.divArtists,
        artist: selector.artist,
        divSpan: selector.divSpan,
        currentTime: selector.currentTime
    };
});

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
        let div = document.querySelector(selectors.divSpan);
        if (div) {
            clearInterval(intervalId);
            div.appendChild(logoSpan);
        }
    }, 1000);
}

setInterval(() => {
    if(document.querySelector(selectors.track)){
        let track = document.querySelector(selectors.track).innerHTML;
        let artistsList;
        let divListArtists
        if(selectors.divArtists != ''){
            divListArtists = document.querySelector(selectors.divArtists);
            artistsList = divListArtists.querySelectorAll(selectors.artist);  
        } else{
            artistsList = document.querySelectorAll(selectors.artist);  
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
                    // draw a empty cover or get the first verse to show as the next
                    setInterval(() => {
                        if(document.querySelector(selectors.currentTime)){
                            // draw the previos, current and next verses
                            let currentTime = `0${document.querySelector(selectors.currentTime).innerText}`
                            let verses = findVerseByTime(currentTime)
                            if(verses){
                                console.log(verses.currentVerse)
                            }
                        }
                    }, 1000);
                }
            });
        }
    }
}, 1000);