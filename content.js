let atualUrl = window.location.href;
let streamingService
let verses = []
let currentTrack = ''
let selectors = []
let canvas
let videoElement
let cover
let currentVerse

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
            this.verse = '♪ ♪ ♪'
        } else{
            this.verse = verse;
        }
        this.time = time;
    }
}
async function getLyrics(query){
    if(!canvas){
        canvas = document.createElement('canvas');
        canvas.width = 470;
        canvas.height = 470;
        var contexto = canvas.getContext('2d');
        contexto.fillStyle = 'white';
        contexto.font = `70px Rubik`;
        drawTrackInfos();

        const stream = canvas.captureStream(25);

        videoElement = document.createElement('video');
        videoElement.srcObject = stream;

        videoElement.onloadedmetadata = () => {
            videoElement.play();
        };
    }
    
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
    let currentVerse = '♪ ♪ ♪';
    let previousVerse = '♪ ♪ ♪';
    let nextVerse = '♪ ♪ ♪';

    for (let i = 0; i < verses.length; i++) {
        if (verses[i].time === time) {
            currentVerse = verses[i];
            if(i === 0){
                previousVerse = '';
            } else{
                previousVerse = verses[i - 1];
            }
            if(i === verses.length - 1){
                nextVerse = '';
            } else{
                nextVerse = verses[i + 1];
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
        currentTime: selector.currentTime,
        cover: selector.cover
    };
});

if(streamingService){
    const logoSpan = document.createElement('span');
    logoSpan.style.minWidth = '25px';
    logoSpan.style.minHeight = '25px';
    logoSpan.style.cursor = 'pointer';
    logoSpan.style.marginLeft = '10px';
    logoSpan.style.display = 'flex';
    const logoImage = document.createElement('img');
    logoImage.src = 'https://raw.githubusercontent.com/avictormorais/syncVerse/d1c085aeec623c590c324e44efb151020fef5010/icon.png?raw=true';
    logoImage.style.width = '25px';
    logoImage.style.height = 'auto';
    logoSpan.appendChild(logoImage);

    logoSpan.addEventListener('click', () => {
        if ('pictureInPictureEnabled' in document) {
            videoElement.requestPictureInPicture();
        } else {
            console.log('Picture-in-Picture is not supported');
        }
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
                if(streamingService == 'youtube' && artist.href && artist.href.includes('browse')) {
                    // It's a album link
                } else {
                    artists += `${artist.innerHTML}, `;
                }
            }
        });
        artists = artists.slice(0, -2);
        if(track && artists && currentTrack !== `${track}<->${artists}`){
            verses = [];
            cover = document.querySelector(selectors.cover).src;
            if(streamingService == 'deezer' && cover == 'https://e-cdns-images.dzcdn.net/images/cover/d41d8cd98f00b204e9800998ecf8427e/264x264-000000-80-0-0.jpg'){
                const intervalCover = setInterval(() => {
                    let tempcover = document.querySelector(selectors.cover).src;
                    if (tempcover !== 'https://e-cdns-images.dzcdn.net/images/cover/d41d8cd98f00b204e9800998ecf8427e/264x264-000000-80-0-0.jpg') {
                        cover = tempcover;
                        drawTrackInfos();
                        clearInterval(intervalCover);
                    }
                }, 300);                
            } else{
                drawTrackInfos();
            }
            currentTrack = `${track}<->${artists}`;
            getLyrics(`track_name=${track}&artist_name=${artists}`).then(() => {
                if(verses.length > 0){
                    writeText('', '', verses[0].verse);
                    setInterval(() => {
                        if(document.querySelector(selectors.currentTime)){
                            let currentTime = document.querySelector(selectors.currentTime).innerText
                            if(streamingService == 'youtube'){
                                currentTime = currentTime.split(' /')[0]
                            }
                            if(currentTime.split(':')[0].length === 1){
                                currentTime = `0${currentTime}`
                            }
                            let verses = findVerseByTime(currentTime)
                            if(verses){
                                if(verses.currentVerse.verse !== currentVerse){
                                    writeText(verses.currentVerse.verse, verses.previousVerse.verse, verses.nextVerse.verse);
                                    currentVerse = verses.currentVerse.verse
                                }
                            }
                        }
                    }, 1000);
                } else{
                    drawTrackInfos();
                }
            });
        }
    }
}, 1000);

