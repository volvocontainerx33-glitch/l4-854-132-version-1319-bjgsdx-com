document.addEventListener("DOMContentLoaded", function () {
  var players = Array.prototype.slice.call(document.querySelectorAll(".stream-player"));

  players.forEach(function (player) {
    var video = player.querySelector("video");
    var button = player.querySelector(".player-overlay");
    var source = video ? video.querySelector("source") : null;
    var isReady = false;
    var hls = null;

    if (!video || !button || !source) {
      return;
    }

    function prepare() {
      if (isReady) {
        return;
      }

      var streamUrl = source.getAttribute("src");

      if (!streamUrl) {
        return;
      }

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = streamUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
      } else {
        video.src = streamUrl;
      }

      isReady = true;
    }

    function start() {
      prepare();
      video.controls = true;
      button.classList.add("is-hidden");
      var promise = video.play();

      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {
          button.classList.remove("is-hidden");
        });
      }
    }

    button.addEventListener("click", start);
    video.addEventListener("play", function () {
      button.classList.add("is-hidden");
    });
    video.addEventListener("error", function () {
      if (hls) {
        hls.destroy();
        hls = null;
        isReady = false;
      }
    });
  });
});
