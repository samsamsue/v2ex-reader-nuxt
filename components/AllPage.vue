<template>
  <div class="page-container">
    <LoginBox v-if="needLogin" :from="fromPath" :title="siteConfig.title" />
    <template v-else>
      <div id="mainContent">
        <div class="toolbar">
          <div class="site-switcher" role="tablist" aria-label="Site switcher">
            <button
              v-for="option in siteOptions"
              :key="option.key"
              :class="['site-tab', { active: activeSite === option.key }]"
              type="button"
              @click="switchSite(option.key)"
            >
              {{ option.label }}
            </button>
          </div>
        </div>

        <div class="fab-group">
          <button
            class="fab"
            type="button"
            title="浏览历史"
            @click="openHistory"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
              <path d="M12 7v5l3 2" />
            </svg>
          </button>

          <button
            v-if="notificationsEnabled"
            class="fab"
            type="button"
            title="消息提醒"
            @click="openNotif"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M2.992 16.342a2 2 0 0 1 .094 1.167l-1.065 3.29a1 1 0 0 0 1.236 1.168l3.413-.998a2 2 0 0 1 1.099.092 10 10 0 1 0-4.777-4.719" />
              <path d="M8 12h.01" />
              <path d="M12 12h.01" />
              <path d="M16 12h.01" />
            </svg>
            <span v-if="unreadCount > 0" class="badge">{{ unreadCount > 99 ? '99+' : unreadCount }}</span>
          </button>

          <button class="fab" type="button" title="回到顶部" @click="scrollTop">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="m18 15-6-6-6 6" />
            </svg>
          </button>

          <button
            class="fab"
            :class="{ 'loading-rotate': loading }"
            type="button"
            title="刷新列表"
            @click="loadList"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
              <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
              <path d="M16 16h5v5" />
            </svg>
          </button>
        </div>

        <div v-if="errorMessage" class="error-panel">
          <div class="error-title">无法读取 {{ siteConfig.label }} 列表</div>
          <div class="error-body">{{ errorMessage }}</div>
        </div>

        <div id="list">
          <div v-if="loading && !items.length" class="list-skeleton">
            <div v-for="i in 5" :key="i" :class="['skeleton-line', `w-${40 + i * 10}`]"></div>
          </div>

          <div
            v-for="item in items"
            :key="item.code"
            :id="`item_${item.code}`"
            :class="['item', { 'flash-highlight': lastViewedCode === item.code }]"
          >
            <NuxtLink :to="topicLink(item.code)" @click="saveLastViewed(item)">
              {{ item.title }}
            </NuxtLink>
            <div class="meta">@{{ item.author }} · {{ item.time }} · {{ item.replies }} 回复</div>
          </div>
        </div>

        <div id="loader" ref="loaderEl" class="loader-text">
          <template v-if="items.length">
            {{ loaderText }}
          </template>
        </div>
      </div>

      <div id="notifOverlay" :class="{ open: showNotif }" @click="showNotif = false"></div>
      <div id="notifModal" :class="{ open: showNotif }">
        <div class="notif-header">
          <h3>{{ siteConfig.label }} 提醒</h3>
          <button class="close-btn" type="button" aria-label="关闭" @click="showNotif = false">&times;</button>
        </div>

        <div v-if="notifLoading && !notifs.length" class="notif-state">
          <p>正在获取消息...</p>
        </div>

        <div v-else-if="notifs.length === 0" class="notif-state">
          <p>暂无新消息</p>
        </div>

        <div v-else class="notif-list">
          <div v-for="n in notifs" :key="n.id || `${n.encodedId}-${n.floor || n.replyId || ''}`" class="notif-item" @click="goToTopic(n)">
            <div class="notif-body">
              <div class="notif-title">{{ n.desc }}</div>
              <div class="notif-meta">
                <span class="time">{{ n.time }}</span>
              </div>
              <div v-if="n.payload" class="notif-payload" v-html="n.payload"></div>
            </div>
            <div class="notif-arrow">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="m9 18 6-6-6-6" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div id="historyOverlay" :class="{ open: showHistory }" @click="showHistory = false"></div>
      <div id="historyModal" :class="{ open: showHistory }">
        <div class="history-header">
          <h3>浏览历史</h3>
          <button
            v-if="historyItems.length"
            class="history-clear-btn"
            type="button"
            @click="clearHistory"
          >
            清空
          </button>
          <button class="close-btn" type="button" aria-label="关闭" @click="showHistory = false">&times;</button>
        </div>

        <div v-if="historyItems.length === 0" class="history-state">
          <p>暂无浏览历史</p>
        </div>

        <div v-else class="history-list">
          <div v-for="item in historyItems" :key="`${item.site}-${item.code}`" class="history-item" @click="goToHistoryItem(item)">
            <div class="history-body">
              <div class="history-title">{{ item.title }}</div>
              <div class="history-meta">{{ item.siteLabel }} · {{ formatHistoryTime(item.visitedAt) }}</div>
            </div>
            <div class="history-arrow">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="m9 18 6-6-6-6" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { lockScroll, unLockScroll } from '../utils/common'

