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
      width:100% !important;
    }
    .ribbon{
      width:88px !important;
      height:24px !important;
      object-fit:fill !important;
      border:0 !important;
      outline:0 !important;
      display:block !important;
      flex:none !important;
      margin:0 !important;
    }
    .ribbon + .ribbon{margin-left:-1px !important}
    .rack-options{
      display:flex;
      gap:18px;
      align-items:center;
      flex-wrap:wrap;
      padding:10px 18px;
      border-top:1px solid #ddd;
      font-size:13px;
      color:#555;
    }
    .rack-options label{display:flex;align-items:center;gap:5px;cursor:pointer}
    .rack-options input{width:auto}
  `;
  document.head.appendChild(style);

  let maxPerRow = 3;
  let alignment = 'center';

  function buildRowsBottomUp(ordered) {
    const rows = [];
    for (let end = ordered.length; end > 0; end -= maxPerRow) {
      rows.unshift(ordered.slice(Math.max(0, end - maxPerRow), end));
    }
    return rows;
  }

  function addOptions() {
    if (document.getElementById('rackOptions')) return;
    const host = rackEl.parentElement;
    const box = document.createElement('div');
    box.id = 'rackOptions';
    box.className = 'rack-options';
    box.innerHTML = `
      <strong>Max Per Row</strong>
      <label><input type="radio" name="maxRow" value="3" checked> 3</label>
      <label><input type="radio" name="maxRow" value="4"> 4</label>
      <strong style="margin-left:8px">Alignment</strong>
      <label><input type="radio" name="align" value="center" checked> center</label>
      <label><input type="radio" name="align" value="right"> right</label>
    `;
    host.appendChild(box);
    box.querySelectorAll('input[name="maxRow"]').forEach(el => el.onchange = () => {
      maxPerRow = +el.value;
      render();
    });
    box.querySelectorAll('input[name="align"]').forEach(el => el.onchange = () => {
      alignment = el.value;
      render();
    });
  }

  window.render = function() {
    addOptions();
    const ordered = [...rack].sort((a,b) => a-b);
    const rows = buildRowsBottomUp(ordered);

    rackEl.style.alignItems = 'stretch';
    rackEl.innerHTML = rows.length
      ? rows.map(row => `<div class="rackrow" style="justify-content:${alignment === 'right' ? 'flex-end' : 'center'}">${row.map(id => {
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