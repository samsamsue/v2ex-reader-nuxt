import { ProxyAgent, setGlobalDispatcher } from 'undici'

export default defineNitroPlugin(() => {
  const proxyUrl = process.env.HTTP_PROXY || process.env.HTTPS_PROXY || ''
  if (proxyUrl) {
    console.log(`[Network] 代理已生效，接管流量 -> ${proxyUrl}`)
    const proxyAgent = new ProxyAgent(proxyUrl)
    setGlobalDispatcher(proxyAgent)
  }
})
