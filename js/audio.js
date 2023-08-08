var audio = document.getElementById('audio');
var playButton = document.getElementById('play');
var playIcon = document.getElementById('play-icon');
var pauseIcon = document.getElementById('pause-icon');

// Play the audio automatically when the page loads
playButton.onclick = function() {
    if(audio.paused) {
        audio.play();
        playIcon.style.display = 'none';
        pauseIcon.style.display = 'inline';
    } else {
        audio.pause();
        playIcon.style.display = 'inline';
        pauseIcon.style.display = 'none';
    }
}
