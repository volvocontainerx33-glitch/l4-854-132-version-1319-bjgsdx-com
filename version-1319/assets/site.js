(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function initMenu() {
        var button = document.querySelector("[data-menu-button]");
        var nav = document.querySelector("[data-mobile-nav]");
        if (!button || !nav) {
            return;
        }
        button.addEventListener("click", function () {
            nav.classList.toggle("open");
        });
    }

    function initHero() {
        var carousel = document.querySelector("[data-hero-carousel]");
        if (!carousel) {
            return;
        }
        var slides = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-dot]"));
        var prev = carousel.querySelector("[data-hero-prev]");
        var next = carousel.querySelector("[data-hero-next]");
        var index = 0;
        var timer;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("active", i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("active", i === index);
            });
        }

        function play() {
            timer = window.setInterval(function () {
                show(index + 1);
            }, 4800);
        }

        function restart() {
            window.clearInterval(timer);
            play();
        }

        dots.forEach(function (dot, i) {
            dot.addEventListener("click", function () {
                show(i);
                restart();
            });
        });

        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
                restart();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                restart();
            });
        }

        play();
    }

    function initFilters() {
        var lists = Array.prototype.slice.call(document.querySelectorAll("[data-filter-list]"));
        lists.forEach(function (list) {
            var section = list.closest("section") || document;
            var input = section.querySelector("[data-filter-input]");
            var buttons = Array.prototype.slice.call(section.querySelectorAll("[data-filter-value]"));
            var empty = section.querySelector("[data-empty-state]");
            var activeValue = "all";

            function apply() {
                var query = input ? input.value.trim().toLowerCase() : "";
                var visible = 0;
                Array.prototype.slice.call(list.children).forEach(function (card) {
                    var haystack = (card.getAttribute("data-search") || "").toLowerCase();
                    var kind = card.getAttribute("data-kind") || "";
                    var region = card.getAttribute("data-region") || "";
                    var category = card.getAttribute("data-category") || "";
                    var textMatch = !query || haystack.indexOf(query) !== -1;
                    var filterMatch = activeValue === "all" || kind === activeValue || region === activeValue || category === activeValue || haystack.indexOf(activeValue.toLowerCase()) !== -1;
                    var shouldShow = textMatch && filterMatch;
                    card.style.display = shouldShow ? "" : "none";
                    if (shouldShow) {
                        visible += 1;
                    }
                });
                if (empty) {
                    empty.style.display = visible ? "none" : "block";
                }
            }

            if (input) {
                input.addEventListener("input", apply);
            }

            buttons.forEach(function (button) {
                button.addEventListener("click", function () {
                    activeValue = button.getAttribute("data-filter-value") || "all";
                    buttons.forEach(function (item) {
                        item.classList.toggle("active", item === button);
                    });
                    apply();
                });
            });
        });
    }

    function cardHtml(item) {
        var tags = item.tags.slice(0, 3).map(function (tag) {
            return "<span>" + escapeHtml(tag) + "</span>";
        }).join("");
        return "<a class=\"movie-card\" href=\"" + escapeHtml(item.file) + "\" data-search=\"" + escapeHtml(item.search) + "\">" +
            "<span class=\"poster-wrap\">" +
            "<img src=\"" + escapeHtml(item.cover) + "\" alt=\"" + escapeHtml(item.title) + "\" loading=\"lazy\">" +
            "<span class=\"poster-gradient\"></span>" +
            "<span class=\"poster-badge\">" + escapeHtml(item.year) + "</span>" +
            "<span class=\"poster-play\">▶</span>" +
            "</span>" +
            "<span class=\"card-body\">" +
            "<span class=\"card-meta\"><span>" + escapeHtml(item.region) + "</span><span>" + escapeHtml(item.type) + "</span></span>" +
            "<strong>" + escapeHtml(item.title) + "</strong>" +
            "<em>" + escapeHtml(item.oneLine) + "</em>" +
            "<span class=\"tag-row\">" + tags + "</span>" +
            "</span>" +
            "</a>";
    }

    function escapeHtml(value) {
        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function initGlobalSearch() {
        var input = document.getElementById("global-search");
        var results = document.getElementById("search-results");
        var empty = document.getElementById("search-empty");
        if (!input || !results || !window.searchMovies) {
            return;
        }

        function render(items) {
            results.innerHTML = items.map(cardHtml).join("");
            if (empty) {
                empty.style.display = items.length ? "none" : "block";
            }
        }

        input.addEventListener("input", function () {
            var query = input.value.trim().toLowerCase();
            if (!query) {
                render(window.searchMovies.slice(0, 48));
                return;
            }
            var matches = window.searchMovies.filter(function (item) {
                return item.search.indexOf(query) !== -1;
            }).slice(0, 120);
            render(matches);
        });
    }

    function initPlayers() {
        var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));
        players.forEach(function (player) {
            var video = player.querySelector("video");
            var overlay = player.querySelector(".play-overlay");
            if (!video || !overlay) {
                return;
            }
            var source = video.getAttribute("data-video");
            var hls;

            function bind() {
                if (video.getAttribute("data-ready") === "1") {
                    return;
                }
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = source;
                } else if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({ enableWorker: true });
                    hls.loadSource(source);
                    hls.attachMedia(video);
                } else {
                    video.src = source;
                }
                video.setAttribute("data-ready", "1");
            }

            function start() {
                bind();
                player.classList.add("is-playing");
                video.controls = true;
                var playResult = video.play();
                if (playResult && typeof playResult.catch === "function") {
                    playResult.catch(function () {});
                }
            }

            overlay.addEventListener("click", start);
            video.addEventListener("click", function () {
                if (video.paused) {
                    start();
                }
            });
            window.addEventListener("beforeunload", function () {
                if (hls && typeof hls.destroy === "function") {
                    hls.destroy();
                }
            });
        });
    }

    ready(function () {
        initMenu();
        initHero();
        initFilters();
        initGlobalSearch();
        initPlayers();
    });
})();
