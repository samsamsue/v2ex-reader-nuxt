<template>
  <div>
    <LoginBox v-if="needLogin" :from="fromPath" />
    <template v-else>
      <div v-html="codeModeHtml"></div>
      <div id="mainContent">
        <div class="fab-group">
          <div class="fab" @click="scrollTop">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m18 15-6-6-6 6"/></svg>
          </div>
          <div class="fab" @click="reload">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 16h5v5"/></svg>
          </div>
        </div>

        <div id="list">
          <div v-if="loading" class="list-skeleton">
            <div class="skeleton-line w-80"></div>
            <div class="skeleton-line w-60"></div>
            <div class="skeleton-line w-90"></div>
            <div class="skeleton-line w-70"></div>
            <div class="skeleton-line w-50"></div>
          </div>
          <div v-for="item in items" :key="item.code" class="item" :id="`item_${item.code}`">
            <NuxtLink :to="`/t/${item.code}`" @click="saveLastViewed(item.code)">{{ item.title }}</NuxtLink>
            <div class="meta">@{{ item.author }} • {{ item.time }} • {{ item.replies }}回复</div>
          </div>
        </div>

        <div id="loader" ref="loaderEl" style="padding:40px;text-align:center;color:var(--meta);font-size:0.9rem;">
          {{ loaderText }}
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const fromPath = computed(() => route.fullPath || '/all')

const needLogin = ref(false)
const items = ref<Array<{ code: string; title: string; author: string; replies: string; time: string }>>([])
const count = ref<number>(0)
const currentPage = ref<number>(parseInt(String(route.query.p || 0)))
const loaderText = ref('加载中...')
const loaderEl = ref<HTMLElement | null>(null)
const loading = ref(true)
const canLoadMore = ref(false)
let initOnce = false
let userScrolled = false

const scrollTop = () => window.scrollTo({ top: 0 })
const reload = () => window.location.reload()
const saveLastViewed = (code: string) => sessionStorage.setItem('v2_last_code', code)
const checkHighlight = () => {
  document.querySelectorAll('.flash-highlight').forEach((el) => el.classList.remove('flash-highlight'))
  const lastCode = sessionStorage.getItem('v2_last_code')
  if (lastCode) {
    const el = document.getElementById('item_' + lastCode)
    if (el) {
      el.classList.remove('flash-highlight')
      void (el as HTMLElement).offsetWidth
      el.classList.add('flash-highlight')
      sessionStorage.removeItem('v2_last_code')
    }
  }
}

const fetchPage = async (p: number) => {
  try {
    const res: any = await $fetch('/api/all', { query: { p, _t: Date.now() } })
    if (res?.error === 'AUTH') {
      needLogin.value = true
      return null
    }
    return res
  } catch {
    return null
  }
}

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
  <div><span class="code-ln">55</span><span class="code-c">// ... (代码将持续滚动直至 150 行)</span></div>
  <div id="extraCode"></div>
</div>
`

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
      notify.innerText = "该楼层暂未加载或已不存在";
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
`

useHead({
  title: 'V2EX Reader',
  script: [{ children: SHARED_JS, tagPosition: 'bodyClose' }]
})

onMounted(async () => {
  if (initOnce) return
  initOnce = true
  ;(window as any).drawFavicons?.()

  window.addEventListener('scroll', () => { userScrolled = true }, { once: true })

  const initial = await fetchPage(currentPage.value)
  if (initial?.items) {
    items.value = initial.items
    count.value = initial.count || 0
  }
  loading.value = false

  checkHighlight()

  const observer = new IntersectionObserver(
    async (entries) => {
      if (!entries[0].isIntersecting) return
      if (!canLoadMore.value || !userScrolled) return
      currentPage.value += 1
      const res = await fetchPage(currentPage.value)
      if (res?.items?.length) {
        items.value.push(...res.items)
      } else {
        loaderText.value = '到底了'
        observer.disconnect()
      }
    },
    { rootMargin: '100px' }
  )

  if (loaderEl.value) observer.observe(loaderEl.value)

  setTimeout(() => { canLoadMore.value = true }, 1200)

  const poll = async () => {
    if ((window as any).isModeCode || document.visibilityState === 'hidden') {
      setTimeout(poll, 10000)
      return
    }
    try {
      const res: any = await fetchPage(0)
      if (res?.count > count.value) {
        ;(window as any).startBlink?.()
      }
      if (typeof res?.count === 'number') count.value = res.count
    } catch {}
    setTimeout(poll, 60000 + Math.random() * 30000)
  }

  setTimeout(poll, 60000)

  window.addEventListener('pageshow', (e) => {
    if ((e as any).persisted) checkHighlight()
  })
})

