(() => {
  const style = document.createElement('style');
  style.textContent = `
    .rack{
      width:390px !important;
      max-width:100% !important;
      padding:14px 18px 16px !important;
      display:flex !important;
      flex-direction:column !important;
      align-items:center !important;
      gap:2px !important;
    }
    .rackrow{
      display:flex !important;
      gap:0 !important;
      justify-content:center !important;
      margin:0 !important;
      height:24px !important;
    }
    .ribbon{
      width:88px !important;
      height:24px !important;
      object-fit:fill !important;
      border:0 !important;
      display:block !important;
      flex:none !important;
    }
  `;
  document.head.appendChild(style);

  window.buildRowsBottomUp = function(ordered) {
    const rows = [];
    for (let end = ordered.length; end > 0; end -= 4) {
      rows.unshift(ordered.slice(Math.max(0, end - 4), end));
    }
    return rows;
  };

  window.render = function() {
    const ordered = [...rack].sort((a,b) => a-b);
    const rows = buildRowsBottomUp(ordered);

    rackEl.innerHTML = rows.length
      ? rows.map(row => `<div class="rackrow">${row.map(id => {
          const x = ITEMS.find(v => v.id === id);
          return `<img class="ribbon" title="${x.name}" src="${x.uri}">`;
        }).join('')}</div>`).join('')
      : '<div class="empty">Select awards from the left to build the rack.</div>';

    selected.innerHTML = ordered.length
      ? ordered.map(id => {
          const x = ITEMS.find(v => v.id === id);
          return `<div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid #eee"><img class="thumb" src="${x.uri}"><span style="flex:1">${x.name}</span><button class="btn danger" onclick="remove(${id})">Remove</button></div>`;
        }).join('')
      : '<div style="color:#888">No awards selected.</div>';

    count.textContent = `${ordered.length} award${ordered.length === 1 ? '' : 's'}`;
  };

  render();
})();