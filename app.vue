<script setup lang="ts">
import { lockScroll, unLockScroll } from './utils/common'

const codeBoxVisible = ref(false)
const route = useRoute()
const quickNavVisible = ref(false)
const quickNavX = ref(0)
const quickNavY = ref(0)
const quickNavPressStartX = ref(0)
const quickNavPressStartY = ref(0)
const quickNavPressing = ref(false)
const quickNavSelectLocked = ref(false)
type QuickNavAction = {
  id: string
  title: string
  icon: 'back' | 'top' | 'refresh' | 'qr' | 'open' | 'history' | 'follow' | 'notif'
  builtin?: boolean
}
const quickNavExternalActions = ref<QuickNavAction[]>([])
const quickNavActiveAction = ref('')
let quickNavPressTimer: ReturnType<typeof window.setTimeout> | null = null
let quickNavIgnoreClickUntil = 0

const quickNavDisabled = computed(() => /^\/s(?:\/|$)/.test(route.path))
const quickNavIsListPage = computed(() => route.path === '/v2ex' || route.path === '/linuxdo')
const quickNavPrimaryActionId = computed(() => quickNavIsListPage.value ? 'list-refresh' : 'back')
const quickNavItems = computed<QuickNavAction[]>(() => {
  const actions: QuickNavAction[] = [
  { id: 'top', title: '回到顶部', icon: 'top', builtin: true },
  { id: 'back', title: '后退', icon: 'back', builtin: true },
    ...quickNavExternalActions.value
  ]
  if (!quickNavIsListPage.value) return actions

  return [
    actions[0],
    ...quickNavExternalActions.value.filter(item => item.id === 'list-refresh'),
    ...quickNavExternalActions.value.filter(item => item.id !== 'list-refresh')
  ]
})

const isQuickNavInteractiveTarget = (target: HTMLElement | null) => {
  return Boolean(target?.closest([
    'a',
    'button',
    'input',
    'textarea',
    'select',
    '[contenteditable="true"]',
    '.fab-group',
    '.quick-nav-popover',
    '.reply-compose',
    '#newMsgNotify',
    '#historyPrompt',
    '[data-code-copy]',
    '[data-floor-jump]'
  ].join(',')))
}

const getQuickNavLayout = () => {
  const buttonSize = 38
  const gap = 8
  const padding = 10
  const columns = 3
  const items = quickNavItems.value
  const rows = Math.max(1, Math.ceil(items.length / columns))
  const width = padding * 2 + columns * buttonSize + (columns - 1) * gap
  const height = padding * 2 + rows * buttonSize + (rows - 1) * gap
  const primaryIndex = Math.max(0, items.findIndex(item => item.id === quickNavPrimaryActionId.value))
  const primaryColumn = primaryIndex % columns
  const primaryRow = Math.floor(primaryIndex / columns)
  const primaryCenterX = padding + primaryColumn * (buttonSize + gap) + buttonSize / 2
  const primaryCenterY = padding + primaryRow * (buttonSize + gap) + buttonSize / 2

  return {
    width,
    height,
    primaryOffsetX: primaryCenterX - width / 2,
    primaryOffsetY: primaryCenterY - height / 2
  }
}

const placeQuickNav = (x: number, y: number) => {
  const layout = getQuickNavLayout()
  const margin = 12
  const minX = layout.width / 2 + margin
  const maxX = window.innerWidth - layout.width / 2 - margin
  const minY = layout.height / 2 + margin
  const maxY = window.innerHeight - layout.height / 2 - margin
  quickNavX.value = Math.min(Math.max(x - layout.primaryOffsetX, minX), maxX)
  quickNavY.value = Math.min(Math.max(y - layout.primaryOffsetY, minY), maxY)
  quickNavActiveAction.value = quickNavPrimaryActionId.value
  quickNavVisible.value = true
  quickNavSelectLocked.value = true
  quickNavIgnoreClickUntil = Date.now() + 650
  window.getSelection()?.removeAllRanges()
}

const cancelQuickNavPress = () => {
  if (quickNavPressTimer) {
    window.clearTimeout(quickNavPressTimer)
    quickNavPressTimer = null
  }
  quickNavPressing.value = false
  if (!quickNavVisible.value) quickNavSelectLocked.value = false
}

const closeQuickNav = () => {
  cancelQuickNavPress()
  quickNavVisible.value = false
  quickNavSelectLocked.value = false
  quickNavActiveAction.value = ''
}

const handleQuickNavPressStart = (event: PointerEvent) => {
  if (quickNavDisabled.value || event.button !== 0) {
    cancelQuickNavPress()
    return
  }
  if (isQuickNavInteractiveTarget(event.target as HTMLElement | null)) {
    cancelQuickNavPress()
    return
  }

  cancelQuickNavPress()
  quickNavPressing.value = true
  quickNavPressStartX.value = event.clientX
  quickNavPressStartY.value = event.clientY
  quickNavPressTimer = window.setTimeout(() => {
    placeQuickNav(event.clientX, event.clientY)
    quickNavPressTimer = null
  }, 360)
}

