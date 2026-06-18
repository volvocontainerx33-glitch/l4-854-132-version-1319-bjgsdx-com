function startM3u8Player(playerId, sourceUrl) {
    var root = document.getElementById(playerId);

    if (!root) {
        return;
    }

    var video = root.querySelector('video');
    var layer = root.querySelector('.play-layer');
    var started = false;
    var hlsInstance = null;

    if (!video || !layer || !sourceUrl) {
        return;
    }

    function attachAndPlay() {
        if (started) {
            video.play();
            return;
        }

        started = true;
        layer.classList.add('is-hidden');

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = sourceUrl;
            video.play();
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({ enableWorker: true });
            hlsInstance.loadSource(sourceUrl);
            hlsInstance.attachMedia(video);
            hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                video.play();
            });
            return;
        }

        video.src = sourceUrl;
        video.play();
    }

    layer.addEventListener('click', attachAndPlay);

    video.addEventListener('click', function () {
        if (video.paused) {
            attachAndPlay();
        }
    });

    window.addEventListener('pagehide', function () {
        if (hlsInstance) {
            hlsInstance.destroy();
            hlsInstance = null;
        }
    });
}