const LINUXDO_PREFIX = 'l-'
const route = useRoute()
const router = useRouter()

const siteOptions = [
  { key: 'v2ex', label: 'V2EX' },
  { key: 'linuxdo', label: 'linux.do' }
] as const

const siteMap = {
  v2ex: {
    key: 'v2ex',
    label: 'V2EX',
    title: 'V2EX Reader',
    listApi: '/api/v2ex/all',
    notifApi: '/api/v2ex/notif',
    notifCountApi: '/api/v2ex/notif/count',
    hasCookieKey: 'hasV2Cookie',
    firstListKey: 'v2ex_first_list',
    lastCodeKey: 'v2ex_last_code',
    topicPrefix: ''
  },
  linuxdo: {
    key: 'linuxdo',
    label: 'linux.do',
    title: 'linux.do Reader',
    listApi: '/api/all',
    notifApi: '/api/notif',
    notifCountApi: '/api/notif/count',
    hasCookieKey: 'hasLinuxDoCookie',
    firstListKey: 'linuxdo_first_list',
    lastCodeKey: 'linuxdo_last_code',
    topicPrefix: LINUXDO_PREFIX
  }
} as const

type SiteKey = keyof typeof siteMap

const activeSite = computed<SiteKey>(() => {
  if (route.path.startsWith('/linuxdo')) return 'linuxdo'
  if (route.query.site === 'linuxdo') return 'linuxdo'
  return 'v2ex'
})
const siteConfig = computed(() => siteMap[activeSite.value])
const LIST_SCROLL_KEY = 'reader_list_scroll_positions'
const HISTORY_KEY = 'reader_browse_history'
const HISTORY_LIMIT = 30

const needLogin = ref(false)
const items = ref<any[]>([])
const loading = ref(false)
const errorMessage = ref('')
const showingCachedList = ref(false)
const showNotif = ref(false)
const showHistory = ref(false)
const unreadCount = ref(0)
const notifs = ref<any[]>([])
const historyItems = ref<HistoryItem[]>([])
const notifLoading = ref(false)
const notificationsEnabled = ref(false)
const currentPage = ref(0)
const canLoadMore = ref(false)
const isLoadingMore = ref(false)
const loaderEl = ref<HTMLElement | null>(null)
const loaderText = ref('加载中...')
const lastViewedCode = ref<string | null>(null)

let observer: IntersectionObserver | null = null
let unreadTimer: ReturnType<typeof setInterval> | null = null
let enableMoreTimer: ReturnType<typeof setTimeout> | null = null
let pageShowHandler: ((event: PageTransitionEvent) => void) | null = null
let normalFav = ''
let faviconLink: HTMLLinkElement | null = null

type HistoryItem = {
  code: string
  title: string
  site: SiteKey
  siteLabel: string
  path: string
  visitedAt: number
}

const readScrollPositions = () => {
  if (!process.client) return {} as Record<string, number>
  try {
    return JSON.parse(sessionStorage.getItem(LIST_SCROLL_KEY) || '{}') as Record<string, number>
  } catch {
    return {}
  }
}

