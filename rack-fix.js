(() => {
  const MAP = [
    ["Legion of Merit","LM"],
    ["Bronze Star Medal","BSM"],
    ["Defense Meritorious Service Medal","DMSM"],
    ["Meritorious Service Medal","MSM"],
    ["Joint Service Commendation Medal","JSCM"],
    ["Army Commendation Medal","ARCOM"],
    ["Joint Service Achievement Medal","JSAM"],
    ["Army Achievement Medal","AAM"],
    ["Army Good Conduct Medal","AGCM"],
    ["National Defense Service Medal","NDSM"],
    ["Armed Forces Expeditionary Medal","AFEM"],
    ["Afghanistan Campaign Medal","ACM"],
    ["Iraq Campaign Medal","ICM"],
    ["Global War on Terrorism Expeditionary Medal","GWOTEM"],
    ["Global War on Terrorism Service Medal","GWOTSM"],
    ["Korean Defense Service Medal","KDSM"],
    ["Armed Forces Service Medal","AFSM"],
    ["Humanitarian Service Medal","HSM"],
    ["Military Outstanding Volunteer Service Medal","MOVSM"],
    ["NCO Professional Development Ribbon","NCOPDR"],
    ["Army Service Ribbon","ASR"],
    ["Overseas Service Ribbon","OSR"],
    ["NATO Medal","NATO Medal"]
  ];

  function itemMeta(x, i) {
    const m = MAP[i];
    if (!m) return;
    x.name = m[0];
    x.abbr = m[1];
    x.shortName = m[1];
  }

  function applyNames() {
    if (typeof ITEMS === "undefined") return false;
    ITEMS.forEach(itemMeta);
    return true;
  }

  const style = document.createElement("style");
  style.textContent = `
    :root{
      --ribbon-w:106px;
      --ribbon-h:29px;
    }
    .rack{
      width:auto !important;
      max-width:100% !important;
      padding:16px 20px 18px !important;
      display:flex !important;
      flex-direction:column !important;
      align-items:center !important;
      gap:2px !important;
    }
    .rackrow{
      display:flex !important;
      gap:0 !important;
      margin:0 !important;
      height:var(--ribbon-h) !important;
      width:calc(var(--max-row, 3) * var(--ribbon-w)) !important;
      max-width:100% !important;
      flex:none !important;
    }
    .ribbon{
      width:var(--ribbon-w) !important;
      height:var(--ribbon-h) !important;
      object-fit:fill !important;
      border:0 !important;
      outline:0 !important;
      display:block !important;
      flex:none !important;
      margin:0 !important;
    }
    .ribbon + .ribbon{margin-left:-1px !important}
    .rackrow.upper-compact .ribbon{
      transform:scale(.85) !important;
      transform-origin:center bottom !important;
    }
    .rack-options{
      display:flex;
      gap:16px;
      align-items:center;
      flex-wrap:wrap;
      padding:10px 18px;
      border-top:1px solid #ddd;
      font-size:13px;
      color:#555;
    }
    .rack-options label{display:flex;align-items:center;gap:5px;cursor:pointer}
    .rack-options input{width:auto}
    .award-tree-thumb{width:110% !important;height:auto !important}
  `;
  document.head.appendChild(style);

  let maxPerRow = 3;
  let alignment = "center";
  let compactUpper = false;

  function rowsBottomUp(ordered) {
    const rows = [];
    for (let end = ordered.length; end > 0; end -= maxPerRow) {
      rows.unshift(ordered.slice(Math.max(0, end - maxPerRow), end));
    }
    return rows;
  }

  function addOptions() {
    if (document.getElementById("rackOptions")) return;
    const host = rackEl.parentElement;
    const box = document.createElement("div");
    box.id = "rackOptions";
    box.className = "rack-options";
    box.innerHTML = `
      <strong>Max Per Row</strong>
      <label><input type="radio" name="maxRow" value="3" checked> 3</label>
      <label><input type="radio" name="maxRow" value="4"> 4</label>
      <strong style="margin-left:8px">Row Alignment</strong>
      <label><input type="radio" name="align" value="center" checked> Center</label>
      <label><input type="radio" name="align" value="right"> Right</label>
      <label style="margin-left:8px"><input type="checkbox" id="compactUpper"> Reduce upper rows</label>
    `;
    host.appendChild(box);
    box.querySelectorAll('input[name="maxRow"]').forEach(el => el.addEventListener("change", () => {
      maxPerRow = Number(el.value); render();
    }));
    box.querySelectorAll('input[name="align"]').forEach(el => el.addEventListener("change", () => {
      alignment = el.value; render();
    }));
    box.querySelector("#compactUpper").addEventListener("change", e => {
      compactUpper = e.target.checked; render();
    });
  }

  window.render = function() {
    applyNames();
    addOptions();

    const ordered = [...rack].sort((a,b) => a-b);
    const rows = rowsBottomUp(ordered);

    rackEl.style.alignItems = "center";
    rackEl.style.setProperty("--max-row", String(maxPerRow));

    rackEl.innerHTML = rows.length
      ? rows.map((row, index) => {
          const isUpper = index < rows.length - 2;
          const cls = isUpper && compactUpper ? "rackrow upper-compact" : "rackrow";
          const justify = alignment === "right" ? "flex-end" : "center";
          return `<div class="${cls}" style="justify-content:${justify}">${row.map(id => {
            const x = ITEMS.find(v => v.id === id);
            return `<img class="ribbon" title="${x.name}" alt="${x.name}" src="${x.uri}">`;
          }).join("")}</div>`;
        }).join("")
      : '<div class="empty">Select awards from the left to build the rack.</div>';

    if (typeof selected !== "undefined") {
      selected.innerHTML = ordered.length
        ? ordered.map(id => {
            const x = ITEMS.find(v => v.id === id);
            return `<div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid #eee"><img class="thumb" src="${x.uri}"><span style="flex:1">${x.name}</span><button class="btn danger" onclick="remove(${id})">Remove</button></div>`;
          }).join("")
        : '<div style="color:#888">No awards selected.</div>';
    }
    if (typeof count !== "undefined") count.textContent = `${ordered.length} award${ordered.length === 1 ? "" : "s"}`;

    requestAnimationFrame(markAwardTree);
  };

  function markAwardTree() {
    if (typeof ITEMS === "undefined") return;
    const uris = new Set(ITEMS.map(x => x.uri));
    document.querySelectorAll("img").forEach(img => {
      if (!uris.has(img.getAttribute("src"))) return;
      let p = img.parentElement;
      for (let i=0; i<5 && p; i++, p=p.parentElement) {
        if (p.querySelector && [...p.querySelectorAll("button")].some(b => /ADD/i.test(b.textContent))) {
          img.classList.add("award-tree-thumb");
          break;
        }
      }
    });
  }

  function start() {
    if (!applyNames()) return setTimeout(start, 100);
    render();
    markAwardTree();
  }

  start();
})();