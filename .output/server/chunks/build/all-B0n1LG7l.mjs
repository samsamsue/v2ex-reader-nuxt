import { _ as __nuxt_component_0 } from './LoginBox-LsaNkmC7.mjs';
import { _ as __nuxt_component_0$1 } from './nuxt-link-JLW_B2l9.mjs';
import { v as vueExports, u as useRoute, s as serverRenderer_cjs_prodExports } from './server.mjs';
import { u as useHead } from './v3-Hl9gcLEc.mjs';
import '../_/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'undici';
import 'node:url';
import '../routes/renderer.mjs';
import 'vue-bundle-renderer/runtime';
import 'vue/server-renderer';
import 'unhead/server';
import 'devalue';
import 'unhead/utils';
import 'vue';
import 'unhead/plugins';
import 'node:stream';

const codeModeHtml = `
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
  <div><span class="code-ln">38</span>}, <span class="code-v">10000</span>);</div>
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
  <div><span class="code-ln">55</span><span class="code-c">// ... (\u4EE3\u7801\u5C06\u6301\u7EED\u6EDA\u52A8\u76F4\u81F3 150 \u884C)</span></div>
  <div id="extraCode"></div>
</div>
`;
const SHARED_JS = `
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
  } else {
    const notify = document.getElementById('newMsgNotify');
    if (notify) {
      const oldText = notify.innerText;
      notify.innerText = "\u8BE5\u697C\u5C42\u6682\u672A\u52A0\u8F7D\u6216\u5DF2\u4E0D\u5B58\u5728";
      notify.classList.add('show');
      setTimeout(() => { notify.classList.remove('show'); setTimeout(() => notify.innerText = oldText, 500); }, 2000);
    }
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
    setTimeout(() => { html.style.scrollBehavior = 'auto'; }, 50);
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
document.addEventListener('visibilitychange',()=>{ if(document.visibilityState==='visible')stopBlink(); });
`;
const _sfc_main = /* @__PURE__ */ vueExports.defineComponent({
  __name: "all",
  __ssrInlineRender: true,
  setup(__props) {
    const route = useRoute();
    const fromPath = vueExports.computed(() => route.fullPath || "/all");
    const needLogin = vueExports.ref(false);
    const items = vueExports.ref([]);
    vueExports.ref(0);
    vueExports.ref(parseInt(String(route.query.p || 0)));
    const loaderText = vueExports.ref("\u52A0\u8F7D\u4E2D...");
    vueExports.ref(null);
    const loading = vueExports.ref(true);
    vueExports.ref(false);
    const saveLastViewed = (code) => sessionStorage.setItem("v2_last_code", code);
    useHead({
      title: "V2EX Reader",
      script: [{ children: SHARED_JS, tagPosition: "bodyClose" }]
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_LoginBox = __nuxt_component_0;
      const _component_NuxtLink = __nuxt_component_0$1;
      _push(`<div${serverRenderer_cjs_prodExports.ssrRenderAttrs(_attrs)}>`);
      if (vueExports.unref(needLogin)) {
        _push(serverRenderer_cjs_prodExports.ssrRenderComponent(_component_LoginBox, { from: vueExports.unref(fromPath) }, null, _parent));
      } else {
        _push(`<!--[--><div>${codeModeHtml}</div><div id="mainContent"><div class="fab-group"><div class="fab"><svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m18 15-6-6-6 6"></path></svg></div><div class="fab"><svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><path d="M3 3v5h5"></path><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"></path><path d="M16 16h5v5"></path></svg></div></div><div id="list">`);
        if (vueExports.unref(loading)) {
          _push(`<div class="list-skeleton"><div class="skeleton-line w-80"></div><div class="skeleton-line w-60"></div><div class="skeleton-line w-90"></div><div class="skeleton-line w-70"></div><div class="skeleton-line w-50"></div></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<!--[-->`);
        serverRenderer_cjs_prodExports.ssrRenderList(vueExports.unref(items), (item) => {
          _push(`<div class="item"${serverRenderer_cjs_prodExports.ssrRenderAttr("id", `item_${item.code}`)}>`);
          _push(serverRenderer_cjs_prodExports.ssrRenderComponent(_component_NuxtLink, {
            to: `/t/${item.code}`,
            onClick: ($event) => saveLastViewed(item.code)
          }, {
            default: vueExports.withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`${serverRenderer_cjs_prodExports.ssrInterpolate(item.title)}`);
              } else {
                return [
                  vueExports.createTextVNode(vueExports.toDisplayString(item.title), 1)
                ];
              }
            }),
            _: 2
          }, _parent));
          _push(`<div class="meta">@${serverRenderer_cjs_prodExports.ssrInterpolate(item.author)} \u2022 ${serverRenderer_cjs_prodExports.ssrInterpolate(item.time)} \u2022 ${serverRenderer_cjs_prodExports.ssrInterpolate(item.replies)}\u56DE\u590D</div></div>`);
        });
        _push(`<!--]--></div><div id="loader" style="${serverRenderer_cjs_prodExports.ssrRenderStyle({ "padding": "40px", "text-align": "center", "color": "var(--meta)", "font-size": "0.9rem" })}">${serverRenderer_cjs_prodExports.ssrInterpolate(vueExports.unref(loaderText))}</div></div><!--]-->`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = vueExports.useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/all.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=all-B0n1LG7l.mjs.map