const saveListScroll = (path = route.fullPath) => {
  if (!process.client || !path) return
  const positions = readScrollPositions()
  positions[path] = window.scrollY || 0
  sessionStorage.setItem(LIST_SCROLL_KEY, JSON.stringify(positions))
}

const restoreListScroll = async () => {
  if (!process.client) return

  const savedY = readScrollPositions()[route.fullPath]
  if (typeof savedY !== 'number' || savedY <= 0) return

  await nextTick()

  let attempts = 0
  const maxAttempts = 20

  const tryRestore = () => {
    window.scrollTo(0, savedY)

    const maxScrollableY = Math.max(0, document.documentElement.scrollHeight - window.innerHeight)
    const reachedTarget = Math.abs(window.scrollY - Math.min(savedY, maxScrollableY)) <= 2

    if (reachedTarget || attempts >= maxAttempts) return

    attempts += 1
    window.requestAnimationFrame(tryRestore)
  }

  window.requestAnimationFrame(tryRestore)
}

watch(showNotif, (val) => {
  if (!process.client) return
  if (val) lockScroll('notif')
  else unLockScroll('notif')
})

watch(showHistory, (val) => {
  if (!process.client) return
  if (val) lockScroll('history')
  else unLockScroll('history')
})

const fromPath = computed(() => route.fullPath || '/v2ex')

const topicLink = (code: string) => `/t/${siteConfig.value.topicPrefix}${code}`

const switchSite = async (site: SiteKey) => {
  if (site === activeSite.value) return
  await router.replace(site === 'linuxdo' ? '/linuxdo' : '/v2ex')
}

const readHistory = (): HistoryItem[] => {
  if (!process.client) return []
  try {
    const parsed = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]')
    if (!Array.isArray(parsed)) return []
    return parsed
      .filter((item) => item && typeof item.code === 'string' && typeof item.title === 'string')
      .slice(0, HISTORY_LIMIT)
  } catch {
    return []
  }
}

const writeHistory = (itemsToWrite: HistoryItem[]) => {
  if (!process.client) return
  localStorage.setItem(HISTORY_KEY, JSON.stringify(itemsToWrite.slice(0, HISTORY_LIMIT)))
}

const recordHistory = (item: any) => {
  if (!process.client || !item?.code) return
  const historyItem: HistoryItem = {
    code: item.code,
    title: String(item.title || '无标题'),
    site: siteConfig.value.key,
    siteLabel: siteConfig.value.label,
    path: topicLink(item.code),
    visitedAt: Date.now()
  }
  const rest = readHistory().filter((entry) => !(entry.site === historyItem.site && entry.code === historyItem.code))
  writeHistory([historyItem, ...rest])
}

const openHistory = () => {
  historyItems.value = readHistory()
  showHistory.value = true
}

const clearHistory = () => {
  writeHistory([])
  historyItems.value = []
}

const formatHistoryTime = (value: number) => {
  if (!value) return ''
  const diff = Date.now() - value
  if (diff < 60_000) return '刚刚'
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)} 分钟前`
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)} 小时前`
  return new Date(value).toLocaleDateString()
}

const drawDefaultFavicon = () => {
  if (normalFav || !process.client) return
  const c = document.createElement('canvas')
  c.width = 32
  c.height = 32
  const x = c.getContext('2d')
  if (!x) return
  x.fillStyle = '#1d2129'
  x.fillRect(0, 0, 32, 32)
  x.fillStyle = '#fff'
  x.font = 'bold 22px sans-serif'
  x.fillText('V', 8, 24)
  normalFav = c.toDataURL()
}

const getFaviconLink = () => {
  if (faviconLink && document.head.contains(faviconLink)) return faviconLink

  faviconLink = document.querySelector<HTMLLinkElement>("link[rel*='icon']")
  if (faviconLink) return faviconLink

  faviconLink = document.createElement('link')
  faviconLink.type = 'image/x-icon'
  faviconLink.rel = 'shortcut icon'
  document.head.appendChild(faviconLink)
  return faviconLink
}

