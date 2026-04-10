// server/plugins/proxy.ts
import { ProxyAgent, setGlobalDispatcher, Agent } from 'undici'

export default defineNitroPlugin(() => {
  const proxyUrl = process.env.HTTP_PROXY || process.env.HTTPS_PROXY || ''
  
  if (proxyUrl) {
    console.log(`[Network] 代理已生效，接管流量 -> ${proxyUrl}`)
    
    // 必须配置详细的代理参数，防止 Pending 锁死
    const proxyAgent = new ProxyAgent({
      uri: proxyUrl,
      // 关键 1：设置严格的超时时间，绝不允许无限期 Pending (例如 5 秒没连上直接报错)
      connectTimeout: 5000, 
      headersTimeout: 5000,
      bodyTimeout: 5000,
      // 关键 2：配置合理的连接池，防止连接泄露
      connections: 100, 
      pipelining: 1,
    })
    
    setGlobalDispatcher(proxyAgent)
  } else {
    // 如果没有代理，也建议设置一个带超时的默认全局 Dispatcher
    const defaultAgent = new Agent({
      connectTimeout: 5000,
      headersTimeout: 5000,
      bodyTimeout: 5000,
    })
    setGlobalDispatcher(defaultAgent)
  }
})