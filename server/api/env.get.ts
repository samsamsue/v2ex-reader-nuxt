import { defineEventHandler } from 'h3'
import { readFileSync, existsSync } from 'fs'
import { resolve } from 'path'
import { getProxyConfig, redactProxyUrl } from '../lib/proxy'

function loadEnvFile() {
  try {
    const p = resolve(process.cwd(), '.env')
    if (!existsSync(p)) return
    const raw = readFileSync(p, 'utf8')
    raw.split(/\r?\n/).forEach((line) => {
      if (!line || line.trim().startsWith('#')) return
      const idx = line.indexOf('=')
      if (idx === -1) return
      const key = line.slice(0, idx).trim()
      const val = line.slice(idx + 1).trim()
      if (key && !process.env[key]) process.env[key] = val
    })
  } catch {}
}

loadEnvFile()

export default defineEventHandler(() => {
  const linuxDoProxy = getProxyConfig('LINUXDO_PROXY_URL')
  const globalProxy = getProxyConfig()
  return {
    linuxDoBaseUrl: process.env.LINUXDO_BASE_URL || 'https://linux.do',
    linuxDoProxy: redactProxyUrl(linuxDoProxy.url),
    linuxDoProxySource: linuxDoProxy.source,
    httpProxy: redactProxyUrl(process.env.HTTP_PROXY || process.env.http_proxy || ''),
    httpsProxy: redactProxyUrl(process.env.HTTPS_PROXY || process.env.https_proxy || ''),
    globalProxy: redactProxyUrl(globalProxy.url),
    globalProxySource: globalProxy.source,
    hasLinuxDoCookie: Boolean(process.env.LINUXDO_COOKIE || process.env.V2_COOKIE),
    hasLinuxDoCfClearance: Boolean(process.env.LINUXDO_CF_CLEARANCE || /(?:^|;\s*)cf_clearance=/i.test(process.env.LINUXDO_COOKIE || process.env.V2_COOKIE || '')),
    hasV2Cookie: Boolean(process.env.V2_COOKIE),
    hasPassword: Boolean(process.env.PASSWORD)
  }
})