const restoreDefaultFavicon = () => {
  if (!process.client) return
  drawDefaultFavicon()
  if (!normalFav) return
  const link = getFaviconLink()
  if (link.href !== normalFav) link.href = normalFav
}

const stopBlink = () => {
  document.title = siteConfig.value.title
  restoreDefaultFavicon()
}

const startBlink = () => {
  document.title = `(${unreadCount.value}) ${siteConfig.value.title}`
}

const checkHighlight = () => {
  const lastCode = sessionStorage.getItem(siteConfig.value.lastCodeKey)
  if (!lastCode) return
  lastViewedCode.value = lastCode
  nextTick(() => {
    const el = document.getElementById(`item_${lastCode}`)
    if (el) {
      el.classList.remove('flash-highlight')
      void el.offsetWidth
      el.classList.add('flash-highlight')
    }
    sessionStorage.removeItem(siteConfig.value.lastCodeKey)
  })
}

const fetchPage = async (p: number) => {
  try {
    const res: any = await $fetch(siteConfig.value.listApi, {
      query: { p, _t: Date.now() }
    })
    if (res?.error === 'AUTH') {
      needLogin.value = true
      return null
    }
    if (res?.error) {
      errorMessage.value = formatListError(res.message || res.error)
      return null
    }
    errorMessage.value = ''
    showingCachedList.value = false
    needLogin.value = false
    return res
  } catch (error: any) {
    if (error?.response?.status === 401 || error?.data?.error === 'AUTH') {
      needLogin.value = true
      return null
    }
    errorMessage.value = formatListError(error?.data?.message || error?.message || 'Unknown error')
    return null
  }
}

const formatListError = (message: string) => {
  if (siteConfig.value.key === 'linuxdo' && /Cloudflare challenge|returned 403|Cf-Mitigated/i.test(message || '')) {
    return showingCachedList.value
      ? 'linux.do 触发 Cloudflare 验证，当前显示本地缓存。'
      : 'linux.do 触发 Cloudflare 验证，当前服务端出口暂时无法读取列表。'
  }
  return message
}

const readCachedFirstList = () => {
  try {
    const cached = JSON.parse(localStorage.getItem(siteConfig.value.firstListKey) || '[]')
    return Array.isArray(cached) ? cached : []
  } catch {
    return []
  }
}

const loadList = async () => {
  if (!process.client) return

  scrollTop()
  loading.value = true
  errorMessage.value = ''
  currentPage.value = 0
  canLoadMore.value = false
  loaderText.value = '加载中...'

  const res = await fetchPage(0)
  if (res?.items) {
    items.value = res.items
    localStorage.setItem(siteConfig.value.firstListKey, JSON.stringify(res.items))
    loaderText.value = res.items.length ? '继续下滑加载更多' : '暂无内容'
    enableMoreTimer && clearTimeout(enableMoreTimer)
    enableMoreTimer = setTimeout(() => {
      canLoadMore.value = res.items.length > 0
    }, 600)
  } else if (!needLogin.value) {
    const cachedItems = items.value.length ? items.value : readCachedFirstList()
    if (cachedItems.length) {
      items.value = cachedItems
      showingCachedList.value = true
      if (siteConfig.value.key === 'linuxdo') {
        errorMessage.value = 'linux.do 触发 Cloudflare 验证，当前显示本地缓存。'
      }
      canLoadMore.value = false
      loaderText.value = '当前显示缓存'
    } else {
      items.value = []
      loaderText.value = ''
    }
  }

  loading.value = false
}

const loadMore = async () => {
  if (loading.value || !canLoadMore.value || isLoadingMore.value) return

  isLoadingMore.value = true
  const nextPage = currentPage.value + 1

  try {
    const res = await fetchPage(nextPage)
    if (!res?.items?.length) {
      canLoadMore.value = false
      loaderText.value = '没有更多内容了'
      return
    }

    const existingCodes = new Set(items.value.map((item) => item.code))
    const newItems = res.items.filter((item: any) => !existingCodes.has(item.code))

    if (!newItems.length) {
      canLoadMore.value = false
      loaderText.value = '没有更多内容了'
      return
    }

    currentPage.value = nextPage
    items.value.push(...newItems)
    loaderText.value = '继续下滑加载更多'
  } finally {
    isLoadingMore.value = false
  }
}

