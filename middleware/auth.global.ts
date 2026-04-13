export default defineNuxtRouteMiddleware((to) => {
  const config = useRuntimeConfig()
  const token = useCookie('linuxdo_reader_auth')

  if (!config.public.hasPassword) return

  if (token.value && to.path === '/login') {
    return navigateTo('/', { replace: true })
  }
})
