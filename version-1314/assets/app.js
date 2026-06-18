(function () {
  function qs(selector, parent) {
    return (parent || document).querySelector(selector);
  }

  function qsa(selector, parent) {
    return Array.prototype.slice.call((parent || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function initMobileMenu() {
    var toggle = qs('[data-menu-toggle]');
    var panel = qs('[data-mobile-panel]');
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  function initHeroCarousel() {
    var carousel = qs('[data-hero-carousel]');
    if (!carousel) {
      return;
    }
    var slides = qsa('[data-hero-slide]', carousel);
    var dots = qsa('[data-hero-dot]', carousel);
    var current = 0;
    var timer;

    function show(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function start() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5000);
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        show(index);
        start();
      });
    });

    show(0);
    start();
  }

  function initLocalFilters() {
    qsa('[data-filter-panel]').forEach(function (panel) {
      var keywordInput = qs('[data-filter-keyword]', panel);
      var yearSelect = qs('[data-filter-year]', panel);
      var regionSelect = qs('[data-filter-region]', panel);
      var countEl = qs('[data-visible-count]', panel);
      var cards = qsa('.movie-card', document);

      function applyFilters() {
        var keyword = normalize(keywordInput && keywordInput.value);
        var year = normalize(yearSelect && yearSelect.value);
        var region = normalize(regionSelect && regionSelect.value);
        var visible = 0;

        cards.forEach(function (card) {
          var haystack = normalize([
            card.dataset.title,
            card.dataset.genre,
            card.dataset.tags,
            card.textContent
          ].join(' '));
          var matchesKeyword = !keyword || haystack.indexOf(keyword) !== -1;
          var matchesYear = !year || normalize(card.dataset.year) === year;
          var matchesRegion = !region || normalize(card.dataset.region) === region;
          var shouldShow = matchesKeyword && matchesYear && matchesRegion;
          card.classList.toggle('is-hidden', !shouldShow);
          if (shouldShow) {
            visible += 1;
          }
        });

        if (countEl) {
          countEl.textContent = visible;
        }
      }

      [keywordInput, yearSelect, regionSelect].forEach(function (control) {
        if (control) {
          control.addEventListener('input', applyFilters);
          control.addEventListener('change', applyFilters);
        }
      });

      applyFilters();
    });
  }

  function movieCard(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');

    return '' +
      '<article class="movie-card" data-title="' + escapeHtml(movie.title) + '" data-year="' + escapeHtml(movie.year) + '" data-region="' + escapeHtml(movie.region) + '" data-genre="' + escapeHtml(movie.genre) + '" data-tags="' + escapeHtml((movie.tags || []).join('，')) + '">' +
        '<a class="card-link" href="' + escapeHtml(movie.href) + '">' +
          '<div class="poster-wrap">' +
            '<img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
            '<span class="poster-category">' + escapeHtml(movie.genrePrimary) + '</span>' +
            '<span class="poster-duration">' + escapeHtml(movie.duration) + '</span>' +
            '<span class="play-hover">▶</span>' +
          '</div>' +
          '<div class="card-body">' +
            '<h3>' + escapeHtml(movie.title) + '</h3>' +
            '<p>' + escapeHtml(movie.oneLine || movie.summary || '') + '</p>' +
            '<div class="card-meta">' +
              '<span>' + escapeHtml(movie.year) + '</span>' +
              '<span>' + escapeHtml(movie.region) + '</span>' +
              '<span>' + escapeHtml(movie.type) + '</span>' +
            '</div>' +
            '<div class="tag-row">' + tags + '</div>' +
            '<div class="card-stats">' +
              '<span>' + Number(movie.views || 0).toLocaleString() + ' 次观看</span>' +
              '<span>★ ' + escapeHtml(movie.rating) + '</span>' +
            '</div>' +
          '</div>' +
        '</a>' +
      '</article>';
  }

  function initSearchPage() {
    var results = qs('#searchResults');
    var summary = qs('#searchSummary');
    var input = qs('#searchPageInput');
    if (!results || !summary || !window.MOVIES) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';
    if (input) {
      input.value = query;
    }

    var keyword = normalize(query);
    var source = window.MOVIES || [];
    var matched = keyword
      ? source.filter(function (movie) {
          var haystack = normalize([
            movie.title,
            movie.region,
            movie.type,
            movie.year,
            movie.genre,
            (movie.tags || []).join(' '),
            movie.oneLine,
            movie.summary
          ].join(' '));
          return haystack.indexOf(keyword) !== -1;
        })
      : source.slice(0, 48);

    summary.textContent = keyword
      ? '“' + query + '” 共找到 ' + matched.length + ' 个结果，优先显示前 200 个。'
      : '显示片库中的精选影片，可输入关键词进一步检索。';

    results.innerHTML = matched.slice(0, 200).map(movieCard).join('');
  }

  function initPlayers() {
    qsa('[data-player]').forEach(function (box) {
      var video = qs('video', box);
      var startButton = qs('[data-player-start]', box);
      var status = qs('[data-player-status]', box);
      var source = box.getAttribute('data-m3u8');
      var hlsInstance = null;
      var started = false;

      function setStatus(message) {
        if (status) {
          status.textContent = message;
        }
      }

      function attachSource() {
        if (!video || !source || started) {
          return;
        }
        started = true;
        video.setAttribute('controls', 'controls');

        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
            setStatus('播放源已加载，正在开始播放。');
            video.play().catch(function () {
              setStatus('播放源已加载，请点击视频上的播放按钮。');
            });
          });
          hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal) {
              setStatus('播放过程中遇到网络或媒体错误，可刷新页面后重试。');
            }
          });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
          video.addEventListener('loadedmetadata', function () {
            setStatus('播放源已加载，正在开始播放。');
            video.play().catch(function () {
              setStatus('播放源已加载，请点击视频上的播放按钮。');
            });
          }, { once: true });
        } else {
          setStatus('当前浏览器不支持 HLS 播放，请更换现代浏览器。');
        }
      }

      if (startButton) {
        startButton.addEventListener('click', function () {
          startButton.classList.add('is-hidden');
          attachSource();
        });
      }

      if (video) {
        video.addEventListener('play', function () {
          if (startButton) {
            startButton.classList.add('is-hidden');
          }
        });
      }

      window.addEventListener('beforeunload', function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMobileMenu();
    initHeroCarousel();
    initLocalFilters();
    initSearchPage();
    initPlayers();
  });
})();