const openNotif = async () => {
  showNotif.value = true
  notifLoading.value = true
  unreadCount.value = 0
  stopBlink()

  try {
    const res: any = await $fetch(siteConfig.value.notifApi)
    notifs.value = res?.items || []
  } catch {
    notifs.value = []
  } finally {
    notifLoading.value = false
  }
}

const checkUnread_doing = ref(false)

const checkUnread = async () => {
  try {
    checkUnread_doing.value = true
    const res: any = await $fetch(siteConfig.value.notifCountApi)
    checkUnread_doing.value = false
    if (typeof res?.count === 'number' && res.count > unreadCount.value) {
      unreadCount.value = res.count
      startBlink()
    }
  } catch {
  }
}

const scrollTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const saveLastViewed = (item: any) => {
  saveListScroll()
  sessionStorage.setItem(siteConfig.value.lastCodeKey, item.code)
  recordHistory(item)
}

const goToHistoryItem = async (item: HistoryItem) => {
  saveListScroll()
  showHistory.value = false
  const targetConfig = siteMap[item.site]
  if (targetConfig) sessionStorage.setItem(targetConfig.lastCodeKey, item.code)
  await navigateTo(item.path)
}

const goToTopic = async (notif: any) => {
  saveListScroll()
  showNotif.value = false
  const encodedId = typeof notif === 'string' ? notif : notif?.encodedId
  if (!encodedId) return
  const floor = typeof notif === 'string' ? '' : String(notif?.floor || '')
  const replyId = typeof notif === 'string' ? '' : String(notif?.replyId || '')
  const replyPage = typeof notif === 'string' ? '' : String(notif?.replyPage || '')
  const query: Record<string, string> = {}
  if (floor) query.floor = floor
  if (replyId) query.reply = replyId
  if (replyPage) query.page = replyPage
  await navigateTo({
    path: topicLink(encodedId),
    query: Object.keys(query).length ? query : undefined
  })
}

const syncSiteState = async () => {
  if (!process.client) return

  needLogin.value = false
  showNotif.value = false
  showHistory.value = false
  unreadCount.value = 0
  notifs.value = []
  historyItems.value = []
  notifLoading.value = false
  errorMessage.value = ''
  stopBlink()

  try {
    items.value = readCachedFirstList()
  } catch {
    items.value = []
  }
  showingCachedList.value = false

  lastViewedCode.value = null

  try {
    const env: any = await $fetch('/api/env')
    notificationsEnabled.value = Boolean(env?.[siteConfig.value.hasCookieKey])
    void checkUnread()
  } catch {
    notificationsEnabled.value = false
  }

  await loadList()
  checkHighlight()
}

watch(activeSite, async () => {
  await syncSiteState()
})

onMounted(async () => {
  await syncSiteState()
  await restoreListScroll()

  pageShowHandler = (event: PageTransitionEvent) => {
    if (event.persisted) checkHighlight()
  }

  window.addEventListener('pageshow', pageShowHandler)

  observer = new IntersectionObserver((entries) => {
    if (entries[0]?.isIntersecting) {
      void loadMore()
    }
  }, { rootMargin: '200px' })

  if (loaderEl.value) observer.observe(loaderEl.value)

  unreadTimer = setInterval(() => {
    if (notificationsEnabled.value || !checkUnread_doing.value) {
      void checkUnread()
    }
  }, 10000)
})

onActivated(() => {
  if (!process.client) return
  stopBlink()
  void restoreListScroll()
  checkHighlight()
})

onDeactivated(() => {
  saveListScroll()
})

onBeforeUnmount(() => {
  if (pageShowHandler) {
    window.removeEventListener('pageshow', pageShowHandler)
    pageShowHandler = null
  }

  observer?.disconnect()
  observer = null

  if (unreadTimer) clearInterval(unreadTimer)
  if (enableMoreTimer) clearTimeout(enableMoreTimer)

  unLockScroll('notif')
  unLockScroll('history')
  stopBlink()
})

