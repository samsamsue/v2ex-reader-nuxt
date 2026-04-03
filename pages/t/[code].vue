<template>
  <div>
    <LoginBox v-if="needLogin" :from="fromPath" />
    <template v-else>
      <div v-html="codeModeHtml"></div>
      <div id="mainContent">
        <div id="newMsgNotify" :class="{ show: notifyVisible }" @click="refreshReplies">检测到新回复</div>
        <div v-if="showHistoryPrompt && historyFloor" id="historyPrompt">
          <span>上次看到 <b>#{{ historyFloor }}</b> 楼</span>
          <button @click.stop="jumpToHistory">去这里</button>
          <span class="close" @click.stop="dismissHistory">×</span>
        </div>

        <div class="fab-group">
          <div id="qrBtn" class="fab" title="获取分享二维码" @click.stop="toggleQr">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="5" height="5" x="3" y="3" rx="1"/><rect width="5" height="5" x="16" y="3" rx="1"/><rect width="5" height="5" x="3" y="16" rx="1"/><path d="M21 16h-3a2 2 0 0 0-2 2v3"/><path d="M12 7v3a2 2 0 0 1-2 2H7"/><path d="M12 21v-1"/></svg>
          </div>
          <div id="qrPopup" v-show="qrVisible" @click.stop>
            <img v-if="qrDataUrl" :src="qrDataUrl" alt="QR" width="140" height="140" />
          </div>
          <div id="backBtn" class="fab" @click.stop="goBack">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          </div>
          <div class="fab" @click="scrollTop">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m18 15-6-6-6 6"/></svg>
          </div>
          <div id="reBtn" class="fab" @click.stop="refreshReplies">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 16h5v5"/></svg>
          </div>
        </div>

        <h1 class="content-title">{{ topicTitle || ' ' }}</h1>

        <div v-if="!loadingTopic" class="content" v-html="topicContent"></div>
        <div v-else class="content skeleton-block">
          <div class="skeleton-line w-90"></div>
          <div class="skeleton-line w-80"></div>
          <div class="skeleton-line w-60"></div>
          <div class="skeleton-line w-85"></div>
          <div class="skeleton-line w-70"></div>
        </div>

        <NuxtLink :to="shareUrl" class="end-link">—— END ——</NuxtLink>

        <div v-if="!loadingReplies && total > 0" class="comments">
          <div class="comments-title">讨论 (<span id="count">{{ total }}</span>)</div>
          <div id="comments">
            <CommentTree :nodes="replies" :opAuthor="opAuthor" />
          </div>
        </div>
        <div v-else-if="loadingReplies" class="loading">Loading replies...</div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import QRCode from 'qrcode'
const SALT = 987654
const SHARE_SALT = 1234567

const route = useRoute()
const fromPath = computed(() => route.fullPath || '/all')

const needLogin = ref(false)
const loadingTopic = ref(true)
const loadingReplies = ref(true)
const topicTitle = ref('')
const topicContent = ref('')
const opAuthor = ref<string | null>(null)
const replies = ref<any[]>([])
const total = ref(0)
const allIds = ref<number[]>([])
const notifyVisible = ref(false)
const historyFloor = ref<string | null>(null)
const showHistoryPrompt = ref(false)
const qrVisible = ref(false)
const qrDataUrl = ref<string>('')
let qrcodeInited = false
let initOnce = false

const codeParam = computed(() => String(route.params.code || ''))
const rawId = computed(() => {
  try {
    return parseInt(codeParam.value, 36) ^ SALT
  } catch {
    return 0
  }
})

const shareUrl = computed(() => {
  const raw = rawId.value || 0
  const code = (raw ^ SHARE_SALT).toString(36)
  return `/s/${code}`
})

const scrollTop = () => window.scrollTo({ top: 0 })
const goBack = () => {
  if (document.referrer && document.referrer.includes(location.host)) history.back()
  else navigateTo('/all')
}
const postCode = computed(() => codeParam.value)
const checkHistory = () => {
  const saved = (window as any).getFloor?.(postCode.value)
  if (saved) {
    historyFloor.value = saved
    showHistoryPrompt.value = true
  }
}
const dismissHistory = () => {
  showHistoryPrompt.value = false
}
const jumpToHistory = () => {
  if (!historyFloor.value) return
  const el = document.getElementById('c_' + historyFloor.value)
  if (el) {
    window.scrollTo({ top: el.offsetTop - 80 })
    el.classList.add('flash-highlight')
  }
  dismissHistory()
}

const fetchTopic = async () => {
  loadingTopic.value = true
  try {
    const res: any = await $fetch(`/api/topic/${rawId.value}`, { query: { _t: Date.now() } })
    if (res?.error === 'AUTH') {
      needLogin.value = true
      return
    }
    if (res?.title) {
      topicTitle.value = res.title
      topicContent.value = res.content || res.contentHtml || ''
    }
  } catch {}
  loadingTopic.value = false
}

