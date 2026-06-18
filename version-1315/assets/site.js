(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
      return;
    }
    document.addEventListener('DOMContentLoaded', fn);
  }

  function initMenu() {
    var toggle = document.querySelector('[data-menu-toggle]');
    var menu = document.querySelector('[data-mobile-menu]');
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener('click', function () {
      menu.classList.toggle('open');
    });
  }

  function initHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5500);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        restart();
      });
    });
    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        restart();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        restart();
      });
    }
    restart();
  }

  function initFiltering() {
    document.querySelectorAll('[data-filter-scope]').forEach(function (scope) {
      var input = scope.querySelector('[data-filter-input]');
      var year = scope.querySelector('[data-year-filter]');
      var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-movie-card]'));
      function apply() {
        var keyword = input ? input.value.trim().toLowerCase() : '';
        var yearValue = year ? year.value : '';
        cards.forEach(function (card) {
          var haystack = [
            card.getAttribute('data-title'),
            card.getAttribute('data-year'),
            card.getAttribute('data-region'),
            card.getAttribute('data-genre'),
            card.getAttribute('data-tags'),
            card.getAttribute('data-category')
          ].join(' ').toLowerCase();
          var matchedKeyword = !keyword || haystack.indexOf(keyword) !== -1;
          var matchedYear = !yearValue || card.getAttribute('data-year') === yearValue;
          card.classList.toggle('hidden-card', !(matchedKeyword && matchedYear));
        });
      }
      if (input) {
        input.addEventListener('input', apply);
      }
      if (year) {
        year.addEventListener('change', apply);
      }
      apply();
    });
  }

  function searchCard(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');
    return '<a class="movie-card" href="./' + escapeHtml(movie.file) + '" data-movie-card>' +
      '<span class="poster-wrap">' +
      '<img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
      '<span class="poster-shade"></span>' +
      '<span class="play-badge">▶</span>' +
      '</span>' +
      '<span class="card-body">' +
      '<span class="card-title">' + escapeHtml(movie.title) + '</span>' +
      '<span class="card-meta">' + escapeHtml(movie.year) + ' · ' + escapeHtml(movie.region) + ' · ' + escapeHtml(movie.type) + '</span>' +
      '<span class="card-desc">' + escapeHtml(movie.oneLine) + '</span>' +
      '<span class="tag-row">' + tags + '</span>' +
      '</span>' +
      '</a>';
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function initSearchPage() {
    var container = document.querySelector('[data-search-results]');
    var status = document.querySelector('[data-search-status]');
    var input = document.getElementById('searchBox');
    if (!container || !status || !window.SEARCH_MOVIES) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';
    if (input) {
      input.value = query;
    }
    var keyword = query.trim().toLowerCase();
    var results = window.SEARCH_MOVIES;
    if (keyword) {
      results = results.filter(function (movie) {
        return [movie.title, movie.year, movie.region, movie.type, movie.genre, (movie.tags || []).join(' '), movie.oneLine]
          .join(' ')
          .toLowerCase()
          .indexOf(keyword) !== -1;
      });
    } else {
      results = results.slice(0, 48);
    }
    status.textContent = keyword ? '搜索：' + query + '，相关影片如下' : '输入关键词，或先浏览下方精选内容';
    container.innerHTML = results.slice(0, 96).map(searchCard).join('');
  }

  ready(function () {
    initMenu();
    initHero();
    initFiltering();
    initSearchPage();
  });
})();
