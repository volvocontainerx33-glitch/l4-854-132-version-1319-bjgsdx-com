document.addEventListener("DOMContentLoaded", function () {
  var params = new URLSearchParams(window.location.search);
  var query = (params.get("q") || "").trim();
  var input = document.querySelector("[data-search-input]");
  var resultTitle = document.querySelector("[data-result-title]");
  var resultGrid = document.querySelector("[data-result-grid]");

  if (input) {
    input.value = query;
  }

  function escapeHtml(value) {
    return String(value || "").replace(/[&<>"]/g, function (item) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;"
      }[item];
    });
  }

  function card(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return "<span>" + escapeHtml(tag) + "</span>";
    }).join("");

    return [
      "<article class=\"movie-card\">",
      "<a class=\"poster-link\" href=\"" + escapeHtml(movie.url) + "\" title=\"" + escapeHtml(movie.title) + "\">",
      "<img src=\"" + escapeHtml(movie.poster) + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\">",
      "<span class=\"card-type\">" + escapeHtml(movie.type) + "</span>",
      "<span class=\"card-score\">" + escapeHtml(movie.rating) + "</span>",
      "</a>",
      "<div class=\"card-body\">",
      "<h3><a href=\"" + escapeHtml(movie.url) + "\">" + escapeHtml(movie.title) + "</a></h3>",
      "<p>" + escapeHtml(movie.description) + "</p>",
      "<div class=\"card-meta\"><span>" + escapeHtml(movie.year) + "</span><span>" + escapeHtml(movie.region) + "</span><span>" + escapeHtml(movie.category) + "</span></div>",
      "<div class=\"tag-row\">" + tags + "</div>",
      "</div>",
      "</article>"
    ].join("");
  }

  if (!resultGrid || !resultTitle) {
    return;
  }

  if (!query) {
    resultTitle.textContent = "输入关键词查找影片";
    resultGrid.innerHTML = "<div class=\"empty-state\">可按影片名、类型、地区、年份或标签检索。</div>";
    return;
  }

  var lower = query.toLowerCase();
  var results = MOVIE_INDEX.filter(function (movie) {
    return [
      movie.title,
      movie.description,
      movie.genre,
      movie.region,
      movie.type,
      movie.year,
      movie.category,
      (movie.tags || []).join(" ")
    ].join(" ").toLowerCase().indexOf(lower) !== -1;
  });

  resultTitle.textContent = "“" + query + "” 找到 " + results.length + " 部影片";

  if (!results.length) {
    resultGrid.innerHTML = "<div class=\"empty-state\">没有找到相关影片，可以换一个关键词继续搜索。</div>";
    return;
  }

  resultGrid.innerHTML = results.slice(0, 240).map(card).join("");
});