useHead(() => ({
  title: siteConfig.value.title
}))
</script>

<style scoped>
.page-container {
  --bg: #fff;
  --text: #1d2129;
  --meta: #86909c;
  --border: #f2f3f5;
  --fab-bg: rgba(245, 245, 247, 0.72);
  --input-bg: #f9fafb;
  --toolbar-bg: rgba(255, 255, 255, 0.82);
}

@media (prefers-color-scheme: dark) {
  .page-container {
    --bg: #1a1a1c;
    --text: #e1e1e1;
    --meta: #8f96a3;
    --border: #2d2d2e;
    --fab-bg: rgba(45, 45, 46, 0.72);
    --input-bg: #252526;
    --toolbar-bg: rgba(26, 26, 28, 0.82);
  }
}

:global(body.lock-scroll) {
  overflow: hidden !important;
  padding-right: var(--scrollbar-width, 0px);
}

#mainContent {
  width: 650px;
  max-width: 100%;
  margin: 0 auto;
  padding: 20px;
}

.toolbar {
  margin: -4px -20px 16px;
  padding: 10px 20px 12px;
  background: var(--toolbar-bg);
  border-bottom: 1px solid var(--border);
  backdrop-filter: blur(10px);
}

.site-switcher {
  display: inline-flex;
  gap: 18px;
  align-items: center;
}

.site-tab {
  padding: 4px 0 8px;
  border: none;
  border-bottom: 1.5px solid transparent;
  background: transparent;
  color: var(--meta);
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: color 0.2s ease, border-color 0.2s ease;
}

.site-tab.active {
  color: var(--text);
  border-bottom-color: rgba(29, 33, 41, 0.35);
}

.error-panel {
  margin: 12px 0 20px;
  padding: 14px 16px;
  border: 1px solid #ffd7d7;
  border-radius: 12px;
  background: #fff6f6;
  color: #7a1f1f;
}

.error-title {
  font-weight: 700;
  margin-bottom: 6px;
}

.error-body {
  line-height: 1.6;
  font-size: 0.92rem;
  word-break: break-word;
}

#list {
  min-height: 200px;
}

.item {
  padding: 20px 0;
  border-bottom: 1px solid var(--border);
}

.item > a {
  color: inherit;
  text-decoration: none;
  font-size: 1.05rem;
}

.meta {
  margin-top: 6px;
  color: var(--meta);
  font-size: 0.82rem;
}

.loader-text {
  padding: 16px 0 28px;
  text-align: center;
  color: var(--meta);
  font-size: 0.92rem;
}

.fab-group {
  position: fixed;
  top: 50%;
  left: calc(50% + 340px);
  display: flex;
  flex-direction: column;
  gap: 12px;
  transform: translateY(-50%);
  z-index: 100;
}

:global(body.lock-scroll) .fab-group {
  margin-right: var(--scrollbar-width, 0px);
}

@media (max-width: 850px) {
  .toolbar {
    margin-left: -20px;
    margin-right: -20px;
  }

  .fab-group {
    display: none;
  }
}

.fab {
  position: relative;
  width: 48px;
  height: 48px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  background: var(--fab-bg);
  color: var(--text);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  backdrop-filter: blur(10px);
}

.badge {
  position: absolute;
  top: -6px;
  right: -6px;
  min-width: 18px;
  padding: 4px 2px;
  line-height: 1;
  border-radius: 999px;
  background: #ff2c55;
  color: #fff;
  font-size: 10px;
  border: 2px solid var(--bg);
}

.list-skeleton {
  padding-top: 12px;
}

.skeleton-line {
  height: 14px;
  margin: 10px 0;
  border-radius: 8px;
  background: linear-gradient(90deg, rgba(0, 0, 0, 0.05) 25%, rgba(0, 0, 0, 0.12) 37%, rgba(0, 0, 0, 0.05) 63%);
  background-size: 400% 100%;
  animation: skeleton 1.4s ease infinite;
}