function drawTrackInfos(callback) {
    if (!canvas) {
        return;
    }

    let ctx = canvas.getContext('2d');
    let src = cover;

    if (streamingService == 'spotify') {
        src = cover.replace('4851', '1e02');
    }

    let tempCover = new Image();
    tempCover.crossOrigin = "anonymous";
    tempCover.src = src;
    tempCover.addEventListener('load', () => {
        ctx.filter = "blur(5px)";
        ctx.drawImage(tempCover, 0, 0, 470, 470);
        ctx.filter = "brightness(0.7)";
        ctx.drawImage(canvas, 0, 0, 470, 470);
        ctx.filter = "none";

        ctx.fillStyle = 'white';
        ctx.textAlign = 'left';
        ctx.font = `35px Rubik`;
        function textWidth(text) {
            return ctx.measureText(text).width;
        }

        while(textWidth(currentTrack.split('<->')[0].replace("amp;", '').split(' (')[0]) > 410){
            ctx.font = `${parseInt(ctx.font) - 1}px Rubik`;
        }
        ctx.fillText(currentTrack.split('<->')[0].replace("amp;", '').split(' (')[0], 30, 417);
        ctx.font = `25px Rubik`;
        while(textWidth(currentTrack.split('<->')[1].replace("amp;", '')) > 410){
            ctx.font = `${parseInt(ctx.font) - 1}px Rubik`;
        }
        ctx.fillText(currentTrack.split('<->')[1].replace("amp;", ''), 30, 450);

        if (callback) {
            callback();
        }
    });
}

function writeText(currentText, previousText, nextText) {
    if (canvas) {
        drawTrackInfos(() => {
            ctx = canvas.getContext('2d');
            ctx.textAlign = 'left';
            ctx.font = `40px Rubik`
            let maxWidth = 430;
            let spaceBetweenLines = 7;
            let spaceBetweenVerses = 15;
            var centerX = 30;
            var centerY = 400 / 2;
    
            var lineHeight = 40 + spaceBetweenLines;
            function splitText(text) {
                var words = text.split(" ");
                var lines = [];
                var currentLine = "";
    
                words.forEach(function (word) {
                    var testLine = currentLine + (currentLine ? " " : "") + word;
                    var testWidth = ctx.measureText(testLine).width;
    
                    if (testWidth > maxWidth - 30) {
                        lines.push(currentLine);
                        currentLine = word;
                    } else {
                        currentLine = testLine;
                    }
                });
                lines.push(currentLine);
                return lines;
            }
    
            function drawText(text, startY) {
                var lines = splitText(text);
                lines.forEach(function (line) {
                    ctx.fillText(line, centerX, startY);
                    startY += lineHeight;
                });
            }
    
            let linesLength = splitText(currentText).length;
            let textHeight = linesLength * lineHeight;
            var currentYStart = (centerY - (textHeight / 2) + (spaceBetweenLines * linesLength)) + (lineHeight / 2);
    
            drawText(currentText, currentYStart);
    
            if (previousText) {
                ctx.globalAlpha = 0.55;
                ctx.font = `28px Rubik`;
                let previousTextHeight = lineHeight * splitText(previousText).length;
                var previousYStart = currentYStart - previousTextHeight - spaceBetweenLines - spaceBetweenVerses;
                drawText(previousText, previousYStart);
                ctx.globalAlpha = 1;
                ctx.font = `40px Rubik`;
            }
    
            if (nextText) {
                ctx.globalAlpha = 0.55;
                ctx.font = `28px Rubik`;
                var nextYStart = currentYStart + textHeight + spaceBetweenLines + spaceBetweenVerses;
                drawText(nextText, nextYStart);
                ctx.globalAlpha = 1;
                ctx.font = `40px Rubik`;
            }
        });
    }
}