let atualUrl = window.location.href;
let streamingService
let verses = []

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
        const response = await fetch(`https://lrclib.net/api/search?q=${query}`);
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