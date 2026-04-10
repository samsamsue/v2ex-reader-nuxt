<template>
  <div class="page-container">
    <LoginBox v-if="needLogin" :from="fromPath" />
    <template v-else>
      <div id="mainContent" >
        <div class="fab-group">
          <div class="fab" @click="openNotif" style="position:relative;" title="消息提醒">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2.992 16.342a2 2 0 0 1 .094 1.167l-1.065 3.29a1 1 0 0 0 1.236 1.168l3.413-.998a2 2 0 0 1 1.099.092 10 10 0 1 0-4.777-4.719"/><path d="M8 12h.01"/><path d="M12 12h.01"/><path d="M16 12h.01"/></svg>
            <div v-if="unreadCount > 0" class="badge">{{ unreadCount > 99 ? '99+' : unreadCount }}</div>
          </div>
          <div class="fab" @click="scrollTop"><svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m18 15-6-6-6 6"/></svg></div>
          <div class="fab" :class="{'loading-rotate': loading}" @click="loadList"><svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 16h5v5"/></svg></div>
        </div>

        <div id="list">
          <div v-if="loading && !items.length" class="list-skeleton">
            <div v-for="i in 5" :key="i" :class="['skeleton-line', `w-${40 + i*10}`]"></div>
          </div>
          
          <div v-for="item in items" :key="item.code" class="item" :id="`item_${item.code}`" :class="{ 'flash-highlight': lastViewedCode === item.code }">
            <NuxtLink :to="`/t/${item.code}`" @click="saveLastViewed(item.code)">{{ item.title }}</NuxtLink>
            <div class="meta">@{{ item.author }} • {{ item.time }} • {{ item.replies }}回复</div>
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
          <h3>最新提醒</h3>
          <button class="close-btn" @click="showNotif = false" aria-label="关闭">&times;</button>
        </div>
        
        <div v-if="notifLoading && !notifs.length" class="notif-state">
          <p>正在获取消息...</p>
        </div>
        
        <div v-else-if="notifs.length === 0" class="notif-state">
          <p>暂无新消息</p>
        </div>

        <div v-else class="notif-list">
          <div v-for="n in notifs" :key="n.id" class="notif-item" @click="goToTopic(n.encodedId)">
            <div class="notif-body">
              <div class="notif-title">{{ n.desc }}</div>
              <div class="notif-meta">
                <span class="time">{{ n.time }}</span>
              </div>
              <div v-if="n.payload" class="notif-payload" v-html="n.payload"></div>
            </div>
            <div class="notif-arrow">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m9 18 6-6-6-6"/></svg>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { lockScroll, unLockScroll } from '../utils/common'

/** 1. 基础状态 */
const route = useRoute()
const needLogin = ref(false)
const items = ref<any[]>([])
const loading = ref(false)


/** 3. 消息提醒逻辑 */
const showNotif = ref(false)
const unreadCount = ref(0)
const notifs = ref<any[]>([])
const notifLoading = ref(false)

// 监听抽屉状态：锁定滚动条并处理防抖宽度
watch(showNotif, (val) => {
  if (process.client) {
    val ? lockScroll('notif') : unLockScroll('notif')
  }
});

const openNotif = async () => {
  showNotif.value = true
  notifLoading.value = true
  unreadCount.value = 0
  stopBlink()
  try {
    const res: any = await $fetch('/api/notif')
    notifs.value = res?.items || []
  } catch (e) {
    console.error('Failed to fetch notifications')
  } finally {
    notifLoading.value = false
  }
}

/** 4. 数据加载与高亮逻辑 */
const currentPage = ref(parseInt(String(route.query.p || 0)))
const canLoadMore = ref(false)
const isLoadingMore = ref(false) // 新增：用于防止接口并发请求
const loaderEl = ref<HTMLElement | null>(null)
const loaderText = ref('加载中...')
const lastViewedCode = ref<string | null>(null)

