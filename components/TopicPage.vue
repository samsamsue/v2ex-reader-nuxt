<template>
  <div>
    <LoginBox v-if="requireAuth && needLogin" :from="fromPath" :title="loginTitle" />
    <template v-else>
      <div id="mainContent" @click="handleContentClick">
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
          <div v-if="showOpenOriginal" class="fab" @click.stop="openOriginal" title="在 linux.do 原站打开">
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
        <div v-if="errorMessage" class="error-panel">{{ errorMessage }}</div>

        <div ref="mainRef" v-if="topicReady" class="content" @click="handleClick" v-html="parsedContent"></div>
        <div v-else-if="loadingTopic && !topicContent" class="content skeleton-block">
          <div class="skeleton-line w-90"></div>
          <div class="skeleton-line w-80"></div>
          <div class="skeleton-line w-60"></div>
          <div class="skeleton-line w-85"></div>
          <div class="skeleton-line w-70"></div>
        </div>

        <NuxtLink v-if="showShareLink && shareUrl && (!loadingTopic ||loaded)" :to="shareUrl" class="end-link">—— END ——</NuxtLink>

        <div v-if="repliesReady && total > 0" class="comments">
          <div class="comments-title">讨论 (<span id="count">{{ total }}</span>)</div>
          <div v-if="replyNotice" class="reply-notice">{{ replyNotice }}</div>
          <div id="comments">
            <CommentTree :nodes="replies" :opAuthor="opAuthor" />
          </div>
        </div>
        </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, onUnmounted, nextTick, onActivated, onDeactivated } from 'vue'
import QRCode from 'qrcode'
import { enhanceReplyTreeHtml, enhanceRichHtml } from '../utils/rich-html'
import { applyCodeHighlighting } from '../utils/code-highlight'
import markdownIt from 'markdown-it'

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
  shareBasePath?: string
  shareCodePrefix?: string
  openOriginalTemplate?: string
  loginTitle?: string
}>(), {
  requireAuth: false,
  fromPath: '/all',
  showQr: false,
  shareSalt: undefined,
  showShareLink: false,
  showBack: false,
  backTo: '/all',
  showOpenOriginal: false,
  pageTitle: 'linux.do Reader',
  compactTitle: false,
  shareBasePath: '/s',
  shareCodePrefix: '',
  openOriginalTemplate: 'https://linux.do/t/topic/{id}',
  loginTitle: 'linux.do Reader'
})

useHead({ title: props.pageTitle })

// --- 响应式状态 ---
const needLogin = ref(false)
const loadingTopic = ref(true)
const loadingReplies = ref(true)
const topicTitle = ref('')
const topicContent = ref('')
const loaded = ref(false)
const errorMessage = ref('')
const opAuthor = ref<string | null>(null)
const replies = ref<any[]>([])
const total = ref(0)
const allIds = ref<number[]>([])
const replyNotice = ref('')
const notifyVisible = ref(false)
const historyFloor = ref<string | null>(null)
const showHistoryPrompt = ref(false)
const qrVisible = ref(false)
const qrDataUrl = ref<string>('')
const isModeCode = ref(false) 
const mainRef = ref(null)

const parsedContent = computed(() => {
  //替换图片链接
  const content = topicContent.value
    .replace(/<img(.*?)src="(http|https):\/\/(.*?)"/g, '<img$1src="https://2cn2.com/$3"')
    .replace(/<img(.*?)srcset=".*?"/g, '<img$1')
    .replace('[!quote]+','<div class="blockquote-bar"><span>Blockquote</span> <span class="quote-btn" ><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-up-icon lucide-chevron-up"><path d="m18 15-6-6-6 6"/></svg></span></div>')
  return content
})


const siteMaps = {
  '/api/v2ex/topic':'https://www.v2ex.com',
  '/api/topic':'https://www.linux.do',
}

type ApiKey = keyof typeof siteMaps
const siteKey: ApiKey =  props.topicApiBase
const site = siteMaps[siteKey];  //
provide('site', site)

