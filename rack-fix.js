(() => {
  const MAP = [
    ["Legion of Merit","LM",["Bronze "C"","Bronze "R"","Bronze Oak Leaf Clusters"]],
    ["Bronze Star Medal","BSM",["Bronze "V"","Silver Oak Leaf Clusters","Bronze Oak Leaf Clusters"]],
    ["Defense Meritorious Service Medal","DMSM",["Bronze "R"","Silver Oak Leaf Clusters","Bronze Oak Leaf Clusters"]],
    ["Meritorious Service Medal","MSM",["Bronze "R"","Silver Oak Leaf Clusters","Bronze Oak Leaf Clusters"]],
    ["Joint Service Commendation Medal","JSCM",["Bronze "V"","Combat "C"","Bronze "R"","Silver Oak Leaf Clusters","Bronze Oak Leaf Clusters"]],
    ["Army Commendation Medal","ARCOM",["Bronze "V"","Combat "C"","Bronze "R"","Silver Oak Leaf Clusters","Bronze Oak Leaf Clusters"]],
    ["Joint Service Achievement Medal","JSAM",["Combat "C"","Bronze "R"","Silver Oak Leaf Clusters","Bronze Oak Leaf Clusters"]],
    ["Army Achievement Medal","AAM",["Silver Oak Leaf Clusters","Bronze Oak Leaf Clusters"]],
    ["Army Good Conduct Medal","AGCM",["Knots Medium"]],
    ["National Defense Service Medal","NDSM",["Bronze Stars"]],
    ["Armed Forces Expeditionary Medal","AFEM",["Arrowhead","Silver Stars","Bronze Stars"]],
    ["Afghanistan Campaign Medal","ACM",["Silver Stars","Bronze Stars"]],
    ["Iraq Campaign Medal","ICM",["Silver Stars","Bronze Stars"]],
    ["Global War on Terrorism Expeditionary Medal","GWOTEM",["Arrowhead","Silver Stars","Bronze Stars"]],
    ["Global War on Terrorism Service Medal","GWOTSM",["Silver Stars","Bronze Stars"]],
    ["Korean Defense Service Medal","KDSM",[]],
    ["Armed Forces Service Medal","AFSM",["Silver Stars","Bronze Stars"]],
    ["Humanitarian Service Medal","HSM",["Silver Stars","Bronze Stars"]],
    ["Military Outstanding Volunteer Service Medal","MOVSM",["Silver Stars","Bronze Stars"]],
    ["NCO Professional Development Ribbon","NCOPDR",["Numeral"]],
    ["Army Service Ribbon","ASR",[]],
    ["Overseas Service Ribbon","OSR",["Numeral"]],
    ["NATO Medal","NATO Medal",["Bronze Stars"]]
  ];

  let perRow=3, align="center", compactUpper=true;
  const state={};
  let openId=null;

  const css=document.createElement("style");
  css.textContent=`
    .award{grid-template-columns:79px 1fr auto!important}
    .award .thumb{width:79px!important;height:22px!important}
    .award-detail{grid-column:1/-1;background:#f7f7f7;border-top:1px solid #ddd;padding:12px 8px 13px;cursor:default}
    .award-detail-title{font-weight:700;font-size:13px;margin-bottom:9px}
    .device-list{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:11px}
    .device-opt{display:flex;align-items:center;gap:6px;background:#fff;border:1px solid #ccc;border-radius:3px;padding:6px 8px;font-size:12px}
    .device-opt input{width:42px;padding:4px}
    .award-detail button{background:#1e6a3a;color:#fff;border:0;border-radius:3px;padding:7px 10px;font-weight:700}
    .award-detail .cancel{background:#fff;color:#555;border:1px solid #aaa;margin-left:6px}
    .rack{padding:18px 20px 22px!important}
    .rackrow{height:29px!important}
    .ribbon{width:106px!important;height:29px!important}
    .rackrow.upper-compact{height:25px!important}
    .rackrow.upper-compact .ribbon{width:90px!important;height:25px!important}
    .rack-options{font-size:13px;color:#555;display:flex;gap:12px;align-items:center;flex-wrap:wrap}
    #selected .thumb{width:72px!important;height:20px!important;max-width:72px!important}
    .selected-award{min-height:38px}
    .selected-award .edit{border:1px solid #999;background:#fff;color:#333;padding:6px 9px;border-radius:3px}
  `;
  document.head.appendChild(css);

  function applyNames(){
    if(typeof ITEMS==="undefined") return false;
    ITEMS.forEach((x,i)=>{
      const m=MAP[i]; if(!m)return;
      x.name=m[0]; x.abbr=m[1]; x.devices=m[2];
    });
    return true;
  }

  function deviceValue(id,d){return state[id]?.[d]||0}

  function renderListFixed(){
    if(typeof ITEMS==="undefined")return;
    const q=(search.value||"").toLowerCase().trim();
    list.innerHTML=ITEMS.filter(x=>(x.name+" "+x.abbr).toLowerCase().includes(q)).map(x=>{
      const open=openId===x.id;
      const devs=x.devices||[];
      return `<div class="award" data-id="${x.id}">
        <img class="thumb" src="${x.uri}" alt="${x.name}">
        <div class="aname"><b>${x.abbr}</b></div>
        <button class="add" type="button" data-open="${x.id}">${open?"CLOSE":"SELECT"}</button>
        ${open?`<div class="award-detail">
          <div class="award-detail-title">${x.name}</div>
          ${devs.length?`<div class="device-list">${devs.map(d=>`<label class="device-opt"><span>${d}</span><input type="number" min="0" max="10" value="${deviceValue(x.id,d)}" data-dev="${d}"></label>`).join("")}</div>`:'<div style="font-size:12px;color:#666;margin-bottom:10px">No devices authorized for this award.</div>'}
          <button type="button" data-add="${x.id}">ADD TO RACK</button>
          <button type="button" class="cancel" data-close="${x.id}">CANCEL</button>
        </div>`:''}
      </div>`;
    }).join("");
  }

  function addSelected(id){
    if(!rack.includes(id))rack.push(id);
    openId=null;
    renderListFixed();
    render();
  }

  function bindTree(){
    list.onclick=e=>{
      const btn=e.target.closest("button");
      const row=e.target.closest(".award");
      if(!row)return;
      const id=Number(row.dataset.id);
      if(btn?.dataset.open){e.stopPropagation();openId=openId===id?null:id;renderListFixed();return}
      if(btn?.dataset.close){e.stopPropagation();openId=null;renderListFixed();return}
      if(btn?.dataset.add){
        e.stopPropagation();
        const item=ITEMS.find(x=>x.id===id);
        state[id]={};
        row.querySelectorAll("[data-dev]").forEach(inp=>{const n=Number(inp.value);if(n)state[id][inp.dataset.dev]=n});
        addSelected(id);return;
      }
      if(!btn && e.target.closest(".award-detail"))return;
      openId=openId===id?null:id;
      renderListFixed();
    };
  }

  function rowsBottomUp(ordered){
    const rows=[];
    for(let end=ordered.length;end>0;end-=perRow)
      rows.unshift(ordered.slice(Math.max(0,end-perRow),end));
    return rows;
  }

  function render(){
    applyNames();
    const ordered=[...rack].sort((a,b)=>a-b), rows=rowsBottomUp(ordered);
    rackEl.style.alignItems="center";
    rackEl.innerHTML=rows.length?rows.map((row,i)=>{
      const upper=compactUpper&&i<rows.length-2;
      const cls=upper?"rackrow upper-compact":"rackrow";
      const justify=align==="right"?"flex-end":"center";
      return `<div class="${cls}" style="justify-content:${justify}">${row.map(id=>{
        const x=ITEMS.find(v=>v.id===id);
        return `<img class="ribbon" title="${x.name}" alt="${x.name}" src="${x.uri}">`;
      }).join("")}</div>`;
    }).join(""):'<div class="empty">Select awards from the left to build the rack.</div>';

    selected.innerHTML=ordered.length?ordered.map(id=>{
      const x=ITEMS.find(v=>v.id===id);
      const devices=state[id]?Object.entries(state[id]).filter(([,n])=>n>0).map(([d,n])=>d+(n>1?" ×"+n:"")).join(", "):"";
      return `<div class="selected-award" style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid #eee">
        <img class="thumb" src="${x.uri}" alt="${x.name}">
        <div style="flex:1"><div>${x.name}</div><small style="color:#777">${x.abbr}${devices?" • "+devices:""}</small></div>
        <button class="edit" type="button" data-edit="${id}">Edit</button>
        <button class="btn danger" type="button" data-remove="${id}">Remove</button>
      </div>`;
    }).join(""):'<div style="color:#888">No awards selected.</div>';
    count.textContent=`${ordered.length} award${ordered.length===1?"":"s"}`;
  }

  function bindSelected(){
    selected.onclick=e=>{
      const edit=e.target.closest("[data-edit]"), rem=e.target.closest("[data-remove]");
      if(edit){
        openId=Number(edit.dataset.edit);
        renderListFixed();
        document.querySelector(".left").scrollTop=0;
      }
      if(rem){rack=rack.filter(id=>id!==Number(rem.dataset.remove));render()}
    };
  }

  function addOptions(){
    const c=document.querySelector(".controls"); if(!c)return;
    let d=document.getElementById("rackOptions"); if(d)d.remove();
    d=document.createElement("div");d.id="rackOptions";d.className="rack-options";
    d.innerHTML='<strong>Row:</strong><label><input type="radio" name="perRow" value="3" checked>3</label><label><input type="radio" name="perRow" value="4">4</label><strong>Stack:</strong><label><input type="radio" name="align" value="center" checked>Center</label><label><input type="radio" name="align" value="right">Right</label><label><input type="checkbox" id="compactUpper" checked>Reduce upper rows</label>';
    c.prepend(d);
    d.onclick=e=>{
      if(e.target.name==="perRow"){perRow=Number(e.target.value);render()}
      if(e.target.name==="align"){align=e.target.value;render()}
      if(e.target.id==="compactUpper"){compactUpper=e.target.checked;render()}
    };
  }

  function start(){
    if(!applyNames())return setTimeout(start,100);
    renderListFixed();
    bindTree();
    bindSelected();
    addOptions();
    render();
    search.oninput=renderListFixed;
  }
  start();
})();