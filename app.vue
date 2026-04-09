<script setup lang="ts">
import { lockScroll, unLockScroll } from './utils/common';
const codeBoxVisible = ref(false);

onMounted(() => {
  window.addEventListener('dblclick',()=>{
      codeBoxVisible.value = !codeBoxVisible.value;
      if(codeBoxVisible.value){
        lockScroll('codeBox')
      }else {
        unLockScroll('codeBox')
      }
  })
})
</script>

<template>
  <CodeBox v-if="codeBoxVisible" />
  <div v-if="codeBoxVisible">xxx</div>
  <NuxtPage keepalive />
</template>


<style>
/* 在全局或非 scoped 样式中 */
.lock-scroll {
  overflow: hidden !important;
  padding-right: var(--scrollbar-width, 0px); 

}
@keyframes loading-rotate{
  from{transform:rotate(0deg)}
  to{transform:rotate(360deg)}
}
.loading-rotate{
  animation:loading-rotate 1s linear infinite;
}
:root { --bg:#fff; --text:#1d2129; --author:#999; --meta:#86909c; --border:#f2f3f5; --fab-bg:rgba(245,245,247,0.7); --input-bg:#f9fafb; --code-k:#0000ff; --code-v:#001080; --code-s:#a31515; --code-c:#008000; --code-ln:#858585; }
@media (prefers-color-scheme:dark) { :root { --bg:#1a1a1c; --text:#e1e1e1; --author:#aaa; --meta:#777; --border:#2d2d2e; --fab-bg:rgba(45,45,46,0.7); --input-bg:#252526; --code-k:#569cd6; --code-v:#9cdcfe; --code-s:#ce9178; --code-c:#6a9955; } }
.lock-scroll{
  overflow:hidden !important;
  padding-right:var(--scrollbar-width,0px);
}
</style>