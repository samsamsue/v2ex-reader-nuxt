export default defineNuxtRouteMiddleware((to, from) => {
  const token = useCookie('v2_auth_token')

  // 1. 定义完全匹配的白名单
  const exactWhiteList = ['/login', '/register', '/404']
  // 2. 定义前缀匹配的白名单
  const prefixWhiteList = ['/s/']

  // 3. 判断当前路径是否在完全匹配列表，或者以某个前缀开头
  const isWhiteListed = 
    exactWhiteList.includes(to.path) || 
    prefixWhiteList.some(prefix => to.path.startsWith(prefix))

  // 如果没有 token 且不在白名单内
  if (!token.value && !isWhiteListed) {
    return navigateTo('/login', { replace: true })
  }

  // 优化体验：如果已经登录了，还非要访问登录页，直接踢回控制台或首页
  if (token.value && to.path === '/login') {
    return navigateTo('/', { replace: true })
  }
})