const checkHighlight = () => {
  const lastCode = sessionStorage.getItem('v2_last_code')
  if (lastCode) {
    lastViewedCode.value = lastCode
    nextTick(() => {
      const el = document.getElementById('item_' + lastCode)
      if (el) {
        el.classList.remove('flash-highlight')
        // void el.offsetWidth // 触发重绘
        el.classList.add('flash-highlight')
        sessionStorage.removeItem('v2_last_code')
      }
    });
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
  } catch (error: any){
    if (error.response?.status === 401 || error.data?.error === 'AUTH') {
      needLogin.value = true
    } 
    return null 
  }
}

// 优化后的加载更多逻辑（加入请求锁与数据去重）
const loadMore = async () => {
  // 如果不能加载，或者正在加载中，直接返回避免并发
  if (!canLoadMore.value || isLoadingMore.value) return
  
  isLoadingMore.value = true // 上锁
  currentPage.value++
  
  try {
    const res = await fetchPage(currentPage.value)
    
    if (res?.items?.length) {
      // 提取当前已有的所有 code 作为一个 Set，提高查找效率
      const existingCodes = new Set(items.value.map(item => item.code))
      
      // 过滤掉已经在列表中的重复项
      const newItems = res.items.filter((item: any) => !existingCodes.has(item.code))
      
      // 追加去重后的新数据
      items.value.push(...newItems)
    } else {
      loaderText.value = '到底了'
      canLoadMore.value = false
    }
  } catch (error) {
    console.error('加载更多失败:', error)
    // 请求失败时页码退回，允许下次重试
    currentPage.value--
  } finally {
    isLoadingMore.value = false // 解锁
  }
}

/** 5. 工具函数 */
const fromPath = computed(() => route.fullPath || '/all')
const scrollTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })
const saveLastViewed = (code: string) => sessionStorage.setItem('v2_last_code', code)
const goToTopic = (id: string) => {
  showNotif.value = false
  navigateTo(`/t/${id}`)
}

/** 6. 辅助逻辑 */
let favInterval: any = null
const startBlink = () => {
  if (favInterval) return
  favInterval = setInterval(() => {}, 800)
}
const stopBlink = () => {
  clearInterval(favInterval); favInterval = null
}

const checkUnread = async () => {
  try {
    const res: any = await $fetch('/api/notif/count')
    if (res.count > unreadCount.value) {
      unreadCount.value = res.count
      startBlink()
    }
  } catch {}
}

const loadList = async ()=> {
  scrollTo({ top: 0, behavior: 'smooth' })
  loading.value = true
  currentPage.value = 0
  const initial = await fetchPage(currentPage.value)
  if (initial?.items) {
    items.value = initial.items
    localStorage.setItem('v2_first_list', JSON.stringify(initial.items))
  }
  loading.value = false
}

/** 7. 生命周期与后退监听 */
onMounted(async () => {
  items.value = JSON.parse(localStorage.getItem('v2_first_list') || '[]')
  
  loadList()
  
  checkHighlight()

  // 监听浏览器后退时的 bfcache
  window.addEventListener('pageshow', (e) => {
    if (e.persisted) checkHighlight()
  })

  // 这里的 observer 不需要修改，loadMore 内部已经做了锁定保护
  const observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting && canLoadMore.value) loadMore()
  }, { rootMargin: '200px' })
  if (loaderEl.value) observer.observe(loaderEl.value)

  setTimeout(() => { canLoadMore.value = true }, 1500)
  setInterval(checkUnread, 60000)
})

// 处理 Nuxt 路由后退时的激活
onActivated(() => {
  checkHighlight()
})

useHead({ title: 'V2EX Reader' })
</script>

