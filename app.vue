<template>
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
</style>