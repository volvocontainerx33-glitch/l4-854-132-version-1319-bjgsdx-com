(function () {
    var menuButton = document.querySelector('[data-menu-button]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            mobileNav.classList.toggle('open');
        });
    }

    var hero = document.querySelector('[data-hero]');

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
        var current = 0;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }

            current = (index + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('hero-slide-active', slideIndex === current);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === current);
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                showSlide(Number(dot.getAttribute('data-slide')) || 0);
            });
        });

        if (slides.length > 1) {
            setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        }
    }

    var searchInputs = Array.prototype.slice.call(document.querySelectorAll('[data-search-input]'));

    searchInputs.forEach(function (input) {
        var root = input.closest('.container') || document;
        var scope = document;
        var cardArea = root.parentElement ? root.parentElement.querySelector('[data-card-area]') : null;
        var cards = Array.prototype.slice.call((cardArea || scope).querySelectorAll('[data-card]'));
        var filterRow = root.querySelector('[data-filter-row]');
        var activeFilter = 'all';

        function applyFilter() {
            var query = input.value.trim().toLowerCase();

            cards.forEach(function (card) {
                var value = (card.getAttribute('data-search') || '').toLowerCase();
                var matchQuery = !query || value.indexOf(query) !== -1;
                var matchFilter = activeFilter === 'all' || value.indexOf(activeFilter.toLowerCase()) !== -1;
                card.classList.toggle('is-hidden-card', !(matchQuery && matchFilter));
            });
        }

        input.addEventListener('input', applyFilter);

        if (filterRow) {
            Array.prototype.slice.call(filterRow.querySelectorAll('[data-filter]')).forEach(function (button) {
                button.addEventListener('click', function () {
                    activeFilter = button.getAttribute('data-filter') || 'all';
                    Array.prototype.slice.call(filterRow.querySelectorAll('[data-filter]')).forEach(function (item) {
                        item.classList.toggle('active', item === button);
                    });
                    applyFilter();
                });
            });
        }
    });
})();