watch(() => parsedContent.value, () => {
  nextTick(() => {
    
    // 改变quoteBtn的层级位置
    const blockquoteBar = mainRef.value.querySelector('.blockquote-bar')
    const blockquote = blockquoteBar?.closest('blockquote')
    if (blockquote) {
      const blockquoteContent = document.createElement('div')
      blockquoteContent.classList.add('blockquote-content')

      // 先把需要移动的节点放到数组里
      const nodesToMove = Array.from(blockquote.childNodes)
        .filter(node => node !== blockquoteBar)

      // 移动节点到新的容器
      nodesToMove.forEach(node => {
        blockquoteContent.appendChild(node)
      })
      // 添加到 blockquote
      blockquote.appendChild(blockquoteContent)
      // 将 blockquote-bar 放到最前面
      blockquote.insertBefore(blockquoteBar, blockquote.firstChild)
    }

    

    //将所有链接打开方式为新窗口
    mainRef.value?.querySelectorAll('a').forEach(a => {
      let href = a.getAttribute('href')
      if(!/^(http|https):\/\//.test(href) && !/^#/.test(href)){
        a.setAttribute('href', site + (/^\//.test(href) ? '' : '/' ) + href)
      }
      a.setAttribute('target', '_blank')
      a.style.setProperty('--ficon', 'url(https://favicon.2cn2.com/' + a.href.replace(/^https?:\/\//, '') + ')')
      for(let item of ['imgur.com']){
        if(href.indexOf(item) > -1 && href.indexOf('https://2cn2.com/') < 0) {
          a.setAttribute('href', 'https://2cn2.com/'+href)
        }
      }

    })

    mainRef.value?.querySelectorAll('img').forEach(img=>{
        if(img.closest('.lightbox')) {
          img.src = img.closest('.lightbox').getAttribute('href')
          img.removeAttribute('width')
          img.removeAttribute('height')
        }
    })

  })
})

function handleClick(event:any){
  const target = event.target
  if(target.classList.contains('blockquote-bar') || target.closest('.blockquote-bar')) {
    target.closest('blockquote').classList.toggle('collapsed')
  }
  // console.dir(target)
}

// --- 内部变量 ---
let qrcodeInited = false
let lastScrollY = 0
let favInterval: any = null
let normalFav = ''
let alertFav = ''
const SCROLL_KEY = 'linuxdo_floor_pos'

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
  const basePath = (props.shareBasePath || '/s').replace(/\/+$/, '')
  return `${basePath}/${props.shareCodePrefix || ''}${code}`
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
const openOriginal = () => {
  const template = props.openOriginalTemplate || 'https://linux.do/t/topic/{id}'
  const url = template.replace('{id}', String(rawId.value))
  window.open(url, '_blank')
}
const goBack = () => {
  if (document.referrer && document.referrer.includes(location.host)) history.back()
  else navigateTo(props.backTo || '/all')
}

const refreshCodeHighlighting = async () => {
  await nextTick()
  applyCodeHighlighting(document.getElementById('mainContent'))
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

const jumpToFloor = (event: Event | null, floor: number | string) => {
  if (event) {
    event.preventDefault()
    event.stopPropagation()
  }

  const floorId = String(floor || '')
  if (!floorId) return

  const el = document.getElementById('c_' + floorId)
  if (!el) return

  window.scrollTo({ top: el.offsetTop - 80, behavior: 'smooth' })
  el.classList.remove('flash-highlight')
  void el.offsetWidth
  el.classList.add('flash-highlight')
}

const handleContentClick = async (event: Event) => {
  const target = event.target as HTMLElement | null
  if (!target) return

  const floorLink = target.closest('[data-floor-jump]') as HTMLElement | null
  if (floorLink) {
    event.preventDefault()
    const floor = floorLink.getAttribute('data-floor-jump')
    if (floor) jumpToFloor(event, floor)
    return
  }

  const copyBtn = target.closest('[data-code-copy]') as HTMLButtonElement | null
  if (!copyBtn) return

  event.preventDefault()
  const codeEl = copyBtn.closest('.code-preview')?.querySelector('pre code')
  const codeText = codeEl?.textContent || ''
  if (!codeText) return

  try {
    await navigator.clipboard.writeText(codeText)
    const oldText = copyBtn.textContent || '复制'
    copyBtn.textContent = '已复制'
    window.setTimeout(() => {
      copyBtn.textContent = oldText
    }, 1200)
  } catch {
    copyBtn.textContent = '复制失败'
    window.setTimeout(() => {
      copyBtn.textContent = '复制'
    }, 1200)
  }
}

const listenKeydown = (event: KeyboardEvent) => {
  if (event.key !== 'Escape' || !props.showBack) return

  const target = event.target as HTMLElement | null
  if (target) {
    const tagName = target.tagName
    if (target.isContentEditable || tagName === 'INPUT' || tagName === 'TEXTAREA' || tagName === 'SELECT') {
      return
    }
  }

  event.preventDefault()
  goBack()
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

const fetchTopic = async () => {
  loadingTopic.value = true
  try {
    const res: any = await $fetch(`${props.topicApiBase}/${rawId.value}`, { 
      query: { _t: Date.now() } 
    })
    
    // 这里只处理 200 OK 的情况
    if (res?.title) {
      topicTitle.value = res.title
	  if(!props.showQr) document.title = `${res.title}`
      topicContent.value = enhanceRichHtml(res.content || res.contentHtml || '', { enableFloorLinks: true })
	  loaded.value = true
      errorMessage.value = ''
      await refreshCodeHighlighting()
    } else if (res?.error) {
      errorMessage.value = res.message || res.error
    }
  } catch (error: any) {
    // 检查状态码是否为 401，或者检查后端返回的具体错误结构
    if (props.requireAuth && (error.response?.status === 401 || error.data?.error === 'AUTH')) {
      needLogin.value = true
    } else {
      // 处理其他错误，例如弹窗提示网络异常等
      console.error('获取话题失败:', error)
    }
  } finally {
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
    if (res?.error) {
      errorMessage.value = res.message || res.error
      return false
    }
    notifyVisible.value = false
    const prevIds = allIds.value.slice()
    replies.value = enhanceReplyTreeHtml(res?.replies || [])
    opAuthor.value = res?.opAuthor || null
    total.value = res?.total || 0
    allIds.value = res?.allIds || []
    replyNotice.value = res?.replyNotice || ''
    await refreshCodeHighlighting()
    
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



const listenScroll = () => {
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
}

const listenVisible = () => {
  if (document.visibilityState === 'visible') stopBlink()
}

const listPageShow = (e) => {
    if ((e as any).persisted) refreshReplies()
  }

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


const init = ()=> {
	;(window as any).jumpToFloor = jumpToFloor
	window.addEventListener('visibilitychange', listenVisible )
	window.addEventListener('scroll', listenScroll)
	window.addEventListener('pageshow', listPageShow )
	window.addEventListener('keydown', listenKeydown)
	checkHistory()
	fetchTopic()
	fetchReplies()
	pollTimer = setTimeout(poll, 60000)
	drawFavicons()
}

const isFirstActivated = ref(true);

onMounted(() => {
  // 只在第一次挂载时执行
  init();
});

onActivated(() => {
  if (isFirstActivated.value) {
    // 第一次激活（也就是 mount 之后触发的第一次 onActivated）跳过
    isFirstActivated.value = false;
    return;
  }
  // 后续每次 keep-alive 激活时执行
  init();
});

onDeactivated(() => {
  clearTimeout(pollTimer)
  clearTimeout(scrollTimer)
  delete (window as any).jumpToFloor
  window.removeEventListener('visibilitychange', listenVisible )
  window.removeEventListener('scroll', listenScroll)
  window.removeEventListener('pageshow', listPageShow )
  window.removeEventListener('keydown', listenKeydown)
  stopBlink()
  console.log('TopicPage deactivated')
})

onUnmounted(() => {
  if (typeof window !== 'undefined') {
    delete (window as any).jumpToFloor
    window.removeEventListener('keydown', listenKeydown)
  }
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

<style lang="scss">
:root {
  --bg: #fff;
  --text: #1d2129;
  --author: #999;
  --meta: #86909c;
  --border: #eeeeee;
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
  .content, .reply-txt{
    a:not(:where(aside a)) {
      color: #888!important;
      &::before{
        // 黑暗模式，提亮背景图片
        filter:  invert(1) brightness(2) grayscale(1);
      }
    }
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

.content blockquote{
  background-color: var(--input-bg);
  margin: 0;
  margin: 0.5rem 0;
  border-radius: 6px;
  position: relative;
  overflow: hidden;
  &:not(.blockquote-bar){
    padding: 1rem;
  }
  
}

/* 收起楼层 */
.content blockquote.collapsed .blockquote-content{
  display: none;
}
.content blockquote.collapsed .quote-btn svg {
  transform: rotate(180deg);
}
.content .blockquote-bar{
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 1rem;
  color: var(--meta);
  position: relative;
  z-index: 1;
  background-color: var(--input-bg);
  cursor: pointer;
}
.blockquote-content{
  padding:0 1rem 1rem 1rem;
}
.blockquote-content *:where(p,br):empty{
  display:none;
}
.content .quote-btn svg{
  width:1rem;
  height:1rem;
}
.content hr{
  height: 3px;
  border:none;
  margin:2rem 0;
  background: linear-gradient(to right, transparent, var(--input-bg), transparent);
  background-image: repeating-linear-gradient(to right, rgba(180,180,180,0.2) 0 8px, transparent 8px 14px);
  background-size: 100% 2px;
  background-repeat: no-repeat;
  background-position: bottom;
  
}
.quote-title__text-content a{
  display: inline-flex;
  align-items: center;
}
.content,.reply-txt{
   a:not(:where(aside a)) {
    
    &:not(:has(*)):not(:empty) {
      display: inline-flex;
      padding: 0.3em 0.6em;
      background-color: #99999914;
      line-height: 1;
      border-radius: 1em;
      text-decoration: none;
      color: #666;
      align-items: center;
      gap: 0.3em;
      font-size: 0.85em;
      font-weight: 400;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
      max-width: 100%;
      box-sizing: border-box;
      flex-shrink: 1;
      min-width: 0;

      &:hover {
        background-color: #99999927;
        color:var(--text);
      }

      &::before {
        content: '';
        display: block;
        width: 1em;
        height: 1em;
        background-size: contain;
        background-repeat: no-repeat;
        min-width: 0;
        flex-shrink: 0;
        background-image: var(--ficon, url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWxpbmstaWNvbiBsdWNpZGUtbGluayI+PHBhdGggZD0iTTEwIDEzYTUgNSAwIDAgMCA3LjU0LjU0bDMtM2E1IDUgMCAwIDAtNy4wNy03LjA3bC0xLjcyIDEuNzEiLz48cGF0aCBkPSJNMTQgMTFhNSA1IDAgMCAwLTcuNTQtLjU0bC0zIDNhNSA1IDAgMCAwIDcuMDcgNy4wN2wxLjcxLTEuNzEiLz48L3N2Zz4=));
      }

  
      &[href^="#"]::before {
        background-image: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWFycm93LWJpZy11cC1kYXNoLWljb24gbHVjaWRlLWFycm93LWJpZy11cC1kYXNoIj48cGF0aCBkPSJNMTQgMTZhMSAxIDAgMCAwIDEtMXYtMmExIDEgMCAwIDEgMS0xaDMuMjkzYS43MDcuNzA3IDAgMCAwIC41LTEuMjA3bC02LjkzOS02LjkzOWExLjIwNyAxLjIwNyAwIDAgMC0xLjcwOCAwbC02Ljk0IDYuOTRhLjcwNy43MDcgMCAwIDAgLjUgMS4yMDZIOGExIDEgMCAwIDEgMSAxdjJhMSAxIDAgMCAwIDEgMXoiLz48cGF0aCBkPSJNOSAyMGg2Ii8+PC9zdmc+);
      }

      
    }
  }
  img:not(:where(aside img)) {
    max-width: 100% !important;
    height: auto !important;
    border-radius: 4px;
  }
  img.emoji{
    width:1em;
    height:1em;
    vertical-align: middle;
  }
  table {
    border-collapse: collapse;
    table-layout: fixed;
    tr td, tr th {
      border:1px solid var(--border);
      padding:0.5em;
    }
  }
}

.content hr::before{
  content:'xxxx';
  display: block;
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

.error-panel {
  margin: 12px 0 18px;
  padding: 14px 16px;
  border: 1px solid #ffd7d7;
  border-radius: 12px;
  background: #fff6f6;
  color: #7a1f1f;
  line-height: 1.6;
}

.content {
  line-height: 1.7;
  font-size: 1rem;
  overflow: hidden;
}

.content p {
  margin: 0.5rem 0;
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

.content code,
.reply-txt code {
  font-family: 'Consolas', 'Monaco', monospace;
}

.content :not(pre) > code,
.reply-txt :not(pre) > code {
  padding: 0.15rem 0.4rem;
  border-radius: 6px;
  background: rgba(127, 127, 127, 0.12);
  font-size: 0.92em;
}

.code-preview {
  margin: 16px 0;
  border: 1px solid var(--border);
  border-radius: 12px;
  overflow: hidden;
  background: var(--input-bg);
}

.code-preview-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 6px 10px;
  border-bottom: 1px solid var(--border);
  background: rgba(127, 127, 127, 0.08);
}

.code-preview-lang {
  color: var(--meta);
  font-size: 0.72rem;
  text-transform: lowercase;
  letter-spacing: 0.04em;
}

.code-preview-copy {
  border: none;
  border-radius: 6px;
  padding: 4px 8px;
  background: transparent;
  color: var(--meta);
  font: inherit;
  font-size: 0.76rem;
  line-height: 1.2;
  cursor: pointer;
}

.code-preview-copy:hover {
  color: var(--text);
  background: rgba(127, 127, 127, 0.08);
}
.embedded_video {
    width: 100%;
    aspect-ratio: 16 / 9;
    margin:1rem 0;
}
.code-preview-pre {
  margin: 0;
  padding: 14px 16px;
  overflow-x: auto;
  background: transparent;
}

.code-preview-pre code {
  display: block;
  white-space: pre;
  font-size: 0.84rem;
  line-height: 1.55;
  tab-size: 2;
}

.code-token-keyword {
  color: var(--code-k);
}

.code-token-string {
  color: var(--code-s);
}

.code-token-comment {
  color: var(--code-c);
}

.code-token-number {
  color: var(--code-v);
}

.code-token-attr {
  color: var(--code-v);
}

.code-token-tag {
  color: var(--code-k);
}

.floor-jump-link {
  color: inherit;
  text-decoration: underline;
  text-decoration-color: rgba(127, 127, 127, 0.35);
  cursor: pointer;
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

.reply-notice {
  margin: 0.75rem 0 1rem;
  padding: 8px 10px;
  border-radius: 10px;
  background: rgba(255, 193, 7, 0.08);
  border: 1px solid rgba(255, 193, 7, 0.16);
  color: var(--meta);
  font-size: 0.84rem;
  line-height: 1.5;
}

.footnotes-sep{
  border:none;
  border-bottom:1px dashed var(--border);
}
.footnotes-list>*{
  background-color: #7771;
  padding:0.2em 1em;
  padding-left:2em;
  line-height: 1;
}

.skeleton-block {
  padding: 6px 0;
  height:calc(100vh - 80px);
  box-sizing: border-box;
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
