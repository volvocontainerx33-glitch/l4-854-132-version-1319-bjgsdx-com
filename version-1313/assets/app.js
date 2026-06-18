(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var nav = document.querySelector('[data-main-nav]');

    if (menuButton && nav) {
        menuButton.addEventListener('click', function () {
            nav.classList.toggle('open');
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var current = 0;

    function setSlide(index) {
        if (!slides.length) {
            return;
        }
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle('active', slideIndex === current);
        });
        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle('active', dotIndex === current);
        });
    }

    dots.forEach(function (dot, index) {
        dot.addEventListener('click', function () {
            setSlide(index);
        });
    });

    if (slides.length > 1) {
        setInterval(function () {
            setSlide(current + 1);
        }, 5200);
    }

    setSlide(0);

    var searchInputs = Array.prototype.slice.call(document.querySelectorAll('[data-search-input]'));
    var typeSelect = document.querySelector('[data-filter-type]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-title]'));
    var noResult = document.querySelector('[data-no-result]');

    function normalize(value) {
        return String(value || '').trim().toLowerCase();
    }

    function applyFilter() {
        if (!cards.length) {
            return;
        }
        var query = normalize(searchInputs.map(function (input) {
            return input.value;
        }).join(' '));
        var type = typeSelect ? normalize(typeSelect.value) : '';
        var shown = 0;

        cards.forEach(function (card) {
            var haystack = normalize(card.getAttribute('data-title') + ' ' + card.getAttribute('data-tags') + ' ' + card.getAttribute('data-year'));
            var typeMatch = !type || haystack.indexOf(type) !== -1;
            var queryMatch = !query || haystack.indexOf(query) !== -1;
            var visible = typeMatch && queryMatch;
            card.style.display = visible ? '' : 'none';
            if (visible) {
                shown += 1;
            }
        });

        if (noResult) {
            noResult.classList.toggle('show', shown === 0);
        }
    }

    searchInputs.forEach(function (input) {
        input.addEventListener('input', applyFilter);
    });

    if (typeSelect) {
        typeSelect.addEventListener('change', applyFilter);
    }
})();

function initPlayer(videoUrl) {
    var video = document.querySelector('[data-player-video]');
    var overlay = document.querySelector('[data-player-overlay]');
    var playButton = document.querySelector('[data-player-button]');
    var started = false;
    var hlsPlayer = null;

    if (!video || !videoUrl) {
        return;
    }

    function attachVideo() {
        if (started) {
            return;
        }
        started = true;

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = videoUrl;
            video.play().catch(function () {});
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            hlsPlayer = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hlsPlayer.loadSource(videoUrl);
            hlsPlayer.attachMedia(video);
            hlsPlayer.on(window.Hls.Events.MANIFEST_PARSED, function () {
                video.play().catch(function () {});
            });
            return;
        }

        video.src = videoUrl;
        video.play().catch(function () {});
    }

    function startPlayback() {
        if (overlay) {
            overlay.classList.add('is-hidden');
        }
        attachVideo();
        video.play().catch(function () {});
    }

    if (overlay) {
        overlay.addEventListener('click', startPlayback);
    }

    if (playButton) {
        playButton.addEventListener('click', function (event) {
            event.stopPropagation();
            startPlayback();
        });
    }

    video.addEventListener('click', function () {
        if (video.paused) {
            startPlayback();
        }
    });

    video.addEventListener('play', function () {
        if (overlay) {
            overlay.classList.add('is-hidden');
        }
    });
}
