let atualUrl = window.location.href;
let streamingService

if (atualUrl.includes("deezer.com")) {
    streamingService = 'deezer'
} else if (atualUrl.includes("spotify.com")) {
    streamingService = 'spotify'
} else if (atualUrl.includes("music.youtube.com")) {
    streamingService = 'youtube'
}