<template>
  <div>
    <LoginBox v-if="requireAuth && needLogin" :from="fromPath" />
    <template v-else>
      
      <div id="codeMode" v-show="isModeCode">
        <div style="margin-bottom:15px; color:var(--code-k); border-bottom:1px solid var(--border); padding-bottom:5px; font-weight:bold;">Infrastructure/Network/LoadBalancer.php</div>
        <div><span class="code-ln">1</span><span class="code-k">&lt;?php</span></div>
        <div><span class="code-ln">2</span><span class="code-k">namespace</span> App\Infrastructure\Network;</div>
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
        <div id="extraCode" v-html="extraCodeHtml"></div>
      </div>

      <div id="mainContent" v-show="!isModeCode">
        <div id="newMsgNotify" :class="{ show: notifyVisible }" @click="refreshReplies">
          <svg v-if="loadingReplies" class="loading-rotate" style="width:1rem;height:1rem;"  xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 16h5v5"/></svg>
          检测到新回复
        </div>
        <div v-if="showHistoryPrompt && historyFloor && replies.length" id="historyPrompt">
          <span>上次看到 <b>#{{ historyFloor }}</b> 楼</span>
          <button @click.stop="jumpToHistory">去这里</button>
          <span class="close" @click.stop="dismissHistory">×</span>
        </div>

        <div class="fab-group">
          <div v-if="showQr" id="qrBtn" class="fab" title="获取分享二维码" @click.stop="toggleQr">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="5" height="5" x="3" y="3" rx="1"/><rect width="5" height="5" x="16" y="3" rx="1"/><rect width="5" height="5" x="3" y="16" rx="1"/><path d="M21 16h-3a2 2 0 0 0-2 2v3"/><path d="M12 7v3a2 2 0 0 1-2 2H7"/><path d="M12 21v-1"/></svg>
          </div>
          <div v-if="showQr" id="qrPopup" v-show="qrVisible" @click.stop>
            <img v-if="qrDataUrl" :src="qrDataUrl" alt="QR" width="140" height="140" />
          </div>
          <div v-if="showOpenOriginal" class="fab" @click.stop="openOriginal" title="在 V2EX 原站打开">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m10 16 4-4-4-4"/><path d="M3 12h11"/><path d="M3 8V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-3"/></svg>
          </div>
          <div v-if="showBack" id="backBtn" class="fab" @click.stop="goBack">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          </div>
          <div class="fab" @click="scrollTop">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m18 15-6-6-6 6"/></svg>
          </div>
          <div id="reBtn" :class="{'loading-rotate': loadingReplies}" class="fab" @click.stop="refreshReplies">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 16h5v5"/></svg>
          </div>
        </div>

        <h1 :class="compactTitle ? 'content-title' : ''">{{ topicTitle || ' ' }}</h1>

        <div v-if="topicReady" class="content" v-html="topicContent"></div>
        <div v-else-if="loadingTopic && !topicContent" class="content skeleton-block">
          <div class="skeleton-line w-90"></div>
          <div class="skeleton-line w-80"></div>
          <div class="skeleton-line w-60"></div>
          <div class="skeleton-line w-85"></div>
          <div class="skeleton-line w-70"></div>
        </div>

        <NuxtLink v-if="showShareLink && shareUrl && !loadingTopic" :to="shareUrl" class="end-link">—— END ——</NuxtLink>

        <div v-if="repliesReady && total > 0" class="comments">
          <div class="comments-title">讨论 (<span id="count">{{ total }}</span>)</div>
          <div id="comments">
            <CommentTree :nodes="replies" :opAuthor="opAuthor" />
          </div>
        </div>
        </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, onUnmounted, nextTick } from 'vue'
import QRCode from 'qrcode'

const props = withDefaults(defineProps<{
  code: string
  salt: number
  topicApiBase: string
  repliesApiBase: string
  requireAuth?: boolean
  fromPath?: string
  showQr?: boolean
  shareSalt?: number
  showShareLink?: boolean
  showBack?: boolean
  backTo?: string
  showOpenOriginal?: boolean
  pageTitle?: string
  pollBase?: string
  compactTitle?: boolean
}>(), {
  requireAuth: false,
  fromPath: '/all',
  showQr: false,
  shareSalt: undefined,
  showShareLink: false,
  showBack: false,
  backTo: '/all',
  showOpenOriginal: false,
  pageTitle: 'V2EX Reader',
  compactTitle: false
})

useHead({ title: props.pageTitle })

// --- 响应式状态 ---
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
const isModeCode = ref(false) 
const extraCodeHtml = ref('')

// --- 内部变量 ---
let qrcodeInited = false
let lastScrollY = 0
let favInterval: any = null
let normalFav = ''
let alertFav = ''
const SCROLL_KEY = 'v2_floor_pos'

// --- 计算属性 ---
const codeParam = computed(() => props.code || '')
const rawId = computed(() => {
  try {
    return parseInt(codeParam.value, 36) ^ props.salt
  } catch {
    return 0
  }
})
const shareUrl = computed(() => {
  if (!props.shareSalt) return ''
  const raw = rawId.value || 0
  const code = (raw ^ props.shareSalt).toString(36)
  return `/s/${code}`
})
const topicReady = computed(() => !!topicContent.value || !loadingTopic.value)
const repliesReady = computed(() => replies.value.length > 0 || total.value > 0 || !loadingReplies.value)