<style scoped>
.page-container {
  --bg:#fff; --text:#1d2129; --author:#999; --meta:#86909c; --border:#f2f3f5; 
  --fab-bg:rgba(245,245,247,0.7); --input-bg:#f9fafb;
}
@media (prefers-color-scheme:dark) {
  .page-container { --bg:#1a1a1c; --text:#e1e1e1; --border:#2d2d2e; --fab-bg:rgba(45,45,46,0.7); --input-bg:#252526; }
}

/* 锁定滚动条：使用 padding 防止抖动 */
:global(body.lock-scroll) {
  overflow: hidden !important;
  padding-right: var(--scrollbar-width, 0px);
}

.loader-text{
  text-align: center;
  padding-top:1rem;
}

#mainContent { width: 650px; max-width:100%; margin: 0 auto; padding: 20px; }
.item { padding:20px 0; border-bottom:1px solid var(--border); transition: background 0.3s; }
.item > a { text-decoration: none; color:inherit; font-size: 1.05rem; }
.meta { color:var(--meta); font-size:0.8rem; margin-top: 6px; }

.fab-group { position:fixed; top:50%; transform: translateY(-50%) ; left:calc(50% + 340px); display:flex; flex-direction:column; gap:12px; z-index:100; transition: margin-right 0.3s; }
:global(body.lock-scroll) .fab-group { margin-right: var(--scrollbar-width, 0px); }
@media (max-width: 850px) { .fab-group { display:none; } }

.fab { width:48px; height:48px; background:var(--fab-bg); border-radius:50%; display:flex; align-items:center; justify-content:center; cursor:pointer; backdrop-filter:blur(10px); border:1px solid rgba(255,255,255,0.1); }

/* Code Mode Styles */
#codeMode { position:fixed; top:0; left:0; width:100%; height:100vh; background:#1e1e1e; color:#d4d4d4; font-family:monospace; padding:20px; overflow-y:auto; z-index:9999; }
.code-header { color:#6a9955; margin-bottom:15px; border-bottom:1px solid #333; }
.code-ln { color:#858585; margin-right:15px; width:25px; display:inline-block; text-align:right; }
.code-k { color:#569cd6; } .code-v { color:#9cdcfe; } .code-s { color:#ce9178; } .code-c { color:#6a9955; }

/* Transitions & Highlight */
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.flash-highlight { animation: highlight-fade 3s forwards; }
@keyframes highlight-fade { 
  0% { background: rgba(255, 235, 59, 0.3); }
  100% { background: transparent; } 
}

/* Notif Drawer */
#notifModal {
  position: fixed;
  top: 0;
  right: -100%;
  width: 100%;
  max-width: 420px;
  height: 100vh;
  background: var(--bg);
  z-index: 2000;
  transition: right 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
  border-left: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  box-shadow: -10px 0 30px rgba(0, 0, 0, 0.05);
}

#notifModal.open {
  right: 0;
}

#notifOverlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s;
  z-index: 1999;
  backdrop-filter: blur(2px);
}

#notifOverlay.open {
  opacity: 1;
  pointer-events: auto;
}

.notif-header {
  padding: 16px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--border);
}

.notif-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: var(--meta);
}

.notif-item {
  display: flex;
  align-items: flex-start;
  padding: 16px 20px;
  gap: 12px;
  border-bottom: 1px solid var(--border);
  cursor: pointer;
}

.notif-item:hover {
  background: var(--input-bg);
}

.notif-body {
  flex: 1;
  min-width: 0;
}

.notif-title {
  font-size: 0.95rem;
  font-weight: 500;
  line-height: 1.5;
  margin-bottom: 4px;
}

.notif-payload {
  margin-top: 10px;
  padding: 10px 14px;
  background: var(--input-bg);
  border-radius: 6px;
  font-size: 0.88rem;
  border-left: 3px solid var(--border);
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.notif-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.8rem;
  color: var(--meta);
}

.badge {
  position: absolute;
  top: -2px;
  right: -2px;
  background: #ff2c55;
  color: white;
  font-size: 10px;
  padding: 2px 5px;
  border-radius: 10px;
  border: 2px solid var(--bg);
}

.close-btn {
  background: none;
  border: none;
  font-size: 28px;
  color: var(--meta);
  cursor: pointer;
}

.notif-list {
  flex: 1;
  min-width: 0;
  overflow-y: auto;
}

.notif-payload :deep(img) {
  max-width: 100%;
  max-height: 100px;
  object-fit: contain;
}
</style>