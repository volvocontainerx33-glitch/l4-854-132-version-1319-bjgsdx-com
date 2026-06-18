(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  function setupMenu() {
    var toggle = document.querySelector('.menu-toggle');
    var panel = document.querySelector('.mobile-panel');
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener('click', function () {
      var expanded = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!expanded));
      panel.hidden = expanded;
      toggle.textContent = expanded ? '☰' : '×';
    });
  }

  function setupHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
    if (!slides.length || !dots.length) {
      return;
    }
    var index = 0;
    var timer = null;
    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
      });
    }
    function restart() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-slide') || 0));
        restart();
      });
    });
    restart();
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function setupPageFilter() {
    var input = document.querySelector('.page-filter');
    var scope = document.querySelector('.filter-scope');
    if (!input || !scope) {
      return;
    }
    var cards = Array.prototype.slice.call(scope.querySelectorAll('.movie-card'));
    input.addEventListener('input', function () {
      var q = normalize(input.value);
      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-tags'),
          card.getAttribute('data-year'),
          card.getAttribute('data-region')
        ].join(' '));
        card.classList.toggle('is-hidden-card', q && haystack.indexOf(q) === -1);
      });
    });
  }

  function cardTemplate(movie) {
    return [
      '<article class="movie-card">',
      '<a href="movie-' + movie.id + '.html" class="card-cover" aria-label="观看' + escapeHtml(movie.title) + '">',
      '<img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
      '<span class="play-chip">▶</span>',
      '<span class="duration-chip">' + escapeHtml(movie.duration) + '</span>',
      '<span class="category-chip">' + escapeHtml(movie.category) + '</span>',
      '</a>',
      '<div class="card-body">',
      '<h2><a href="movie-' + movie.id + '.html">' + escapeHtml(movie.title) + '</a></h2>',
      '<p>' + escapeHtml(movie.oneLine) + '</p>',
      '<div class="movie-meta">',
      '<span>' + escapeHtml(movie.region) + '</span>',
      '<span>' + escapeHtml(movie.type) + '</span>',
      '<span>' + escapeHtml(movie.year) + '</span>',
      '<span>★ ' + escapeHtml(movie.rating) + '</span>',
      '</div>',
      '</div>',
      '</article>'
    ].join('');
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function setupSearchPage() {
    var list = window.SEARCH_INDEX || (typeof SEARCH_INDEX !== 'undefined' ? SEARCH_INDEX : null);
    var results = document.getElementById('searchResults');
    var input = document.getElementById('searchInput');
    var title = document.getElementById('searchTitle');
    var summary = document.getElementById('searchSummary');
    if (!list || !results || !input || !title || !summary) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var q = params.get('q') || '';
    input.value = q;
    var query = normalize(q);
    if (!query) {
      results.innerHTML = '';
      return;
    }
    var matched = list.filter(function (movie) {
      var haystack = normalize([
        movie.title,
        movie.oneLine,
        movie.genre,
        movie.tags,
        movie.region,
        movie.type,
        movie.year,
        movie.category
      ].join(' '));
      return haystack.indexOf(query) !== -1;
    });
    title.textContent = '“' + q + '”的搜索结果';
    summary.textContent = matched.length ? '以下内容与关键词相关。' : '没有找到匹配内容，可尝试更换关键词。';
    results.innerHTML = matched.slice(0, 160).map(cardTemplate).join('');
  }

  window.initMoviePlayer = function (source) {
    var video = document.getElementById('movieVideo');
    var overlay = document.getElementById('playOverlay');
    if (!video || !source) {
      return;
    }
    var attached = false;
    var hlsInstance = null;
    function attach() {
      if (attached) {
        return;
      }
      attached = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
      } else {
        video.src = source;
      }
    }
    function play() {
      attach();
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
      var started = video.play();
      if (started && typeof started.catch === 'function') {
        started.catch(function () {});
      }
    }
    if (overlay) {
      overlay.addEventListener('click', play);
    }
    video.addEventListener('click', function () {
      if (video.paused) {
        play();
      }
    });
    video.addEventListener('play', function () {
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
    });
    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  };

  ready(function () {
    setupMenu();
    setupHero();
    setupPageFilter();
    setupSearchPage();
  });
}());
