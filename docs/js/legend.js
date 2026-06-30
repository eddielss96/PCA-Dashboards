/* 圖例：色盲友善（顏色 + 形狀）。點擊切換群組顯示。 */
(function (global) {
  "use strict";
  var Store = global.FrogDash.Store;

  // 群組顯示開關（被關閉的群組）
  Store.disabledGroups = new Set();
  Store.toggleGroup = function (value) {
    if (this.disabledGroups.has(value)) this.disabledGroups.delete(value);
    else this.disabledGroups.add(value);
    this.emit("groups", this.disabledGroups);
  };

  // 依 plotly 符號名畫對應 SVG（圖例 / 資訊視窗共用）
  function svgSymbol(symbol, color, size) {
    size = size || 18;
    var c = size / 2, r = size * 0.38, s = "";
    function poly(pts) { return '<polygon points="' + pts + '" fill="' + color + '"/>'; }
    switch (symbol) {
      case "square": s = '<rect x="' + (c - r) + '" y="' + (c - r) + '" width="' + (2 * r) + '" height="' + (2 * r) + '" fill="' + color + '"/>'; break;
      case "diamond": s = poly([c + "," + (c - r), (c + r) + "," + c, c + "," + (c + r), (c - r) + "," + c].join(" ")); break;
      case "triangle-up": s = poly([c + "," + (c - r), (c + r) + "," + (c + r), (c - r) + "," + (c + r)].join(" ")); break;
      case "star": {
        var pts = [];
        for (var i = 0; i < 10; i++) {
          var rad = (i % 2 === 0) ? r : r * 0.45;
          var a = Math.PI / 5 * i - Math.PI / 2;
          pts.push((c + rad * Math.cos(a)).toFixed(1) + "," + (c + rad * Math.sin(a)).toFixed(1));
        }
        s = poly(pts.join(" ")); break;
      }
      default: s = '<circle cx="' + c + '" cy="' + c + '" r="' + r + '" fill="' + color + '"/>';
    }
    return '<svg class="swatch" viewBox="0 0 ' + size + ' ' + size + '" width="' + size + '" height="' + size + '">' + s + '</svg>';
  }

  function render(model) {
    var ul = document.getElementById("legend");
    ul.innerHTML = "";
    // 各群組計數
    var counts = {};
    Object.keys(model.taxa).forEach(function (sid) {
      var v = model.taxa[sid][model.groupField];
      counts[v] = (counts[v] || 0) + 1;
    });
    model.groups.forEach(function (g) {
      var li = document.createElement("li");
      li.dataset.value = g.value;
      li.title = "點選切換顯示／隱藏：" + g.label;
      li.innerHTML = svgSymbol(g.symbol, g.color, 15) +
        '<span class="lbl">' + g.label + '</span>' +
        '<span class="cnt">' + (counts[g.value] || 0) + '</span>';
      li.addEventListener("click", function () {
        Store.toggleGroup(g.value);
        li.classList.toggle("off", Store.disabledGroups.has(g.value));
      });
      ul.appendChild(li);
    });

    // 資料集中介資料（精簡、右對齊）
    var d = model.dataset, meta = document.getElementById("dataset-meta");
    var bits = [];
    if (d.doi) bits.push('DOI <a href="https://doi.org/' + d.doi + '" target="_blank" rel="noopener">' + d.doi + '</a>');
    if (d.source_url) bits.push('<a href="' + d.source_url + '" target="_blank" rel="noopener">原始資料來源</a>');
    if (d.created_with) bits.push('產生方式：' + d.created_with);
    meta.innerHTML =
      '<div class="row">' + bits.join(' · ') + '</div>' +
      (d.citation ? '<span class="cite">' + d.citation + '</span>' : "");
  }

  Store.on("data", render);
  global.FrogDash.svgSymbol = svgSymbol;
})(window);