.w-50 { width: 50%; }
.w-60 { width: 60%; }
.w-70 { width: 70%; }
.w-80 { width: 80%; }
.w-90 { width: 90%; }

.flash-highlight {
  animation: highlight-fade 3s forwards;
}

@keyframes highlight-fade {
  0% { background: rgba(255, 235, 59, 0.3); }
  100% { background: transparent; }
}

@keyframes skeleton {
  0% { background-position: 100% 0; }
  100% { background-position: 0 0; }
}

#notifOverlay {
  position: fixed;
  inset: 0;
  opacity: 0;
  pointer-events: none;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(2px);
  transition: opacity 0.3s;
  z-index: 1999;
}

#notifOverlay.open {
  opacity: 1;
  pointer-events: auto;
}

#historyOverlay {
  position: fixed;
  inset: 0;
  opacity: 0;
  pointer-events: none;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(2px);
  transition: opacity 0.3s;
  z-index: 1999;
}

#historyOverlay.open {
  opacity: 1;
  pointer-events: auto;
}

#notifModal {
  position: fixed;
  top: 0;
  right: -100%;
  width: 100%;
  max-width: 420px;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--bg);
  border-left: 1px solid var(--border);
  box-shadow: -10px 0 30px rgba(0, 0, 0, 0.05);
  transition: right 0.35s ease;
  z-index: 2000;
}

#notifModal.open {
  right: 0;
}

#historyModal {
  position: fixed;
  top: 0;
  right: -100%;
  width: 100%;
  max-width: 420px;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--bg);
  border-left: 1px solid var(--border);
  box-shadow: -10px 0 30px rgba(0, 0, 0, 0.05);
  transition: right 0.35s ease;
  z-index: 2000;
}

#historyModal.open {
  right: 0;
}

.notif-header {
  padding: 16px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--border);
}

.history-header {
  padding: 16px 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  border-bottom: 1px solid var(--border);
}

.history-header h3 {
  flex: 1;
  margin: 0;
}

.history-clear-btn {
  border: none;
  background: transparent;
  color: var(--meta);
  cursor: pointer;
  font-size: 0.86rem;
}

.history-clear-btn:hover {
  color: var(--text);
}

.notif-state {
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--meta);
}

.history-state {
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--meta);
}

.notif-list {
  flex: 1;
  overflow-y: auto;
}

.history-list {
  flex: 1;
  overflow-y: auto;
}

.notif-item {
  display: flex;
  gap: 12px;
  padding: 16px 20px;
  border-bottom: 1px solid var(--border);
  cursor: pointer;
}

.history-item {
  display: flex;
  gap: 12px;
  padding: 16px 20px;
  border-bottom: 1px solid var(--border);
  cursor: pointer;
}

.notif-item:hover {
  background: var(--input-bg);
}

.history-item:hover {
  background: var(--input-bg);
}

.notif-body {
  flex: 1;
  min-width: 0;
}

.history-body {
  flex: 1;
  min-width: 0;
}

.notif-title {
  line-height: 1.5;
  font-size: 0.95rem;
  font-weight: 500;
}

.history-title {
  line-height: 1.5;
  font-size: 0.95rem;
  font-weight: 500;
}

.notif-meta {
  margin-top: 4px;
  color: var(--meta);
  font-size: 0.8rem;
}

.history-meta {
  margin-top: 4px;
  color: var(--meta);
  font-size: 0.8rem;
}

.notif-payload {
  margin-top: 10px;
  padding: 10px 14px;
  border-left: 3px solid var(--border);
  border-radius: 6px;
  background: var(--input-bg);
  font-size: 0.88rem;
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.notif-payload :deep(img) {
  max-width: 100%;
  max-height: 100px;
  object-fit: contain;
}

.notif-arrow {
  display: flex;
  align-items: center;
  color: var(--meta);
}

.history-arrow {
  display: flex;
  align-items: center;
  color: var(--meta);
}

.close-btn {
  border: none;
  background: none;
  color: var(--meta);
  font-size: 28px;
  cursor: pointer;
}
</style>