const fetchReplies = async (silent = false) => {
  if (!silent) loadingReplies.value = true
  try {
    const res: any = await $fetch(`/api/replies/${rawId.value}`, { query: { _t: Date.now() } })
    if (res?.error === 'AUTH') {
      needLogin.value = true
      return
    }
    const prevIds = allIds.value.slice()
    replies.value = res?.replies || []
    opAuthor.value = res?.opAuthor || null
    total.value = res?.total || 0
    allIds.value = res?.allIds || []
    if (silent && prevIds.length) {
      const newIds = allIds.value.filter((id) => !prevIds.includes(id))
      if (newIds.length) {
        newIds.forEach((id) => {
          const el = document.getElementById('c_' + id)
          if (el) el.classList.add('flash-highlight')
        })
      }
    }
  } catch {}
  if (!silent) loadingReplies.value = false
}

const refreshReplies = async () => {
  const y = window.scrollY
  await fetchReplies(true)
  window.scrollTo(0, y)
  notifyVisible.value = false
  ;(window as any).stopBlink?.()
  checkHistory()
}

const toggleQr = async () => {
  qrVisible.value = !qrVisible.value
  if (qrVisible.value && !qrcodeInited) {
    try {
      qrDataUrl.value = await QRCode.toDataURL(window.location.origin + shareUrl.value, { width: 140, margin: 1 })
      qrcodeInited = true
    } catch {}
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
`;

useHead({
  title: 'V2EX Reader',
  script: [
    { children: SHARED_JS, tagPosition: 'bodyClose' }
  ]
})

onMounted(async () => {
  if (initOnce) return
  initOnce = true
  ;(window as any).drawFavicons?.()

  const p1 = fetchTopic()
  const p2 = fetchReplies()
  await Promise.allSettled([p1, p2])

  let scrollTimer: any
  window.addEventListener('scroll', () => {
    if ((window as any).isModeCode) return
    clearTimeout(scrollTimer)
    scrollTimer = setTimeout(() => {
      const comments = document.querySelectorAll('.comment-item')
      const commentsBox = document.getElementById('comments')
      if (commentsBox && commentsBox.getBoundingClientRect().top > 85) {
        ;(window as any).removeFloor?.(postCode.value)
        return
      }
      let currentFloor: string | null = null
      for (let i = 0; i < comments.length; i++) {
        const rect = comments[i].getBoundingClientRect()
        if (rect.bottom > 85) {
          currentFloor = (comments[i] as HTMLElement).id.replace('c_', '')
          break
        }
      }
      if (currentFloor) {
        ;(window as any).saveFloor?.(postCode.value, currentFloor)
      }
    }, 300)
  })

  const poll = async () => {
    if ((window as any).isModeCode || document.visibilityState === 'hidden') {
      setTimeout(poll, 10000)
      return
    }
    try {
      const res: any = await $fetch(`/api/replies/${rawId.value}`, { query: { _t: Date.now() } })
      if (res?.total > total.value) {
        notifyVisible.value = true
        ;(window as any).startBlink?.()
      }
    } catch {}
    setTimeout(poll, 50000 + Math.random() * 20000)
  }

  setTimeout(poll, 60000)

  window.addEventListener('pageshow', (e) => {
    if ((e as any).persisted) refreshReplies()
  })

  checkHistory()
})

onActivated(() => {
  checkHistory()
})
</script>

<style>
:root {
  --bg: #fff;
  --text: #1d2129;
  --author: #999;
  --meta: #86909c;
  --border: #f2f3f5;
  --fab-bg: rgba(245, 245, 247, 0.7);
  --input-bg: #f9fafb;
  --code-k: #0000ff;
  --code-v: #001080;
  --code-s: #a31515;
  --code-c: #008000;
  --code-ln: #858585;
}

@media (prefers-color-scheme:dark) {
  :root {
    --bg: #1a1a1c;
    --text: #e1e1e1;
    --author: #aaa;
    --meta: #777;
    --border: #2d2d2e;
    --fab-bg: rgba(45, 45, 46, 0.7);
    --input-bg: #252526;
    --code-k: #569cd6;
    --code-v: #9cdcfe;
    --code-s: #ce9178;
    --code-c: #6a9955;
  }
}

html {
  scroll-behavior: auto;
}

body {
  background: var(--bg);
  color: var(--text);
  font-family: -apple-system, sans-serif;
  transition: background 0.3s;
  margin: 0;
  min-height: 100vh;
  width: 100vw;
  overflow-x: hidden;
}

#mainContent {
  width: 650px;
  max-width: 100%;
  margin: 0 auto;
  padding: 20px;
  overflow-wrap: break-word;
  word-break: break-word;
  overflow: visible;
  box-sizing: border-box;
}

.content {
  line-height: 1.7;
  font-size: 1rem;
  overflow: hidden;
}

.content p {
  margin: 0.5rem 0;
}

.content img,
.reply-txt img {
  max-width: 100% !important;
  height: auto !important;
  display: block;
  margin: 15px 0;
  border-radius: 4px;
}

.content h2 {
  font-size: 1.1rem;
}

.content h3 {
  font-size: 1.05rem;
}

.content-title {
  font-size: 0.8em;
  border-bottom: 1px solid var(--border);
  margin-bottom: 10px;
  padding-bottom: 5px;
  color: var(--text);
  font-weight: normal;
  opacity: 0.4;
  text-align: center;
}

.content-empty {
  color: #ccc;
  text-align: center;
  margin-top: 50px;
  font-size: 1.2rem;
  display: flex;
  justify-content: center;
  flex-direction: column;
  align-items: center;
  font-weight: 300;
}

.op-tag {
  line-height: 1;
  background: #000;
  color: #fff;
  font-size: 0.65rem;
  padding: 0.3em 0.5em;
  border-radius: 3px;
  margin-left: 4px;
  vertical-align: middle;
}

@media (prefers-color-scheme: dark) {
  .op-tag {
    background: #fff;
    color: #000;
  }
}

.fab-group {
  position: fixed;
  top: 50%;
  transform: translateY(-50%);
  left: calc(50% + 325px + 1rem);
  display: flex;
  flex-direction: column;
  gap: 12px;
  z-index: 100;
}

@media (max-width: 800px) {
  .fab-group {
    display: none;
  }
}

.fab {
  width: 48px;
  height: 48px;
  background: var(--fab-bg);
  color: var(--text);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s;
}

#codeMode {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  background: var(--bg);
  color: var(--text);
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 13px;
  line-height: 1.5;
  padding: 20px;
  box-sizing: border-box;
  overflow-y: auto;
  z-index: 9999;
}

.code-ln {
  color: var(--code-ln);
  margin-right: 15px;
  user-select: none;
  display: inline-block;
  width: 25px;
  text-align: right;
}

.code-k {
  color: var(--code-k);
  font-weight: bold;
}

.code-v {
  color: var(--code-v);
}

.code-s {
  color: var(--code-s);
}

.code-c {
  color: var(--code-c);
}

@keyframes highlight-fade {
  0% {
    background: rgba(255, 235, 59, 0.4);
  }

  100% {
    background: transparent;
  }
}

.flash-highlight {
  animation: highlight-fade 3s ease-out;
  border-radius: 8px;
}

.comment-bar {
  font-size: 0.75rem;
  font-weight: 400;
  margin-bottom: 5px;
  color: var(--meta);
  display: flex;
  align-items: center;
}

.comment-bar>* {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.reply-author {
  color: #aaa;
  font-size: 0.8rem;
}

.reply-txt {
  font-size: 1rem;
  color: var(--text);
  overflow-wrap: break-word;
  line-height: 1.6;
}

#newMsgNotify {
  visibility: hidden;
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%) translateY(-150%);
  background: #ff2c55;
  color: #fff;
  padding: 10px 24px;
  border-radius: 30px;
  font-size: 14px;
  font-weight: 600;
  z-index: 101;
  cursor: pointer;
  transition: transform 0.5s;
}

#newMsgNotify.show {
  transform: translateX(-50%) translateY(0);
  visibility: visible;
}

#historyPrompt {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: var(--bg);
  border: 1px solid var(--border);
  color: var(--text);
  padding: 10px 16px;
  border-radius: 40px;
  font-size: 14px;
  z-index: 102;
  cursor: default;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 12px;
}

#historyPrompt button {
  background: #1d2129;
  color: #fff;
  border: none;
  border-radius: 12px;
  padding: 6px 14px;
  cursor: pointer;
  font-weight: 600;
}

#historyPrompt .close {
  color: var(--meta);
  font-size: 18px;
  margin-left: 5px;
  padding: 0 5px;
  cursor: pointer;
}

#qrPopup {
  position: absolute;
  right: 60px;
  top: 0;
  background: var(--bg);
  padding: 10px;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  border: 1px solid var(--border);
  cursor: default;
  z-index: 200;
}

#qrPopup img {
    background: #fff;
    padding: 5px;
    border-radius: 4px;
    width: 140px;
    height: 140px;
    display: block;
  }

.end-link {
  display: block;
  opacity: 0.2;
  font-size: 1rem;
  margin: 2rem auto;
  text-align: center;
  color: inherit;
  text-decoration: none;
  font-weight: 300;
}

.loading {
  color: var(--meta);
  padding: 20px 0;
  text-align: center;
}

  .comments-title {
    margin-top: 2rem;
    font-weight: bold;
    margin-bottom: 10px;
    font-size: 1.1rem;
    border-bottom: 1.5px solid var(--text);
    display: inline-block;
    padding-bottom: 3px;
  }
  .skeleton-block {
    padding: 6px 0;
  }
  .skeleton-line {
    height: 14px;
    border-radius: 8px;
    background: linear-gradient(90deg, rgba(0,0,0,0.05) 25%, rgba(0,0,0,0.12) 37%, rgba(0,0,0,0.05) 63%);
    background-size: 400% 100%;
    animation: skeleton 1.4s ease infinite;
    margin: 10px 0;
  }
  .w-90 { width: 90%; }
  .w-85 { width: 85%; }
  .w-80 { width: 80%; }
  .w-70 { width: 70%; }
  .w-60 { width: 60%; }
  @keyframes skeleton {
    0% { background-position: 100% 0; }
    100% { background-position: 0 0; }
  }
</style>
