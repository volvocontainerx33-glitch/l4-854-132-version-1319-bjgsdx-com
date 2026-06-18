(function () {
    function qs(value, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(value));
    }

    function escapeHtml(value) {
        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
    }

    function initMobile() {
        var button = document.querySelector("[data-mobile-toggle]");
        var panel = document.querySelector("[data-mobile-panel]");
        if (!button || !panel) {
            return;
        }
        button.addEventListener("click", function () {
            var open = panel.classList.toggle("open");
            button.setAttribute("aria-expanded", open ? "true" : "false");
        });
    }

    function initHero() {
        var slider = document.querySelector("[data-hero-slider]");
        if (!slider) {
            return;
        }
        var slides = qs(".hero-slide", slider);
        var dots = qs("[data-hero-dot]");
        var current = 0;
        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("active", i === current);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("active", i === current);
            });
        }
        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                show(index);
            });
        });
        if (slides.length > 1) {
            window.setInterval(function () {
                show(current + 1);
            }, 5600);
        }
        show(0);
    }

    function initFilters() {
        qs("[data-filter-scope]").forEach(function (scope) {
            var controls = qs("[data-filter]", scope);
            var cards = qs(".searchable-card", scope);
            var empty = scope.querySelector("[data-empty-message]");
            function valueOf(name) {
                var control = scope.querySelector('[data-filter="' + name + '"]');
                return control ? control.value.trim().toLowerCase() : "";
            }
            function apply() {
                var keyword = valueOf("keyword");
                var year = valueOf("year");
                var region = valueOf("region");
                var type = valueOf("type");
                var visible = 0;
                cards.forEach(function (card) {
                    var text = (card.dataset.title + " " + card.dataset.genre + " " + card.dataset.tags + " " + card.dataset.region + " " + card.dataset.type).toLowerCase();
                    var ok = true;
                    if (keyword && text.indexOf(keyword) === -1) {
                        ok = false;
                    }
                    if (year && card.dataset.year !== year) {
                        ok = false;
                    }
                    if (region && card.dataset.region !== region) {
                        ok = false;
                    }
                    if (type && card.dataset.type !== type) {
                        ok = false;
                    }
                    card.style.display = ok ? "" : "none";
                    if (ok) {
                        visible += 1;
                    }
                });
                if (empty) {
                    empty.classList.toggle("show", visible === 0);
                }
            }
            controls.forEach(function (control) {
                control.addEventListener(control.tagName === "SELECT" ? "change" : "input", apply);
            });
            apply();
        });
    }

    function resultCard(item) {
        return [
            '<article class="movie-card searchable-card" data-title="' + escapeHtml(item.title) + '" data-year="' + escapeHtml(item.year) + '" data-region="' + escapeHtml(item.region) + '" data-type="' + escapeHtml(item.type) + '" data-genre="' + escapeHtml(item.genre) + '" data-tags="' + escapeHtml(item.tags) + '">',
            '<a class="poster-link" href="./' + escapeHtml(item.file) + '">',
            '<img src="' + escapeHtml(item.cover) + '" alt="' + escapeHtml(item.title) + '" loading="lazy" decoding="async">',
            '<span class="card-badge">' + escapeHtml(item.year) + '</span>',
            '<span class="card-play">▶</span>',
            '</a>',
            '<div class="movie-card-body">',
            '<div class="card-meta"><span>' + escapeHtml(item.category) + '</span><span>' + escapeHtml(item.region) + '</span></div>',
            '<h3><a href="./' + escapeHtml(item.file) + '">' + escapeHtml(item.title) + '</a></h3>',
            '<p>' + escapeHtml(item.oneLine) + '</p>',
            '<div class="card-tags"><span>' + escapeHtml(item.type) + '</span><span>' + escapeHtml(item.genre.split("/")[0].trim()) + '</span></div>',
            '</div>',
            '</article>'
        ].join("");
    }

    function initSearchPage() {
        var input = document.querySelector("[data-search-input]");
        var results = document.querySelector("[data-search-results]");
        var count = document.querySelector("[data-search-count]");
        if (!input || !results || !window.SEARCH_ITEMS) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var initial = params.get("q") || "";
        input.value = initial;
        function render() {
            var term = input.value.trim().toLowerCase();
            var items = window.SEARCH_ITEMS;
            if (term) {
                items = items.filter(function (item) {
                    var text = [item.title, item.oneLine, item.genre, item.region, item.type, item.year, item.tags, item.category].join(" ").toLowerCase();
                    return text.indexOf(term) !== -1;
                });
            } else {
                items = items.slice(0, 24);
            }
            if (count) {
                count.textContent = term ? String(items.length) : "热门推荐";
            }
            results.innerHTML = items.slice(0, 96).map(resultCard).join("");
        }
        input.addEventListener("input", render);
        render();
    }

    document.addEventListener("DOMContentLoaded", function () {
        initMobile();
        initHero();
        initFilters();
        initSearchPage();
    });
})();