const handleQuickNavPressMove = (event: PointerEvent) => {
  if (quickNavVisible.value) {
    const target = document.elementFromPoint(event.clientX, event.clientY) as HTMLElement | null
    quickNavActiveAction.value = target?.closest<HTMLElement>('[data-quick-nav-action]')?.dataset.quickNavAction || ''
    return
  }
  if (!quickNavPressTimer) return
  const dx = Math.abs(event.clientX - quickNavPressStartX.value)
  const dy = Math.abs(event.clientY - quickNavPressStartY.value)
  if (dx > 8 || dy > 8) cancelQuickNavPress()
}

const goQuickNavBack = () => {
  closeQuickNav()
  const state = window.history.state as { back?: string | null; position?: number } | null
  if (typeof state?.back === 'string' && state.back.startsWith('/')) {
    history.back()
    return
  }
  if (typeof state?.position === 'number' && state.position > 0) {
    history.back()
    return
  }
  if (route.path === '/v2ex' || route.path === '/linuxdo') {
    navigateTo('/')
    return
  }
  navigateTo(route.path.startsWith('/linuxdo') ? '/linuxdo' : '/v2ex')
}

const goQuickNavTop = () => {
  closeQuickNav()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const runQuickNavAction = (action: string) => {
  quickNavActiveAction.value = action
  if (action === 'back') {
    goQuickNavBack()
    return
  }
  if (action === 'top') {
    goQuickNavTop()
    return
  }
  closeQuickNav()
  window.dispatchEvent(new CustomEvent('quick-nav-action', { detail: { action } }))
}

const handleQuickNavPressEnd = (event: PointerEvent) => {
  cancelQuickNavPress()
  if (!quickNavVisible.value) return

  const target = document.elementFromPoint(event.clientX, event.clientY) as HTMLElement | null
  const action = target?.closest<HTMLElement>('[data-quick-nav-action]')?.dataset.quickNavAction
  quickNavActiveAction.value = action || ''
  if (!action) return

  event.preventDefault()
  quickNavIgnoreClickUntil = Date.now() + 650
  runQuickNavAction(action)
}

const handleQuickNavContextMenu = (event: MouseEvent) => {
  if (quickNavDisabled.value) return
  if (isQuickNavInteractiveTarget(event.target as HTMLElement | null)) return
  event.preventDefault()
  cancelQuickNavPress()
  placeQuickNav(event.clientX, event.clientY)
}

const handleQuickNavClick = (event: MouseEvent) => {
  if (!quickNavVisible.value) return
  if (Date.now() < quickNavIgnoreClickUntil) {
    event.preventDefault()
    return
  }
  closeQuickNav()
}

const handleQuickNavScroll = () => {
  if (quickNavVisible.value) closeQuickNav()
  else cancelQuickNavPress()
}

const handleQuickNavActions = (event: Event) => {
  const customEvent = event as CustomEvent<QuickNavAction[]>
  setQuickNavActions(customEvent.detail)
}

const setQuickNavActions = (actions: QuickNavAction[] = []) => {
  quickNavExternalActions.value = Array.isArray(actions) ? actions : []
}

const getQuickNavButtonStyleVars = (index: number, total: number) => ({
  '--quick-nav-i': String(index)
})

const toggleCodeBox = () => {
  codeBoxVisible.value = !codeBoxVisible.value
  if (codeBoxVisible.value) lockScroll('codeBox')
  else unLockScroll('codeBox')
}

onMounted(() => {
  window.addEventListener('dblclick', toggleCodeBox)
  window.addEventListener('pointerdown', handleQuickNavPressStart, true)
  window.addEventListener('pointermove', handleQuickNavPressMove, true)
  window.addEventListener('pointerup', handleQuickNavPressEnd, true)
  window.addEventListener('pointercancel', cancelQuickNavPress, true)
  window.addEventListener('contextmenu', handleQuickNavContextMenu, true)
  window.addEventListener('click', handleQuickNavClick, true)
  window.addEventListener('scroll', handleQuickNavScroll, true)
  window.addEventListener('quick-nav-actions', handleQuickNavActions as EventListener)
  ;(window as any).__setQuickNavActions = setQuickNavActions
})

onUnmounted(() => {
  window.removeEventListener('dblclick', toggleCodeBox)
  window.removeEventListener('pointerdown', handleQuickNavPressStart, true)
  window.removeEventListener('pointermove', handleQuickNavPressMove, true)
  window.removeEventListener('pointerup', handleQuickNavPressEnd, true)
  window.removeEventListener('pointercancel', cancelQuickNavPress, true)
  window.removeEventListener('contextmenu', handleQuickNavContextMenu, true)
  window.removeEventListener('click', handleQuickNavClick, true)
  window.removeEventListener('scroll', handleQuickNavScroll, true)
  window.removeEventListener('quick-nav-actions', handleQuickNavActions as EventListener)
  delete (window as any).__setQuickNavActions
  closeQuickNav()
})

watch(() => route.path, () => {
  quickNavExternalActions.value = []
  if (quickNavDisabled.value) closeQuickNav()
})
</script>

<template>
  <div :class="{ 'quick-nav-select-locked': quickNavSelectLocked }">
    <CodeBox v-if="codeBoxVisible" />
    <div v-if="codeBoxVisible">xxx</div>
    <div
      v-if="quickNavVisible && !quickNavDisabled"
      class="quick-nav-popover"
      :style="{ left: `${quickNavX}px`, top: `${quickNavY}px` }"
      @pointerdown.stop
      @pointerup.stop="handleQuickNavPressEnd"
      @click.stop
    >
      <button
        v-for="(item, index) in quickNavItems"
        :key="item.id"
        type="button"
        :class="['quick-nav-btn', { active: quickNavActiveAction === item.id }]"
        :style="getQuickNavButtonStyleVars(index, quickNavItems.length)"
        :data-quick-nav-action="item.id"
        :title="item.title"
        @click="runQuickNavAction(item.id)"
      >
        <svg v-if="item.icon === 'back'" xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        <svg v-else-if="item.icon === 'top'" xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m18 15-6-6-6 6"/></svg>
        <svg v-else-if="item.icon === 'refresh'" xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 16h5v5"/></svg>
        <svg v-else-if="item.icon === 'qr'" xmlns="http://www.w3.org/2000/svg" width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect width="5" height="5" x="3" y="3" rx="1"/><rect width="5" height="5" x="16" y="3" rx="1"/><rect width="5" height="5" x="3" y="16" rx="1"/><path d="M21 16h-3a2 2 0 0 0-2 2v3"/><path d="M12 7v3a2 2 0 0 1-2 2H7"/><path d="M12 21v-1"/></svg>
        <svg v-else-if="item.icon === 'open'" xmlns="http://www.w3.org/2000/svg" width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m10 16 4-4-4-4"/><path d="M3 12h11"/><path d="M3 8V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-3"/></svg>
        <svg v-else-if="item.icon === 'history'" xmlns="http://www.w3.org/2000/svg" width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l3 2"/></svg>
        <svg v-else-if="item.icon === 'follow'" xmlns="http://www.w3.org/2000/svg" width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
        <svg v-else-if="item.icon === 'notif'" xmlns="http://www.w3.org/2000/svg" width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M2.992 16.342a2 2 0 0 1 .094 1.167l-1.065 3.29a1 1 0 0 0 1.236 1.168l3.413-.998a2 2 0 0 1 1.099.092 10 10 0 1 0-4.777-4.719"/><path d="M8 12h.01"/><path d="M12 12h.01"/><path d="M16 12h.01"/></svg>
      </button>
    </div>
    <NuxtPage keepalive />
  </div>
</template>

<style>
/* 在全局或非 scoped 样式中 */
.lock-scroll {
  overflow: hidden !important;
  padding-right: var(--scrollbar-width, 0px);
}

@keyframes loading-rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.loading-rotate {
  animation: loading-rotate 1s linear infinite;
}

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

@media (prefers-color-scheme: dark) {
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

.quick-nav-select-locked,
.quick-nav-select-locked * {
  user-select: none;
  -webkit-user-select: none;
}

.quick-nav-popover {
  position: fixed;
  z-index: 2500;
  display: grid;
  grid-template-columns: repeat(3, 38px);
  grid-auto-rows: 38px;
  gap: 8px;
  padding: 10px;
  border: 1px solid rgba(128, 128, 128, 0.14);
  border-radius: 22px;
  background: color-mix(in srgb, var(--bg) 86%, transparent);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.38), 0 18px 38px rgba(0, 0, 0, 0.18);
  backdrop-filter: blur(18px) saturate(1.18);
  -webkit-backdrop-filter: blur(18px) saturate(1.18);
  transform: translate(-50%, -50%);
  animation: quick-nav-in 0.14s cubic-bezier(0.2, 0.9, 0.2, 1.1);
  pointer-events: auto;
}

.quick-nav-popover::before {
  content: none;
}

.quick-nav-btn {
  width: 38px;
  height: 38px;
  border: 0;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: color-mix(in srgb, var(--text) 7%, transparent);
  color: var(--text);
  box-shadow: none;
  cursor: pointer;
  transform: translateY(0) scale(1);
  transition: transform 0.12s ease, background 0.12s ease, color 0.12s ease, box-shadow 0.12s ease;
  animation: quick-nav-btn-in 0.16s cubic-bezier(0.2, 0.9, 0.24, 1.18) both;
  animation-delay: calc(var(--quick-nav-i) * 10ms);
}

.quick-nav-btn svg {
  width: 18px;
  height: 18px;
}

.quick-nav-btn:hover,
.quick-nav-btn.active {
  transform: translateY(-1px) scale(1.08);
  background: #111;
  color: #fff;
  box-shadow: 0 8px 18px rgba(0, 0, 0, 0.22);
}

.quick-nav-btn:active {
  transform: scale(0.94);
}

@keyframes quick-nav-in {
  from {
    opacity: 0;
    transform: translate(-50%, -44%) scale(0.92);
  }
  to {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
}

@keyframes quick-nav-btn-in {
  from {
    opacity: 0;
    transform: translateY(5px) scale(0.86);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
</style>
