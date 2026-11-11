(() => {
  const MAP = [
    ["Legion of Merit","LM",["OLC","C","R"]],
    ["Bronze Star Medal","BSM",["OLC","V"]],
    ["Defense Meritorious Service Medal","DMSM",["OLC"]],
    ["Meritorious Service Medal","MSM",["OLC","R"]],
    ["Joint Service Commendation Medal","JSCM",["OLC","V","C","R"]],
    ["Army Commendation Medal","ARCOM",["OLC","V","C","R"]],
    ["Joint Service Achievement Medal","JSAM",["OLC"]],
    ["Army Achievement Medal","AAM",["OLC","C","R"]],
    ["Army Good Conduct Medal","AGCM",["Clasp"]],
    ["National Defense Service Medal","NDSM",["Service Star"]],
    ["Armed Forces Expeditionary Medal","AFEM",["Service Star","Arrowhead"]],
    ["Afghanistan Campaign Medal","ACM",["Service Star"]],
    ["Iraq Campaign Medal","ICM",["Service Star"]],
    ["Global War on Terrorism Expeditionary Medal","GWOTEM",["Service Star"]],
    ["Global War on Terrorism Service Medal","GWOTSM",[]],
    ["Korean Defense Service Medal","KDSM",[]],
    ["Armed Forces Service Medal","AFSM",["Service Star"]],
    ["Humanitarian Service Medal","HSM",["Service Star"]],
    ["Military Outstanding Volunteer Service Medal","MOVSM",["Service Star"]],
    ["NCO Professional Development Ribbon","NCOPDR",["Numeral"]],
    ["Army Service Ribbon","ASR",[]],
    ["Overseas Service Ribbon","OSR",["Numeral"]],
    ["NATO Medal","NATO Medal",[]]
  ];

  const meta = {};
  function applyNames() {
    if (typeof ITEMS === "undefined") return false;
    ITEMS.forEach((x,i) => {
      const m=MAP[i]; if(!m) return;
      x.name=m[0]; x.abbr=m[1]; x.shortName=m[1]; x.devices=m[2];
      meta[x.id]=x;
    });
    return true;
  }

  const state = {};
  let maxPerRow=3, alignment="center", compactUpper=true, rowSpacing=2;

  const style=document.createElement("style");
  style.textContent=`
    .rack{
      width:auto!important; max-width:100%!important; padding:18px 20px 20px!important;
      display:flex!important; flex-direction:column!important; align-items:center!important;
      gap:var(--rack-gap,2px)!important;
    }
    .rackrow{
      display:flex!important; gap:0!important; margin:0!important;
      height:29px!important; width:calc(var(--max-row,3)*106px)!important;
      max-width:100%!important; flex:none!important;
    }
    .ribbon{
      width:106px!important; height:29px!important; object-fit:fill!important;
      border:0!important; outline:0!important; display:block!important;
      flex:none!important; margin:0!important;
    }
    .ribbon + .ribbon{margin-left:-1px!important}
    .rackrow.upper-compact .ribbon{width:90px!important;height:25px!important}
    .rackrow.upper-compact{height:25px!important}
    .rack-options{
      display:flex;gap:15px;align-items:center;flex-wrap:wrap;
      padding:10px 18px;border-top:1px solid #ddd;font-size:13px;color:#555
    }
    .rack-options label{display:flex;align-items:center;gap:5px;cursor:pointer}
    .rack-options input{width:auto}
    #selected .thumb,.selected-award .thumb{
      width:106px!important;height:29px!important;max-width:106px!important;
      object-fit:fill!important;flex:none!important
    }
    .award-tree-thumb{width:110%!important;height:auto!important;max-width:none!important}
    .device-modal-backdrop{
      position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:9999;
      display:flex;align-items:center;justify-content:center;padding:20px
    }
    .device-modal{
      width:min(460px,100%);background:#fff;border-radius:8px;
      box-shadow:0 12px 40px rgba(0,0,0,.3);padding:20px
    }
    .device-modal h3{margin:0 0 6px;font-size:20px}
    .device-modal p{margin:0 0 16px;color:#666}
    .device-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}
    .device-choice{
      border:1px solid #ccc;border-radius:6px;padding:11px;
      display:flex;align-items:center;justify-content:space-between;gap:8px
    }
    .device-choice input{width:auto}
    .device-actions{display:flex;justify-content:flex-end;gap:8px;margin-top:18px}
    .device-badge{
      position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);
      font:bold 11px/1 Arial,sans-serif;color:#222;background:#d6a84f;
      border:1px solid #777;border-radius:50%;min-width:15px;height:15px;
      display:flex;align-items:center;justify-content:center;padding:0 2px;
      box-sizing:border-box;pointer-events:none;text-shadow:0 0 1px #fff
    }
    .ribbon-wrap{position:relative;width:106px;height:29px;flex:none}
    .upper-compact .ribbon-wrap{width:90px;height:25px}
    .upper-compact .device-badge{font-size:9px;min-width:13px;height:13px}
  `;
  document.head.appendChild(style);

  function rowsBottomUp(ordered){
    const rows=[];
    for(let end=ordered.length;end>0;end-=maxPerRow)
      rows.unshift(ordered.slice(Math.max(0,end-maxPerRow),end));
    return rows;
  }

  function addOptions(){
    if(document.getElementById("rackOptions")) return;
    const host=rackEl.parentElement, box=document.createElement("div");
    box.id="rackOptions"; box.className="rack-options";
    box.innerHTML=`
      <strong>Row:</strong>
      <label><input type="radio" name="maxRow" value="3" checked>3</label>
      <label><input type="radio" name="maxRow" value="4">4</label>
      <strong>Stack:</strong>
      <label><input type="radio" name="align" value="center" checked>Center</label>
      <label><input type="radio" name="align" value="right">Right</label>
      <label><input type="checkbox" id="compactUpper" checked> Reduce upper rows</label>
      <button type="button" id="saveRack">Save rack</button>
      <button type="button" id="viewRack">View larger</button>
    `;
    host.appendChild(box);
    box.querySelectorAll('[name=maxRow]').forEach(e=>e.onchange=()=>{maxPerRow=+e.value;render()});
    box.querySelectorAll('[name=align]').forEach(e=>e.onchange=()=>{alignment=e.value;render()});
    box.querySelector('#compactUpper').onchange=e=>{compactUpper=e.target.checked;render()};
    box.querySelector('#saveRack').onclick=()=>{
      localStorage.setItem("armyAwardBuilderRack",JSON.stringify({rack:[...rack],devices:state,maxPerRow,alignment,compactUpper}));
      box.querySelector('#saveRack').textContent="Saved";
      setTimeout(()=>box.querySelector('#saveRack').textContent="Save rack",900);
    };
    box.querySelector('#viewRack').onclick=()=>showLargeRack();
  }

  function deviceText(id){
    const s=state[id]||{};
    return Object.entries(s).filter(([,n])=>n>0).map(([k,n])=>`${k}${n>1?" ×"+n:""}`).join(", ");
  }

  function deviceModal(item){
    const current=state[item.id]||{};
    const b=document.createElement("div");
    b.className="device-modal-backdrop";
    const options=item.devices||[];
    b.innerHTML=`
      <div class="device-modal">
        <h3>${item.name}</h3>
        <p>Add the authorized device(s), then add the award to the rack.</p>
        <div class="device-grid">
          ${options.length?options.map(d=>`<label class="device-choice"><span>${d}</span><input type="number" min="0" max="4" value="${current[d]||0}" data-device="${d}"></label>`).join(""):'<div style="grid-column:1/-1;color:#666">No devices authorized for this award.</div>'}
        </div>
        <div class="device-actions"><button type="button" id="cancelDevice">Cancel</button><button type="button" id="addDevice">Add Award</button></div>
      </div>`;
    document.body.appendChild(b);
    b.querySelector("#cancelDevice").onclick=()=>b.remove();
    b.querySelector("#addDevice").onclick=()=>{
      const s={};
      b.querySelectorAll("[data-device]").forEach(i=>{const n=+i.value;if(n)s[i.dataset.device]=n});
      state[item.id]=s;
      if(typeof add==="function") add(item.id);
      b.remove();
      setTimeout(render,0);
    };
    b.addEventListener("click",e=>{if(e.target===b)b.remove()});
  }

  function interceptAdds(){
    if(window.__deviceIntercept)return;
    window.__deviceIntercept=true;
    document.addEventListener("click",e=>{
      const btn=e.target.closest("button");
      if(!btn || !/^ADD$/i.test(btn.textContent.trim()))return;
      let node=btn, img=null;
      for(let i=0;i<7&&node;i++,node=node.parentElement){
        img=img||node.querySelector("img");
      }
      if(!img)return;
      const item=ITEMS.find(x=>x.uri===img.getAttribute("src"));
      if(!item)return;
      e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation();
      deviceModal(item);
    },true);
  }

  function replaceTreeLabels(){
    if(typeof ITEMS==="undefined")return;
    const map=new Map(ITEMS.map(x=>[x.uri,x]));
    document.querySelectorAll("img").forEach(img=>{
      const x=map.get(img.getAttribute("src")); if(!x)return;
      let row=img.parentElement;
      for(let i=0;i<7&&row;i++,row=row.parentElement){
        if(row.querySelector && [...row.querySelectorAll("button")].some(b=>/^ADD$/i.test(b.textContent.trim()))){
          const walker=document.createTreeWalker(row,NodeFilter.SHOW_TEXT);
          const nodes=[]; while(walker.nextNode())nodes.push(walker.currentNode);
          nodes.forEach(n=>{
            const t=n.nodeValue.trim();
            if(t && t!==x.abbr && t!==x.name && !/^ADD$/i.test(t)) n.nodeValue=n.nodeValue.replace(t,x.abbr);
          });
          break;
        }
      }
    });
  }

  window.render=function(){
    applyNames(); addOptions();
    const ordered=[...rack].sort((a,b)=>a-b);
    const rows=rowsBottomUp(ordered);
    rackEl.style.alignItems="center";
    rackEl.style.setProperty("--max-row",String(maxPerRow));
    rackEl.style.setProperty("--rack-gap",String(rowSpacing)+"px");

    rackEl.innerHTML=rows.length?rows.map((row,index)=>{
      const upper=index<rows.length-2;
      const cls=upper&&compactUpper?"rackrow upper-compact":"rackrow";
      const justify=alignment==="right"?"flex-end":"center";
      return `<div class="${cls}" style="justify-content:${justify}">${row.map(id=>{
        const x=ITEMS.find(v=>v.id===id);
        const ds=state[id]||{};
        const badges=Object.entries(ds).flatMap(([d,n])=>Array(n).fill(d)).slice(0,4);
        return `<span class="ribbon-wrap"><img class="ribbon" title="${x.name}" alt="${x.name}" src="${x.uri}">${badges.map((d,i)=>`<span class="device-badge" style="margin-left:${(i-(badges.length-1)/2)*13}px">${d==="Service Star"?"★":d==="Arrowhead"?"▶":d==="Clasp"?"▰":d==="Numeral"?(state[id].Numeral||"2"):(d==="OLC"?"oak":d)}</span>`).join("")}</span>`;
      }).join("")}</div>`;
    }).join(""):'<div class="empty">Select awards from the left to build the rack.</div>';

    if(typeof selected!=="undefined"){
      selected.innerHTML=ordered.length?ordered.map(id=>{
        const x=ITEMS.find(v=>v.id===id);
        return `<div class="selected-award" style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid #eee">
          <img class="thumb" src="${x.uri}" alt="${x.name}" title="${x.name}">
          <div style="flex:1"><div>${x.name}</div><small style="color:#777">${x.abbr}${deviceText(id)? " • "+deviceText(id):""}</small></div>
          <button type="button" onclick="deviceModal(ITEMS.find(v=>v.id===${id}))">Edit</button>
          <button class="btn danger" onclick="remove(${id})">Remove</button>
        </div>`;
      }).join(""):'<div style="color:#888">No awards selected.</div>';
    }
    if(typeof count!=="undefined")count.textContent=`${ordered.length} award${ordered.length===1?"":"s"}`;
    requestAnimationFrame(replaceTreeLabels);
  };

  function showLargeRack(){
    const b=document.createElement("div");
    b.className="device-modal-backdrop";
    b.innerHTML=`<div class="device-modal" style="max-width:900px">
      <h3>Ribbon Rack</h3>
      <div style="padding:25px;background:#eee;border-radius:5px;overflow:auto">
        <div style="transform:scale(1.45);transform-origin:top center;margin:0 auto;width:max-content">${rackEl.innerHTML}</div>
      </div>
      <div class="device-actions"><button type="button" id="closeLarge">Close</button></div>
    </div>`;
    document.body.appendChild(b);
    b.querySelector("#closeLarge").onclick=()=>b.remove();
  }

  function start(){
    if(!applyNames())return setTimeout(start,100);
    interceptAdds();
    render();
    replaceTreeLabels();
  }
  start();
})();