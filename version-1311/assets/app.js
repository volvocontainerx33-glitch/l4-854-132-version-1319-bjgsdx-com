(function () {
  function all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function one(selector, root) {
    return (root || document).querySelector(selector);
  }

  function initMenu() {
    var header = one(".site-header");
    var button = one(".nav-toggle");
    if (!header || !button) {
      return;
    }
    button.addEventListener("click", function () {
      header.classList.toggle("is-open");
    });
  }

  function initHero() {
    var hero = one(".hero");
    if (!hero) {
      return;
    }
    var slides = all(".hero-slide", hero);
    var dots = all(".hero-dots button", hero);
    if (slides.length < 2) {
      return;
    }
    var index = 0;
    var timer;

    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }

    function start() {
      clearInterval(timer);
      timer = setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
        start();
      });
    });

    start();
  }

  function uniqueValues(cards, key) {
    var values = {};
    cards.forEach(function (card) {
      var value = card.getAttribute("data-" + key);
      if (value) {
        values[value] = true;
      }
    });
    return Object.keys(values).sort(function (a, b) {
      return String(a).localeCompare(String(b), "zh-Hans-CN");
    });
  }

  function fillSelect(select, values) {
    if (!select) {
      return;
    }
    var first = select.querySelector("option");
    select.innerHTML = "";
    if (first) {
      select.appendChild(first);
    }
    values.forEach(function (value) {
      var option = document.createElement("option");
      option.value = value;
      option.textContent = value;
      select.appendChild(option);
    });
  }

  function initFilters() {
    all("[data-filter-scope]").forEach(function (scope) {
      var cards = all(".movie-card", scope);
      var search = one(".js-search", scope);
      var region = one(".js-filter-region", scope);
      var type = one(".js-filter-type", scope);
      var year = one(".js-filter-year", scope);
      var cat = one(".js-filter-cat", scope);
      var empty = one(".empty-state", scope);

      fillSelect(region, uniqueValues(cards, "region"));
      fillSelect(type, uniqueValues(cards, "type"));
      fillSelect(year, uniqueValues(cards, "year").reverse());

      function apply() {
        var q = search ? search.value.trim().toLowerCase() : "";
        var regionValue = region ? region.value : "";
        var typeValue = type ? type.value : "";
        var yearValue = year ? year.value : "";
        var catValue = cat ? cat.value : "";
        var visible = 0;

        cards.forEach(function (card) {
          var text = card.getAttribute("data-search") || "";
          var ok = true;
          if (q && text.indexOf(q) === -1) {
            ok = false;
          }
          if (regionValue && card.getAttribute("data-region") !== regionValue) {
            ok = false;
          }
          if (typeValue && card.getAttribute("data-type") !== typeValue) {
            ok = false;
          }
          if (yearValue && card.getAttribute("data-year") !== yearValue) {
            ok = false;
          }
          if (catValue && card.getAttribute("data-cat") !== catValue) {
            ok = false;
          }
          card.hidden = !ok;
          if (ok) {
            visible += 1;
          }
        });

        if (empty) {
          empty.classList.toggle("is-visible", visible === 0);
        }
      }

      [search, region, type, year, cat].forEach(function (item) {
        if (item) {
          item.addEventListener("input", apply);
          item.addEventListener("change", apply);
        }
      });

      apply();
    });
  }

  window.initMoviePlayer = function (streamUrl) {
    var video = document.getElementById("movieVideo");
    var overlay = document.getElementById("playCover");
    if (!video || !streamUrl) {
      return;
    }
    var attached = false;
    var hlsInstance = null;

    function attach() {
      if (attached) {
        return;
      }
      attached = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = streamUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(streamUrl);
        hlsInstance.attachMedia(video);
      } else {
        video.src = streamUrl;
      }
    }

    function play() {
      attach();
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
      var attempt = video.play();
      if (attempt && typeof attempt.catch === "function") {
        attempt.catch(function () {
          if (overlay) {
            overlay.classList.remove("is-hidden");
          }
        });
      }
    }

    if (overlay) {
      overlay.addEventListener("click", play);
    }

    video.addEventListener("click", function () {
      if (!attached || video.paused) {
        play();
      }
    });

    window.addEventListener("pagehide", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
        hlsInstance = null;
      }
    });
  };

  document.addEventListener("DOMContentLoaded", function () {
    initMenu();
    initHero();
    initFilters();
  });
})();