onActivated(() => {
  checkHighlight()
})
</script>

<style>
:root { --bg:#fff; --text:#1d2129; --author:#999; --meta:#86909c; --border:#f2f3f5; --fab-bg:rgba(245,245,247,0.7); --input-bg:#f9fafb; --code-k:#0000ff; --code-v:#001080; --code-s:#a31515; --code-c:#008000; --code-ln:#858585; }
@media (prefers-color-scheme:dark) { :root { --bg:#1a1a1c; --text:#e1e1e1; --author:#aaa; --meta:#777; --border:#2d2d2e; --fab-bg:rgba(45,45,46,0.7); --input-bg:#252526; --code-k:#569cd6; --code-v:#9cdcfe; --code-s:#ce9178; --code-c:#6a9955; } }
html { scroll-behavior: auto; }
body { background: var(--bg); color: var(--text); font-family: -apple-system, sans-serif; transition: background 0.3s; margin:0; min-height: 100vh;width:100vw;overflow-x:hidden;  }
#mainContent { width: 650px; max-width:100%; margin: 0 auto; padding: 20px; overflow-wrap: break-word; word-break: break-word; overflow: visible; box-sizing: border-box; }
.item{padding:20px 0;border-bottom:1px solid var(--border);}a{text-decoration:none;color:var(--text);font-size:1.05rem;}.meta{font-size:0.8rem;color:var(--meta);margin-top:6px;}
.fab-group { position:fixed; top:50%; transform: translateY(-50%) ; left:calc(50% + 325px + 1rem); display:flex; flex-direction:column; gap:12px; z-index:100; }
@media (max-width: 800px) { .fab-group {display:none;  } }
.fab { width:48px; height:48px; background:var(--fab-bg); color:var(--text); border-radius:50%; display:flex; align-items:center; justify-content:center; cursor:pointer; backdrop-filter:blur(10px); -webkit-backdrop-filter:blur(10px); border:1px solid rgba(255,255,255,0.1); transition:all 0.3s; }
#codeMode { display:none; position:fixed; top:0; left:0; width:100%; height:100vh; background:var(--bg); color:var(--text); font-family:'Consolas','Monaco',monospace; font-size:13px; line-height:1.5; padding:20px; box-sizing:border-box; overflow-y:auto; z-index:9999; }
.code-ln { color:var(--code-ln); margin-right:15px; user-select:none; display:inline-block; width:25px; text-align:right;}
.code-k { color:var(--code-k); font-weight:bold; } .code-v { color:var(--code-v); } .code-s { color:var(--code-s); } .code-c { color:var(--code-c); }
@keyframes highlight-fade { 0% { background: rgba(255, 235, 59, 0.4); } 100% { background: transparent; } }
.flash-highlight { animation: highlight-fade 3s ease-out; }
.loading{color:var(--meta);padding:20px 0;text-align:center;}
.list-skeleton{padding:20px 0;}
.skeleton-line{height:14px;border-radius:8px;background:linear-gradient(90deg, rgba(0,0,0,0.05) 25%, rgba(0,0,0,0.12) 37%, rgba(0,0,0,0.05) 63%);background-size:400% 100%;animation:skeleton 1.4s ease infinite;margin:12px 0;}
.w-90{width:90%}.w-80{width:80%}.w-70{width:70%}.w-60{width:60%}.w-50{width:50%}
@keyframes skeleton{0%{background-position:100% 0}100%{background-position:0 0}}
</style>
