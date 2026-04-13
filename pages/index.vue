<template>
  <div>
    <LoginBox v-if="needLogin" :from="fromPath" title="V2EX Reader" />
    <template v-else>
      <div id="jumpPrompt" :class="{ show: showPrompt }">
        <span>检测到链接</span>
        <button id="jumpBtn" @click="handleAutoJump">立即跳转</button>
      </div>

      <div id="mainContent" class="box">
        <h2>V2EX Reader</h2>
        <div style="display:flex; gap:10px; margin-bottom:20px; margin-top:10px;">
          <input
            ref="inputRef"
            v-model="inputUrl"
            type="text"
            placeholder="粘贴链接或直接输入数字ID"
            style="flex:1; margin:0;"
            @keypress.enter="manualJump"
          >
          <button
            style="padding:0 24px; border:none; border-radius:12px; background:#1d2129; color:#fff; font-weight:600; cursor:pointer; white-space:nowrap; transition:transform 0.1s;"
            @click="manualJump"
          >
            跳转
          </button>
        </div>
        <button
          style="width:100%;padding:14px;border:none;border-radius:12px;background:var(--border);color:var(--text);font-weight:600;cursor:pointer;"
          @click="goToAll"
        >
          查看全部列表
        </button>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'

const SALT = 987654
const route = useRoute()
const config = useRuntimeConfig()
const token = useCookie('linuxdo_reader_auth')

const inputUrl = ref('')
const showPrompt = ref(false)
const autoJumpTarget = ref('')
const inputRef = ref<HTMLInputElement | null>(null)
const fromPath = computed(() => route.fullPath || '/')
const needLogin = computed(() => Boolean(config.public.hasPassword) && !token.value)

const handleWindowFocus = async () => {
  try {
    const text = await navigator.clipboard.readText()
    const m = text.match(/t\/(\d+)/)
    if (m) {
      inputUrl.value = text
      showPrompt.value = true
      autoJumpTarget.value = '/t/' + (parseInt(m[1]) ^ SALT).toString(36)
    }
  } catch {
    // 忽略剪贴板权限或读取错误
  }
}

const manualJump = () => {
  const val = inputUrl.value.trim()
  if (!val) return

  const m = val.match(/t\/(\d+)/) || val.match(/^(\d+)$/)
  if (m) {
    location.href = '/t/' + (parseInt(m[1]) ^ SALT).toString(36)
    return
  }

  if (inputRef.value) {
    inputRef.value.style.borderColor = '#ff2c55'
    setTimeout(() => {
      if (inputRef.value) inputRef.value.style.borderColor = 'var(--border)'
    }, 800)
  }
}

const handleAutoJump = () => {
  if (autoJumpTarget.value) {
    location.href = autoJumpTarget.value
  }
}

const goToAll = () => {
  location.href = '/all'
}

onMounted(() => {
  if (needLogin.value) {
    document.title = 'V2EX Reader'
    return
  }

  document.title = 'V2EX Reader'
  window.addEventListener('focus', handleWindowFocus)
})

onUnmounted(() => {
  window.removeEventListener('focus', handleWindowFocus)
})
</script>

<style>
:root { --bg:#fff; --text:#1d2129; --author:#999; --meta:#86909c; --border:#f2f3f5; --fab-bg:rgba(245,245,247,0.7); --input-bg:#f9fafb; --code-k:#0000ff; --code-v:#001080; --code-s:#a31515; --code-c:#008000; --code-ln:#858585; }
@media (prefers-color-scheme:dark) { :root { --bg:#1a1a1c; --text:#e1e1e1; --author:#aaa; --meta:#777; --border:#2d2d2e; --fab-bg:rgba(45,45,46,0.7); --input-bg:#252526; --code-k:#569cd6; --code-v:#9cdcfe; --code-s:#ce9178; --code-c:#6a9955; } }
html { scroll-behavior: auto; }
body { background: var(--bg); color: var(--text); font-family: -apple-system, sans-serif; transition: background 0.3s; margin:0; min-height: 100vh;width:100vw;overflow-x:hidden; }
#mainContent { width: 650px; max-width:100%; margin: 0 auto; padding: 20px; overflow-wrap: break-word; word-break: break-word; overflow: visible; box-sizing: border-box; }
.content { line-height: 1.7; font-size: 1rem;overflow:hidden; } .content p { margin:0.5rem 0; }
.content img, .reply-txt img { max-width: 100% !important; height: auto !important; display: block; margin: 15px 0; border-radius: 4px; }
.content h2{font-size:1.1rem;}
.content h3{font-size:1.05rem;}
.content-empty{color:#ccc; text-align:center; margin-top: 50px; font-size:1.2rem; display:flex; justify-content:center; flex-direction:column; align-items:center;font-weight:300;}
.op-tag {line-height:1; background: #000; color: #fff; font-size: 0.65rem; padding:0.3em 0.5em; border-radius: 3px; margin-left: 4px; vertical-align: middle; }
@media (prefers-color-scheme: dark) { .op-tag { background: #fff; color: #000; } }
.box{width:90%;max-width:400px;text-align:center;}
input{padding:14px 16px;border:1px solid var(--border);border-radius:12px;box-sizing:border-box;outline:none;width:100%;font-size:15px;}
#codeMode { display:none; position:fixed; top:0; left:0; width:100%; height:100vh; background:var(--bg); color:var(--text); font-family:'Consolas','Monaco',monospace; font-size:13px; line-height:1.5; padding:20px; box-sizing:border-box; overflow-y:auto; z-index:9999; }
.code-ln { color:var(--code-ln); margin-right:15px; user-select:none; display:inline-block; width:25px; text-align:right;}
.code-k { color:var(--code-k); font-weight:bold; } .code-v { color:var(--code-v); } .code-s { color:var(--code-s); } .code-c { color:var(--code-c); }
#jumpPrompt { position:fixed; top:20px; left:50%; transform:translateX(-50%) translateY(-150%); background:var(--bg); border:1px solid var(--border); padding:12px 24px; border-radius:40px; box-shadow:0 10px 30px rgba(0,0,0,0.1); z-index:1000; transition:transform 0.4s; display:flex; align-items:center; gap:12px; }
#jumpPrompt.show { transform:translateX(-50%) translateY(0); }
#jumpBtn {padding:0.5rem 0.8rem; line-height:1;border: none;border-radius: 12px;background: #1d2129;color: #fff;font-weight: 600;cursor: pointer;}
@keyframes highlight-fade { 0% { background: rgba(255, 235, 59, 0.4); } 100% { background: transparent; } }
.flash-highlight { animation: highlight-fade 3s ease-out; }
</style>
