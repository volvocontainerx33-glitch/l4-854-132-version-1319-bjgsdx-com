(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  function initMenu() {
    var toggle = document.querySelector('[data-menu-toggle]');
    var panel = document.querySelector('[data-mobile-panel]');
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  function initHeaderSearch() {
    document.querySelectorAll('[data-search-form]').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        var input = form.querySelector('input[name="q"]');
        var query = input ? input.value.trim() : '';
        var target = './search.html';
        if (query) {
          target += '?q=' + encodeURIComponent(query);
        }
        window.location.href = target;
      });
    });
  }

  function initHero() {
    var slider = document.querySelector('[data-hero-slider]');
    if (!slider) {
      return;
    }
    var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        start();
      });
    });

    slider.addEventListener('mouseenter', stop);
    slider.addEventListener('mouseleave', start);
    start();
  }

  function normalize(value) {
    return (value || '').toString().toLowerCase();
  }

  function initLiveSearch() {
    var input = document.querySelector('[data-live-search-input]');
    var form = document.querySelector('[data-live-search-form]');
    var list = document.querySelector('[data-search-list]');
    var empty = document.querySelector('[data-empty-state]');
    if (!input || !list) {
      return;
    }
    var cards = Array.prototype.slice.call(list.querySelectorAll('.movie-card'));
    var activeCategory = 'all';
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';
    input.value = query;

    function apply() {
      var term = normalize(input.value.trim());
      var visible = 0;
      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-category'),
          card.textContent
        ].join(' '));
        var category = card.getAttribute('data-category') || '';
        var okCategory = activeCategory === 'all' || category === activeCategory;
        var okTerm = !term || haystack.indexOf(term) !== -1;
        var show = okCategory && okTerm;
        card.hidden = !show;
        if (show) {
          visible += 1;
        }
      });
      if (empty) {
        empty.hidden = visible !== 0;
      }
    }

    input.addEventListener('input', apply);
    if (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        apply();
      });
    }
    document.querySelectorAll('[data-filter-category]').forEach(function (button) {
      button.addEventListener('click', function () {
        activeCategory = button.getAttribute('data-filter-category') || 'all';
        document.querySelectorAll('[data-filter-category]').forEach(function (item) {
          item.classList.toggle('is-active', item === button);
        });
        apply();
      });
    });
    apply();
  }

  function attachStream(video, url) {
    if (!url) {
      return;
    }
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = url;
      return;
    }
    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls();
      hls.loadSource(url);
      hls.attachMedia(video);
      video._hlsInstance = hls;
      return;
    }
    video.src = url;
  }

  function initPlayers() {
    document.querySelectorAll('.video-shell').forEach(function (shell) {
      var video = shell.querySelector('video[data-stream]');
      var button = shell.querySelector('.player-cover');
      if (!video || !button) {
        return;
      }
      var loaded = false;
      function start() {
        if (!loaded) {
          attachStream(video, video.getAttribute('data-stream'));
          loaded = true;
        }
        button.setAttribute('hidden', 'hidden');
        shell.classList.add('is-playing');
        var playResult = video.play();
        if (playResult && typeof playResult.catch === 'function') {
          playResult.catch(function () {});
        }
      }
      button.addEventListener('click', start);
      video.addEventListener('click', function () {
        if (video.paused) {
          var playResult = video.play();
          if (playResult && typeof playResult.catch === 'function') {
            playResult.catch(function () {});
          }
        }
      });
    });
  }

  ready(function () {
    initMenu();
    initHeaderSearch();
    initHero();
    initLiveSearch();
    initPlayers();
  });
})();