// --- 方法：楼层记忆功能 ---
const saveFloor = (id: string, floorId: string) => {
  if (!id) return // 增加防空判定
  let data = JSON.parse(localStorage.getItem(SCROLL_KEY) || '{}')
  data[id] = { f: floorId, t: Date.now() }
  const keys = Object.keys(data)
  if (keys.length > 100) {
    const oldest = keys.sort((a, b) => data[a].t - data[b].t)[0]
    delete data[oldest]
  }
  localStorage.setItem(SCROLL_KEY, JSON.stringify(data))
}

const getFloor = (id: string) => {
  if (!id) return null
  const data = JSON.parse(localStorage.getItem(SCROLL_KEY) || '{}')
  return data[id] ? data[id].f : null
}

const removeFloor = (id: string) => {
  if (!id) return
  let data = JSON.parse(localStorage.getItem(SCROLL_KEY) || '{}')
  if (data[id]) {
    delete data[id]
    localStorage.setItem(SCROLL_KEY, JSON.stringify(data))
  }
}

// --- 方法：UI 操作 ---
const scrollTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })
const openOriginal = () => window.open(`https://www.v2ex.com/t/${rawId.value}`, '_blank')
const goBack = () => {
  if (document.referrer && document.referrer.includes(location.host)) history.back()
  else navigateTo(props.backTo || '/all')
}

const checkHistory = () => {
  const saved = getFloor(codeParam.value)
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
    window.scrollTo({ top: el.offsetTop - 80, behavior: 'smooth' })
    el.classList.add('flash-highlight')
  }
  dismissHistory()
}

// --- 方法：Favicon 闪烁 ---
const drawFavicons = () => {
  const c = document.createElement('canvas')
  c.width = 32; c.height = 32; const x = c.getContext('2d')!
  x.fillStyle = '#1d2129'; x.fillRect(0, 0, 32, 32)
  x.fillStyle = '#fff'; x.font = 'bold 22px sans-serif'; x.fillText('V', 8, 24)
  normalFav = c.toDataURL()
  x.beginPath(); x.arc(25, 7, 7, 0, Math.PI * 2); x.fillStyle = '#ff2c55'; x.fill()
  x.strokeStyle = '#fff'; x.lineWidth = 2; x.stroke()
  alertFav = c.toDataURL()
  
  let link: HTMLLinkElement = document.querySelector("link[rel*='icon']") || document.createElement('link')
  link.type = 'image/x-icon'; link.rel = 'shortcut icon'; link.href = normalFav
  document.getElementsByTagName('head')[0].appendChild(link)
}

const startBlink = () => {
  if (favInterval) return
  let s = 0
  favInterval = setInterval(() => {
    const link: HTMLLinkElement | null = document.querySelector("link[rel*='icon']")
    if (link) link.href = (s % 2 === 0) ? alertFav : normalFav
    s++
  }, 800)
}

const stopBlink = () => {
  if (favInterval) { clearInterval(favInterval); favInterval = null }
  const link: HTMLLinkElement | null = document.querySelector("link[rel*='icon']")
  if (link) link.href = normalFav
}

// --- 方法：代码模式 (取代全局双击事件) ---
const handleDblClick = (e: MouseEvent) => {
  if ((e.target as HTMLElement).closest('.fab')) return
  
  isModeCode.value = !isModeCode.value
  const html = document.documentElement
  
  if (isModeCode.value) {
    // 生成伪造代码行
    let extra = ''
    for (let i = 56; i < 160; i++) {
      extra += `<div><span class="code-ln">${i}</span><span class="code-c">// LOG: Syncing with distributed shard 0x${(Math.random() * 0xFFFF << 0).toString(16).toUpperCase()}... OK</span></div>`
    }
    extraCodeHtml.value = extra
    
    lastScrollY = window.scrollY
    html.style.scrollBehavior = 'auto'
    document.body.style.overflow = 'hidden'
    
    // 异步确保 DOM 渲染后滚动
    nextTick(() => {
      const cm = document.getElementById('codeMode')
      if (cm) cm.scrollTop = 200 + Math.random() * 300
    })
  } else {
    document.body.style.overflow = ''
    window.scrollTo(0, lastScrollY)
    setTimeout(() => { html.style.scrollBehavior = 'smooth' }, 50)
  }
}

// --- 数据抓取 ---
const fetchTopic = async () => {
  loadingTopic.value = true
  try {
    const res: any = await $fetch(`${props.topicApiBase}/${rawId.value}`, { query: { _t: Date.now() } })
    if (props.requireAuth && res?.error === 'AUTH') {
      needLogin.value = true
      return
    }
    if (res?.title) {
      topicTitle.value = res.title
      topicContent.value = res.content || res.contentHtml || ''
    }
  } catch {} finally {
    loadingTopic.value = false
  }
}

