(function () {
    function setup(shell) {
        var video = shell.querySelector("video");
        var button = shell.querySelector(".watch-overlay");
        if (!video) {
            return;
        }
        var url = video.getAttribute("data-stream");
        function bind() {
            if (video.dataset.ready === "1") {
                return;
            }
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = url;
            } else if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({ enableWorker: true });
                hls.loadSource(url);
                hls.attachMedia(video);
                video._hls = hls;
            } else {
                video.src = url;
            }
            video.dataset.ready = "1";
        }
        function play() {
            bind();
            shell.classList.add("is-playing");
            var promise = video.play();
            if (promise && typeof promise.catch === "function") {
                promise.catch(function () {});
            }
        }
        if (button) {
            button.addEventListener("click", play);
        }
        video.addEventListener("click", function () {
            if (video.paused) {
                play();
            }
        });
    }

    document.addEventListener("DOMContentLoaded", function () {
        Array.prototype.slice.call(document.querySelectorAll(".video-shell")).forEach(setup);
    });
})();
