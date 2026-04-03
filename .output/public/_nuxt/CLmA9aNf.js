import{_ as q}from"./B3bDKAqY.js";import{e as K,u as V,f as j,g as J,c,a as n,n as U,h as e,d as u,t as _,p as b,k as $,j as R,b as G,m as C,r as o,o as t}from"./Cj70m0yP.js";import{u as W}from"./C6mjBrVN.js";const z={id:"mainContent"},X={key:0,id:"historyPrompt"},Q={class:"fab-group"},Z=["innerHTML"],ss={key:2,class:"content skeleton-block"},as={key:3,class:"comments"},ns={class:"comments-title"},es={id:"count"},os={id:"comments"},ls={key:4,class:"loading"},cs=1234567,ts=`
<div id="codeMode">
  <div style="margin-bottom:15px; color:var(--code-k); border-bottom:1px solid var(--border); padding-bottom:5px; font-weight:bold;">Infrastructure/Network/LoadBalancer.php</div>
  <div><span class="code-ln">1</span><span class="code-k">&lt;?php</span></div>
  <div><span class="code-ln">2</span><span class="code-k">namespace</span> App\\Infrastructure\\Network;</div>
  <div><span class="code-ln">3</span></div>
  <div><span class="code-ln">4</span><span class="code-k">class</span> <span class="code-v">LoadBalancer</span> {</div>
  <div><span class="code-ln">5</span>    <span class="code-k">private</span> <span class="code-v">$nodes</span> = [];</div>
  <div><span class="code-ln">6</span>    <span class="code-k">private</span> <span class="code-v">$healthyNodes</span> = [];</div>
  <div><span class="code-ln">7</span></div>
  <div><span class="code-ln">8</span>    <span class="code-k">public function</span> <span class="code-v">__construct</span>(<span class="code-k">array</span> <span class="code-v">$config</span>) {</div>
  <div><span class="code-ln">9</span>        <span class="code-v">$this</span>-><span class="code-v">nodes</span> = <span class="code-v">$config</span>[<span class="code-s">'cluster_endpoints'</span>];</div>
  <div><span class="code-ln">10</span>        <span class="code-v">$this</span>-><span class="code-v">checkHealth</span>();</div>
  <div><span class="code-ln">11</span>    }</div>
  <div><span class="code-ln">12</span></div>
  <div><span class="code-ln">13</span>    <span class="code-k">private function</span> <span class="code-v">checkHealth</span>() {</div>
  <div><span class="code-ln">14</span>        <span class="code-k">foreach</span> (<span class="code-v">$this</span>-><span class="code-v">nodes</span> <span class="code-k">as</span> <span class="code-v">$node</span>) {</div>
  <div><span class="code-ln">15</span>            <span class="code-v">$status</span> = <span class="code-v">curl_init</span>(<span class="code-v">$node</span> . <span class="code-s">'/health'</span>);</div>
  <div><span class="code-ln">16</span>            <span class="code-k">if</span> (<span class="code-v">curl_exec</span>(<span class="code-v">$status</span>)) {</div>
  <div><span class="code-ln">17</span>                <span class="code-v">$this</span>-><span class="code-v">healthyNodes</span>[] = <span class="code-v">$node</span>;</div>
  <div><span class="code-ln">18</span>            }</div>
  <div><span class="code-ln">19</span>        }</div>
  <div><span class="code-ln">20</span>    }</div>
  <div><span class="code-ln">21</span></div>
  <div><span class="code-ln">22</span>    <span class="code-k">public function</span> <span class="code-v">getNextNode</span>() {</div>
  <div><span class="code-ln">23</span>        <span class="code-k">return</span> <span class="code-v">$this</span>-><span class="code-v">healthyNodes</span>[<span class="code-v">array_rand</span>(<span class="code-v">$this</span>-><span class="code-v">healthyNodes</span>)];</div>
  <div><span class="code-ln">24</span>    }</div>
  <div><span class="code-ln">25</span>}</div>
  <div><span class="code-ln">26</span></div>
  <div><span class="code-ln">27</span><span class="code-c">// --- Node.js Event Loop Monitor ---</span></div>
  <div><span class="code-ln">28</span><span class="code-k">const</span> <span class="code-v">os</span> = <span class="code-k">require</span>(<span class="code-s">'os'</span>);</div>
  <div><span class="code-ln">29</span><span class="code-k">const</span> <span class="code-v">v8</span> = <span class="code-k">require</span>(<span class="code-s">'v8'</span>);</div>
  <div><span class="code-ln">30</span></div>
  <div><span class="code-ln">31</span><span class="code-k">setInterval</span>(() => {</div>
  <div><span class="code-ln">32</span>    <span class="code-k">const</span> <span class="code-v">mem</span> = <span class="code-v">process</span>.<span class="code-v">memoryUsage</span>();</div>
  <div><span class="code-ln">33</span>    <span class="code-k">if</span> (<span class="code-v">mem</span>.heapUsed > <span class="code-v">mem</span>.heapTotal * <span class="code-v">0.8</span>) {</div>
  <div><span class="code-ln">34</span>        <span class="code-v">console</span>.<span class="code-v">warn</span>(<span class="code-s">'[GC_WARN] Heap usage near limit'</span>);</div>
  <div><span class="code-ln">35</span>        <span class="code-v">v8</span>.<span class="code-v">setFlagsFromString</span>(<span class="code-s">'--expose-gc'</span>);</div>
  <div><span class="code-ln">36</span>        <span class="code-k">global</span>.<span class="code-v">gc</span> && <span class="code-k">global</span>.<span class="code-v">gc</span>();</div>
  <div><span class="code-ln">37</span>    }</div>
  <div><span class="code-ln">38</span>}, <span class="code-v">10000</span);</div>
  <div><span class="code-ln">39</span></div>
  <div><span class="code-ln">40</span><span class="code-k">function</span> <span class="code-v">syncStream</span>(<span class="code-v">buffer</span>) {</div>
  <div><span class="code-ln">41</span>    <span class="code-k">return</span> <span class="code-k">new</span> <span class="code-v">Promise</span>((<span class="code-v">resolve</span>) => {</div>
  <div><span class="code-ln">42</span>        <span class="code-v">setTimeout</span>(() => {</div>
  <div><span class="code-ln">43</span>            <span class="code-v">console</span>.<span class="code-v">log</span>(<span class="code-s">'Stream synced successfully'</span>);</div>
  <div><span class="code-ln">44</span>            <span class="code-v">resolve</span>(<span class="code-k">true</span>);</div>
  <div><span class="code-ln">45</span>        }, <span class="code-v">500</span>);</div>
  <div><span class="code-ln">46</span>    });</div>
  <div><span class="code-ln">47</span>}</div>
  <div><span class="code-ln">48</span></div>
  <div><span class="code-ln">49</span><span class="code-c">// INFO: Listening on port 8080</span></div>
  <div><span class="code-ln">50</span><span class="code-c">// LOG: Handshaking with internal node... OK</span></div>
  <div><span class="code-ln">51</span><span class="code-c">// [REPEATED LOG BLOCKS FOR SCROLL DEPTH]</span></div>
  <div><span class="code-ln">52</span><span class="code-c">// 2026-03-31 10:45:01 Processing packet 0xAB21</span></div>
  <div><span class="code-ln">53</span><span class="code-c">// 2026-03-31 10:45:02 Processing packet 0xAB22</span></div>
  <div><span class="code-ln">54</span><span class="code-c">// 2026-03-31 10:45:03 Processing packet 0xAB23</span></div>
  <div><span class="code-ln">55</span><span class="code-c">// ... (代码将持续滚动直至 150 行)</span></div>
  <div id="extraCode"></div>
</div>
`,ds=`
const SCROLL_KEY = 'v2_floor_pos';
window.saveFloor = function(id, floorId) {
  let data = JSON.parse(localStorage.getItem(SCROLL_KEY) || '{}');
  data[id] = { f: floorId, t: Date.now() };
  const keys = Object.keys(data);
  if (keys.length > 100) {
    const oldest = keys.sort((a, b) => data[a].t - data[b].t)[0];
    delete data[oldest];
  }
  localStorage.setItem(SCROLL_KEY, JSON.stringify(data));
};
window.getFloor = function(id) {
  const data = JSON.parse(localStorage.getItem(SCROLL_KEY) || '{}');
  return data[id] ? data[id].f : null;
};
window.removeFloor = function(id) {
  let data = JSON.parse(localStorage.getItem(SCROLL_KEY) || '{}');
  if (data[id]) {
    delete data[id];
    localStorage.setItem(SCROLL_KEY, JSON.stringify(data));
  }
};
window.jumpToFloor = function(e, id) {
  if (e) { e.preventDefault(); e.stopPropagation(); }
  const el = document.getElementById('c_' + id);
  if (el) {
    window.scrollTo({top: el.offsetTop - 80});
    el.classList.remove('flash-highlight');
    void el.offsetWidth; 
    el.classList.add('flash-highlight');
  }
};
let lastScrollY = 0; window.isModeCode = false;
window.ondblclick = (e) => {
  if (e.target.closest('.fab')) return;
  const cm = document.getElementById('codeMode');
  const mc = document.getElementById('mainContent');
  const html = document.documentElement;
  window.isModeCode = !window.isModeCode;
  if (window.isModeCode) {
    let extra = ''; for(let i=56; i<160; i++) extra += '<div><span class="code-ln">'+i+'</span><span class="code-c">// LOG: Syncing with distributed shard 0x' + (Math.random()*0xFFFF<<0).toString(16).toUpperCase() + '... OK</span></div>';
    document.getElementById('extraCode').innerHTML = extra;
    lastScrollY = window.scrollY; html.style.scrollBehavior = 'auto';
    cm.style.display = 'block'; if(mc) mc.style.display = 'none';
    document.body.style.overflow = 'hidden'; cm.scrollTop = 200 + Math.random()*300;
  } else {
    cm.style.display = 'none'; if(mc) mc.style.display = 'block';
    document.body.style.overflow = ''; window.scrollTo(0, lastScrollY);
    setTimeout(() => { html.style.scrollBehavior = 'smooth'; }, 50);
  }
};
let normalFav, alertFav, favInterval=null;
function drawFavicons(){
  const c=document.createElement('canvas');c.width=32;c.height=32;const x=c.getContext('2d');
  x.fillStyle='#1d2129';x.fillRect(0,0,32,32);x.fillStyle='#fff';x.font='bold 22px sans-serif';x.fillText('V',8,24);
  normalFav=c.toDataURL();
  x.beginPath();x.arc(25,7,7,0,Math.PI*2);x.fillStyle='#ff2c55';x.fill();
  x.strokeStyle='#fff';x.lineWidth=2;x.stroke();
  alertFav=c.toDataURL();
  let link = document.querySelector("link[rel*='icon']") || document.createElement('link');
  link.type='image/x-icon'; link.rel='shortcut icon'; link.href=normalFav;
  document.getElementsByTagName('head')[0].appendChild(link);
}
function startBlink(){ if(favInterval)return; let s=0; favInterval=setInterval(()=>{ document.querySelector("link[rel*='icon']").href=(s%2===0)?alertFav:normalFav; s++; },800); }
function stopBlink(){ if(favInterval){clearInterval(favInterval);favInterval=null;} document.querySelector("link[rel*='icon']").href=normalFav; }
window.startBlink = startBlink; window.stopBlink = stopBlink; window.drawFavicons = drawFavicons;
`,ms=K({__name:"[code]",setup(is){const H=V(),m=o(!0),i=o(!0),L=o(""),T=o(""),B=o(null),I=o([]),p=o(0),A=o([]),f=o(!1),d=o(null),h=o(!1);let F=!1;const E=C(()=>String(H.params.code||"")),w=C(()=>{try{return parseInt(E.value,36)^cs}catch{return 0}}),P=()=>window.scrollTo({top:0}),k=C(()=>E.value),g=()=>{const s=window.getFloor?.(k.value);s&&(d.value=s,h.value=!0)},M=()=>{h.value=!1},D=()=>{if(!d.value)return;const s=document.getElementById("c_"+d.value);s&&(window.scrollTo({top:s.offsetTop-80}),s.classList.add("flash-highlight")),M()},Y=async()=>{m.value=!0;try{const s=await $fetch(`/api/public-topic/${w.value}`,{query:{_t:Date.now()}});s?.title&&(L.value=s.title,T.value=s.content||s.contentHtml||"")}catch{}m.value=!1},N=async()=>{i.value=!0;try{const s=await $fetch(`/api/public-replies/${w.value}`,{query:{_t:Date.now()}});I.value=s?.replies||[],B.value=s?.opAuthor||null,p.value=s?.total||0,A.value=s?.allIds||[]}catch{}i.value=!1},y=async()=>{await N(),f.value=!1,window.stopBlink?.(),g()};return W({title:"V2EX Reader",script:[{children:ds,tagPosition:"bodyClose"}]}),j(async()=>{if(F)return;F=!0,window.drawFavicons?.();const s=Y(),a=N();await Promise.allSettled([s,a]);let r;window.addEventListener("scroll",()=>{window.isModeCode||(clearTimeout(r),r=setTimeout(()=>{const l=document.querySelectorAll(".comment-item"),O=document.getElementById("comments");if(O&&O.getBoundingClientRect().top>85){window.removeFloor?.(k.value);return}let x=null;for(let v=0;v<l.length;v++)if(l[v].getBoundingClientRect().bottom>85){x=l[v].id.replace("c_","");break}x&&window.saveFloor?.(k.value,x)},300))});const S=async()=>{if(window.isModeCode||document.visibilityState==="hidden"){setTimeout(S,1e4);return}try{(await $fetch(`/api/public-replies/${w.value}`,{query:{_t:Date.now()}}))?.total>p.value&&(f.value=!0,window.startBlink?.())}catch{}setTimeout(S,5e4+Math.random()*2e4)};setTimeout(S,6e4),window.addEventListener("pageshow",l=>{l.persisted&&y()}),g()}),J(()=>{g()}),(s,a)=>{const r=q;return t(),c("div",null,[n("div",{innerHTML:ts}),n("div",z,[n("div",{id:"newMsgNotify",class:U({show:e(f)}),onClick:y},"检测到新回复",2),e(h)&&e(d)?(t(),c("div",X,[n("span",null,[a[0]||(a[0]=u("上次看到 ",-1)),n("b",null,"#"+_(e(d)),1),a[1]||(a[1]=u(" 楼",-1))]),n("button",{onClick:b(D,["stop"])},"去这里"),n("span",{class:"close",onClick:b(M,["stop"])},"×")])):$("",!0),n("div",Q,[n("div",{class:"fab",onClick:P},[...a[2]||(a[2]=[n("svg",{xmlns:"http://www.w3.org/2000/svg",width:"22",height:"22",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor","stroke-width":"2","stroke-linecap":"round","stroke-linejoin":"round"},[n("path",{d:"m18 15-6-6-6 6"})],-1)])]),n("div",{id:"reBtn",class:"fab",onClick:b(y,["stop"])},[...a[3]||(a[3]=[R('<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><path d="M3 3v5h5"></path><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"></path><path d="M16 16h5v5"></path></svg>',1)])])]),n("h1",null,_(e(L)||" "),1),e(m)?(t(),c("div",ss,[...a[4]||(a[4]=[R('<div class="skeleton-line w-90"></div><div class="skeleton-line w-80"></div><div class="skeleton-line w-60"></div><div class="skeleton-line w-85"></div><div class="skeleton-line w-70"></div>',5)])])):(t(),c("div",{key:1,class:"content",innerHTML:e(T)},null,8,Z)),!e(i)&&e(p)>0?(t(),c("div",as,[n("div",ns,[a[5]||(a[5]=u("讨论 (",-1)),n("span",es,_(e(p)),1),a[6]||(a[6]=u(")",-1))]),n("div",os,[G(r,{nodes:e(I),opAuthor:e(B)},null,8,["nodes","opAuthor"])])])):e(i)?(t(),c("div",ls,"Loading replies...")):$("",!0)])])}}});export{ms as default};