const fetchReplies = async (silent = false): Promise<boolean> => {
  if (!silent) loadingReplies.value = true
  let hasNewReplies = false
  
  try {
    const res: any = await $fetch(`${props.repliesApiBase}/${rawId.value}`, { query: { _t: Date.now() } })
    if (props.requireAuth && res?.error === 'AUTH') {
      needLogin.value = true
      return false
    }
    
    const prevIds = allIds.value.slice()
    replies.value = res?.replies || []
    opAuthor.value = res?.opAuthor || null
    total.value = res?.total || 0
    allIds.value = res?.allIds || []
    
    if (silent && prevIds.length) {
      const newIds = allIds.value.filter((id) => !prevIds.includes(id))
      
      if (newIds.length > 0) {
        hasNewReplies = true
        nextTick(() => {
          // 定位到第一个新回复
          const firstNewEl = document.getElementById('c_' + newIds[0])
          if (firstNewEl) {
            window.scrollTo({ top: firstNewEl.offsetTop - 80, behavior: 'smooth' })
          }
          
          // 给所有新回复加上闪烁特效
          newIds.forEach((id) => {
            const el = document.getElementById('c_' + id)
            if (el) {
              // 强制重绘，确保高亮动画能正常触发
              el.classList.remove('flash-highlight')
              void el.offsetWidth 
              el.classList.add('flash-highlight')
            }
          })
        })
      }
    }
  } catch {} finally {
    if (!silent) loadingReplies.value = false
  }
  
  return hasNewReplies
}

const refreshReplies = async () => {
  const currentY = window.scrollY
  loadingReplies.value = true
  const hasNew = await fetchReplies(true)
  loadingReplies.value = false
  
  // 仅在没有新回复时，才强行恢复滚动条，防止页面乱跳
  if (!hasNew) {
    window.scrollTo(0, currentY)
  }
  
  notifyVisible.value = false
  stopBlink()
  checkHistory()
}

const toggleQr = async () => {
  if (!props.showQr || !shareUrl.value) return
  qrVisible.value = !qrVisible.value
  if (qrVisible.value && !qrcodeInited) {
    try {
      qrDataUrl.value = await QRCode.toDataURL(window.location.origin + shareUrl.value, { width: 140, margin: 1 })
      qrcodeInited = true
    } catch {}
  }
}

// --- 生命周期 ---
let pollTimer: any = null
let scrollTimer: any = null

onActivated(() => {
  checkHistory()
})

onMounted(() => {
  drawFavicons()
  window.addEventListener('dblclick', handleDblClick)
  window.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') stopBlink()
  })

  // 初始加载
  fetchTopic()
  fetchReplies()

  // 滚动监听：记录阅读进度
  window.addEventListener('scroll', () => {
    if (isModeCode.value) return
    
    // 【修复核心】：如果历史提示还在显示，说明用户还没决定是否跳转，此时屏蔽清除或覆盖逻辑
    if (showHistoryPrompt.value) return 

    clearTimeout(scrollTimer)
    scrollTimer = setTimeout(() => {
      const comments = document.querySelectorAll('.comment-item')
      const commentsBox = document.getElementById('comments')
      
      // 如果向上滚动离开了评论区，则清除该帖子的阅读记录
      if (commentsBox && commentsBox.getBoundingClientRect().top > 85 && window.scrollY > 10) {
        removeFloor(codeParam.value)
        return
      }
      
      // 记录当前看过的楼层
      let currentFloor: string | null = null
      for (let i = 0; i < comments.length; i++) {
        const rect = comments[i].getBoundingClientRect()
        if (rect.bottom > 85) {
          currentFloor = (comments[i] as HTMLElement).id.replace('c_', '')
          break
        }
      }
      if (currentFloor) saveFloor(codeParam.value, currentFloor)
    }, 300)
  })

  // 轮询新回复
  const poll = async () => {
    if (isModeCode.value || document.visibilityState === 'hidden') {
      pollTimer = setTimeout(poll, 10000)
      return
    }
    try {
      const res: any = await $fetch(`${props.repliesApiBase}/${rawId.value}`, { query: { _t: Date.now() } })
      if (res?.total > total.value) {
        notifyVisible.value = true
        startBlink()
      }
    } catch {}
    pollTimer = setTimeout(poll, 50000 + Math.random() * 20000)
  }
  pollTimer = setTimeout(poll, 60000)

  window.addEventListener('pageshow', (e) => {
    if ((e as any).persisted) refreshReplies()
  })
})

onUnmounted(() => {
  window.removeEventListener('dblclick', handleDblClick)
  clearTimeout(pollTimer)
  clearTimeout(scrollTimer)
  stopBlink()
})

// --- 监听 ID 变化 ---
watch(() => rawId.value, async (next, prev) => {
  if (!next || next === prev) return
  loadingTopic.value = true
  loadingReplies.value = true
  await Promise.allSettled([fetchTopic(), fetchReplies()])
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
  scroll-behavior:auto ;
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

.content h1 {
  font-size: 1.2rem;
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
  /* display: none; */ /* 现在由 Vue 控制，不需要初始写死 */
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
  display: flex;
  gap:1rem;
  align-items: center;
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
  white-space: nowrap;
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