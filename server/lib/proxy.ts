type ProxyConfig = {
  url: string
  source: string
}

export function getProxyConfig(preferredEnvName?: string): ProxyConfig {
  const candidates = [
    preferredEnvName,
    'HTTPS_PROXY',
    'https_proxy',
    'HTTP_PROXY',
    'http_proxy',
    'ALL_PROXY',
    'all_proxy'
  ].filter(Boolean) as string[]

  for (const name of candidates) {
    const value = process.env[name]?.trim()
    if (value) return { url: value, source: name }
  }

  return { url: '', source: '' }
}

export function redactProxyUrl(proxyUrl: string) {
  if (!proxyUrl) return ''
  try {
    const url = new URL(proxyUrl)
    if (url.username) url.username = '***'
    if (url.password) url.password = '***'
    return url.toString()
  } catch {
    return proxyUrl.replace(/\/\/([^:@/]+):([^@/]+)@/, '//***:***@')
  }
}
