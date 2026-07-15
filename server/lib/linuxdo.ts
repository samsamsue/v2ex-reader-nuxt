import crypto from 'crypto'
import { execFile } from 'child_process'
import { Agent, ProxyAgent } from 'undici'
import { readFileSync, existsSync } from 'fs'
import { resolve } from 'path'
import { promisify } from 'util'
import MarkdownIt from 'markdown-it'
import { getProxyConfig, redactProxyUrl } from './proxy'

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

const execFileAsync = promisify(execFile)

export const SALT = 987654
export const SHARE_SALT = 1234567
export const SITE_NAME = 'linux.do'
export const SITE_BASE = (process.env.LINUXDO_BASE_URL || 'https://linux.do').replace(/\/+$/, '')
export const USER_AGENT =
  process.env.LINUXDO_USER_AGENT ||
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36'
export const ENV = {
  LINUXDO_COOKIE: process.env.LINUXDO_COOKIE || process.env.V2_COOKIE || '',
  LINUXDO_CF_CLEARANCE: process.env.LINUXDO_CF_CLEARANCE || '',
  LINUXDO_USER_AGENT: process.env.LINUXDO_USER_AGENT || ''
}

const PROXY_CONFIG = getProxyConfig('LINUXDO_PROXY_URL')
const PROXY_URL = PROXY_CONFIG.url
const PROXY_AGENT = PROXY_URL ? new ProxyAgent(PROXY_URL) : null
const DIRECT_AGENT = new Agent({
  connectTimeout: 12000,
  headersTimeout: 12000,
  bodyTimeout: 12000
})
if (!PROXY_URL) {
  console.warn('[linux.do] No LINUXDO_PROXY_URL/HTTPS_PROXY/HTTP_PROXY found in env; requests will go direct.')
} else {
  console.log(`[linux.do] Proxy enabled from ${PROXY_CONFIG.source} -> ${redactProxyUrl(PROXY_URL)}`)
}

export const ADMIN_PASS = process.env.PASSWORD || ''
export const COOKIE_NAME = 'linuxdo_reader_auth'
export const COOKIE_VALUE = ADMIN_PASS
  ? crypto.createHash('sha256').update(ADMIN_PASS + SALT).digest('hex')
  : 'no_pass_fallback'

type SiteEnv = typeof ENV

type RequestLike = {
  node?: {
    req?: {
      headers?: Record<string, string | string[] | undefined>
    }
  }
}

export function createRequestEnv(event?: RequestLike): SiteEnv {
  const rawUserAgent = event?.node?.req?.headers?.['user-agent']
  const userAgent = Array.isArray(rawUserAgent) ? rawUserAgent[0] : rawUserAgent
  return {
    ...ENV,
    LINUXDO_USER_AGENT: ENV.LINUXDO_USER_AGENT || userAgent || USER_AGENT
  }
}

type DiscourseTopicListResponse = {
  users?: Array<{ id: number; username?: string; name?: string }>
  topic_list?: {
    topics?: Array<{
      id: number
      title?: string
      fancy_title?: string
      slug?: string
      posts_count?: number
      reply_count?: number
      bumped_at?: string
      last_posted_at?: string
      created_at?: string
      posters?: Array<{ user_id?: number; description?: string }>
    }>
  }
}

type DiscourseListTopic = NonNullable<NonNullable<DiscourseTopicListResponse['topic_list']>['topics']>[number]

export const encodeId = (numId: string | number) => (parseInt(String(numId), 10) ^ SALT).toString(36)
export const decodeId = (code: string) => {
  try {
    return parseInt(code, 36) ^ SALT
  } catch {
    return null
  }
}
export const encodeShare = (numId: string | number) => (parseInt(String(numId), 10) ^ SHARE_SALT).toString(36)
export const decodeShare = (code: string) => {
  try {
    return parseInt(code, 36) ^ SHARE_SALT
  } catch {
    return null
  }
}

function buildUrl(pathOrUrl: string) {
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl
  return `${SITE_BASE}${pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`}`
}

function sanitizeCookie(rawCookie: string) {
  let safeCookie = rawCookie || ''
  if (!safeCookie) return ''
  safeCookie = safeCookie.replace(/^Cookie:\s*/i, '').trim()
  const cleaned = safeCookie.replace(/[^\x00-\xFF]/g, '')
  if (cleaned !== safeCookie) {
    console.warn('[linux.do] LINUXDO_COOKIE contained non-ASCII chars; sanitized.')
  }
  return cleaned
}

function appendCookieValue(cookie: string, name: string, value: string) {
  const safeValue = value.trim()
  if (!safeValue) return cookie
  const pattern = new RegExp(`(?:^|;\\s*)${name}=`, 'i')
  if (pattern.test(cookie)) return cookie
  return cookie ? `${cookie}; ${name}=${safeValue}` : `${name}=${safeValue}`
}

type SiteFetchOptions = {
  skipCookie?: boolean
  noCache?: boolean
  skipProxy?: boolean
  timeoutMs?: number
}

const MIN_REQUEST_INTERVAL_MS = parseInt(process.env.LINUXDO_MIN_REQUEST_INTERVAL_MS || '1000', 10) || 1000
let upstreamRequestQueue = Promise.resolve()
let lastUpstreamRequestAt = 0

async function scheduleUpstreamRequest<T>(request: () => Promise<T>) {
  const previous = upstreamRequestQueue
  let releaseQueue: () => void = () => {}
  upstreamRequestQueue = new Promise<void>((resolve) => {
    releaseQueue = resolve
  })

  await previous
  try {
    const waitMs = Math.max(0, MIN_REQUEST_INTERVAL_MS - (Date.now() - lastUpstreamRequestAt))
    if (waitMs) await new Promise((resolve) => setTimeout(resolve, waitMs))
    lastUpstreamRequestAt = Date.now()
    return await request()
  } finally {
    releaseQueue()
  }
}

export async function safeFetch(pathOrUrl: string, env: SiteEnv, init?: RequestInit, options: SiteFetchOptions = {}) {
  const safeCookie = options.skipCookie
    ? ''
    : appendCookieValue(sanitizeCookie(env.LINUXDO_COOKIE || ''), 'cf_clearance', env.LINUXDO_CF_CLEARANCE || '')
  const headers: Record<string, string> = {
    'User-Agent': env.LINUXDO_USER_AGENT || USER_AGENT,
    Accept: 'application/json, text/html, application/xhtml+xml;q=0.9, */*;q=0.8',
    'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
    Referer: `${SITE_BASE}/`,
    ...((init?.headers as Record<string, string> | undefined) || {})
  }
  if (safeCookie) headers.Cookie = safeCookie
  if (options.noCache !== false) {
    headers['Cache-Control'] = 'no-cache, no-store, max-age=0, must-revalidate'
    headers.Pragma = 'no-cache'
  }

  const resp = await scheduleUpstreamRequest(() => fetch(buildUrl(pathOrUrl), {
      ...init,
      dispatcher: options.skipProxy ? DIRECT_AGENT : PROXY_AGENT || undefined,
      headers,
      signal: init?.signal || (options.timeoutMs ? AbortSignal.timeout(options.timeoutMs) : undefined)
    }))

  if (resp.status === 403) throw new Error('LINUXDO_FORBIDDEN_403')
  if (resp.status === 429) throw new Error('LINUXDO_RATE_LIMIT_429')
  if (!resp.ok) throw new Error('LINUXDO_NET_ERROR_' + resp.status)

  return resp
}

function looksLikeXmlRss(text: string) {
  const sample = text.trim().slice(0, 500).toLowerCase()
  return sample.includes('<rss') || sample.includes('<feed') || sample.includes('<?xml')
}

function isCloudflareChallengeText(text: string) {
  return /cf-mitigated|cloudflare|challenge-platform|just a moment/i.test(text)
}

function normalizeCurlError(error: unknown) {
  const err = error as { message?: string; stderr?: string | Buffer; stdout?: string | Buffer; code?: string | number }
  const stderr = err?.stderr ? String(err.stderr).trim() : ''
  const stdout = err?.stdout ? String(err.stdout).trim().slice(0, 200) : ''
  const message = err?.message || String(error || 'UNKNOWN_ERROR')
  return [message, stderr, stdout && `stdout: ${stdout}`].filter(Boolean).join(' | ')
}

const RSS_CACHE_TTL_MS = parseInt(process.env.LINUXDO_RSS_CACHE_TTL_MS || '60000', 10) || 60000
const RSS_CACHE_MAX = parseInt(process.env.LINUXDO_RSS_CACHE_MAX || '80', 10) || 80
const rssTextCache = new Map<string, { expiresAt: number; text: string }>()
const rssTextInflight = new Map<string, Promise<string>>()

function getRssCacheKey(pathOrUrl: string, env: SiteEnv, options: { useProxy: boolean; withCookie: boolean }) {
  return [
    buildUrl(pathOrUrl),
    options.useProxy ? 'proxy' : 'direct',
    options.withCookie ? 'cookie' : 'public',
    env.LINUXDO_USER_AGENT || USER_AGENT
  ].join('|')
}

function pruneRssCache() {
  if (rssTextCache.size <= RSS_CACHE_MAX) return
  const now = Date.now()
  for (const [key, item] of rssTextCache) {
    if (item.expiresAt <= now || rssTextCache.size > RSS_CACHE_MAX) {
      rssTextCache.delete(key)
    }
    if (rssTextCache.size <= RSS_CACHE_MAX) break
  }
}

async function curlFetchText(pathOrUrl: string, env: SiteEnv, options: { useProxy: boolean; withCookie: boolean }) {
  const url = buildUrl(pathOrUrl)
  const curlBin = process.env.LINUXDO_CURL_BIN || 'curl'
  const safeCookie = options.withCookie
    ? appendCookieValue(sanitizeCookie(env.LINUXDO_COOKIE || ''), 'cf_clearance', env.LINUXDO_CF_CLEARANCE || '')
    : ''
  const args = [
    '--location',
    '--silent',
    '--show-error',
    '--fail',
    '--compressed',
    '--max-time',
    '15',
    '--connect-timeout',
    '8',
    '--user-agent',
    env.LINUXDO_USER_AGENT || USER_AGENT,
    '--header',
    'Accept: application/rss+xml, application/xml;q=0.9, text/xml;q=0.8, text/html;q=0.7, */*;q=0.5',
    '--header',
    'Accept-Language: zh-CN,zh;q=0.9,en;q=0.8',
    '--referer',
    `${SITE_BASE}/`
  ]

  if (options.useProxy && PROXY_URL) {
    args.push('--proxy', PROXY_URL)
  } else if (!options.useProxy) {
    args.push('--noproxy', '*')
  }

  if (safeCookie) {
    args.push('--header', `Cookie: ${safeCookie}`)
  }

  args.push(url)

  const { stdout } = await execFileAsync(curlBin, args, {
    encoding: 'utf8',
    windowsHide: true,
    maxBuffer: 5 * 1024 * 1024
  })
  const text = String(stdout || '')

  if (!looksLikeXmlRss(text)) {
    if (isCloudflareChallengeText(text)) throw new Error('LINUXDO_FORBIDDEN_403')
    throw new Error(`LINUXDO_RSS_CURL_INVALID_RESPONSE: ${text.trim().slice(0, 200) || 'EMPTY_RESPONSE'}`)
  }

  return text
}

export async function safeFetchText(pathOrUrl: string, env: SiteEnv) {
  const useProxy = process.env.LINUXDO_RSS_NO_PROXY !== '1'
  const withCookie = process.env.LINUXDO_RSS_WITH_COOKIE === '1' || Boolean(env.LINUXDO_CF_CLEARANCE)
  const cacheKey = getRssCacheKey(pathOrUrl, env, { useProxy, withCookie })
  const cached = rssTextCache.get(cacheKey)
  if (cached && cached.expiresAt > Date.now()) return cached.text

  const inflight = rssTextInflight.get(cacheKey)
  if (inflight) return await inflight

  const request = (async () => {
    try {
      const resp = await safeFetch(pathOrUrl, env, {
        headers: {
          Accept: 'application/rss+xml, application/xml;q=0.9, text/xml;q=0.8, text/html;q=0.7, */*;q=0.5'
        }
      }, {
        skipCookie: !withCookie,
        noCache: false,
        skipProxy: !useProxy,
        timeoutMs: 12000
      })
      return await resp.text()
    } catch (error) {
      if (cached?.text) {
        console.warn(`[linux.do] RSS request failed for ${pathOrUrl}; serving stale cache.`)
        return cached.text
      }

      if (process.env.LINUXDO_RSS_CURL_FALLBACK === '1') {
        try {
          const text = await curlFetchText(pathOrUrl, env, { useProxy, withCookie })
          const message = error instanceof Error ? error.message : String(error || 'UNKNOWN_ERROR')
          console.warn(`[linux.do] RSS fetch fallback to curl for ${pathOrUrl}: ${message}`)
          return text
        } catch (curlError) {
          console.warn(`[linux.do] RSS curl fallback failed for ${pathOrUrl}: ${normalizeCurlError(curlError)}`)
        }
      }

      if (!useProxy) {
        const message = error instanceof Error ? error.message : String(error || 'UNKNOWN_ERROR')
        throw new Error(`LINUXDO_RSS_DIRECT_FAILED: ${message}`)
      }
      throw error
    }
  })()

  rssTextInflight.set(cacheKey, request)
  try {
    const text = await request
    rssTextCache.set(cacheKey, {
      text,
      expiresAt: Date.now() + RSS_CACHE_TTL_MS
    })
    pruneRssCache()
    return text
  } finally {
    rssTextInflight.delete(cacheKey)
  }
}

export function getUpstreamHint() {
  const hasClearance = /(?:^|;\s*)cf_clearance=/i.test(sanitizeCookie(ENV.LINUXDO_COOKIE || '')) || Boolean(ENV.LINUXDO_CF_CLEARANCE)
  if (hasClearance) {
    return `${SITE_NAME} returned a Cloudflare challenge for the current outbound IP. cf_clearance is configured, so refresh LINUXDO_COOKIE from the same browser/user-agent and the same proxy/export IP used by this server, or set LINUXDO_USER_AGENT to match that browser.`
  }
  return `${SITE_NAME} returned a Cloudflare challenge for the current outbound IP. Try a different LINUXDO_PROXY_URL/HTTPS_PROXY/HTTP_PROXY, add cf_clearance from a logged-in browser to LINUXDO_COOKIE or LINUXDO_CF_CLEARANCE, or point LINUXDO_BASE_URL to a working reverse proxy.`
}

export function getLinuxDoDiagnostics(env: SiteEnv = ENV) {
  const safeCookie = sanitizeCookie(env.LINUXDO_COOKIE || '')
  return {
    baseUrl: SITE_BASE,
    hasProxy: Boolean(PROXY_URL),
    proxySource: PROXY_CONFIG.source || '',
    rssUsesProxy: process.env.LINUXDO_RSS_NO_PROXY !== '1',
    rssSendsCookie: process.env.LINUXDO_RSS_WITH_COOKIE === '1' || Boolean(env.LINUXDO_CF_CLEARANCE),
    rssCurlFallback: process.env.LINUXDO_RSS_CURL_FALLBACK === '1',
    hasLinuxDoCookie: Boolean(safeCookie),
    hasCfClearance: /(?:^|;\s*)cf_clearance=/i.test(safeCookie) || Boolean(env.LINUXDO_CF_CLEARANCE),
    hasLinuxDoUserAgent: Boolean(env.LINUXDO_USER_AGENT)
  }
}

export function createUpstreamErrorPayload(error: unknown) {
  const message = error instanceof Error ? error.message : String(error || 'UNKNOWN_ERROR')
  const diagnostics = getLinuxDoDiagnostics()
  if (message === 'LINUXDO_FORBIDDEN_403') {
    return {
      statusCode: 502,
      body: {
        error: 'UPSTREAM_FORBIDDEN',
        message: getUpstreamHint(),
        diagnostics
      }
    }
  }

  if (message.startsWith('LINUXDO_RSS_DIRECT_FAILED')) {
    return {
      statusCode: 502,
      body: {
        error: 'UPSTREAM_RSS_DIRECT_FAILED',
        message: `${SITE_NAME} RSS direct request failed from this server process. Your browser may be able to open RSS through a different network path, while the server cannot. RSS uses LINUXDO_PROXY_URL/HTTPS_PROXY/HTTP_PROXY by default; set LINUXDO_RSS_NO_PROXY=1 only when the server can directly reach linux.do. (${message})`,
        diagnostics
      }
    }
  }

  if (message === 'LINUXDO_RATE_LIMIT_429') {
    return {
      statusCode: 429,
      body: {
        error: 'UPSTREAM_RATE_LIMIT',
        message: `${SITE_NAME} rate limited the current outbound IP.`,
        diagnostics
      }
    }
  }

  return {
    statusCode: 502,
    body: {
      error: 'UPSTREAM_ERROR',
      message,
      diagnostics
    }
  }
}

function decodeHtmlEntities(value: string) {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
}

function stripHtml(value: string) {
  return decodeHtmlEntities((value || '').replace(/<[^>]+>/g, '').trim())
}

function decodeCData(value: string) {
  return (value || '').replace(/^<!\[CDATA\[/, '').replace(/\]\]>$/, '').trim()
}

function decodeXmlText(value: string) {
  return decodeHtmlEntities(decodeCData(value || ''))
}

function extractTagValue(xml: string, tag: string) {
  const escaped = tag.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const regex = new RegExp(`<${escaped}(?:\\b[^>]*)?>([\\s\\S]*?)</${escaped}\\s*>`, 'i')
  const match = xml.match(regex)
  return match ? match[1].trim() : ''
}

function parseRssItems(xml: string) {
  const items: Array<{
    title: string
    creator: string
    description: string
    link: string
    pubDate: string
    guid: string
  }> = []

  const itemRegex = /<item(?:\b[^>]*)?>([\s\S]*?)<\/item\s*>/ig
  let match: RegExpExecArray | null
  
  while ((match = itemRegex.exec(xml)) !== null) {
    const block = match[1]
    items.push({
      title: decodeXmlText(extractTagValue(block, 'title')),
      creator: decodeXmlText(extractTagValue(block, 'dc:creator')),
      description: decodeCData(extractTagValue(block, 'description')),
      link: decodeXmlText(extractTagValue(block, 'link')),
      pubDate: decodeXmlText(extractTagValue(block, 'pubDate')),
      guid: decodeXmlText(extractTagValue(block, 'guid'))
    })
  }
  return items
}

function resolveDiscourseImages(content: string) {
  if (!content) return '';
  return content
    .replace(/upload:\/\/([a-zA-Z0-9_.-]+)/ig, `${SITE_BASE}/uploads/short-url/$1`)
    .replace(/src="(\/[^"]+)"/ig, `src="${SITE_BASE}$1"`)
    .replace(/\!\[([^\]]*)\]\(\/([^)]+)\)/ig, `![$1](${SITE_BASE}/$2)`)
    .replace(/href="(\/[^"]+)"/ig, `href="${SITE_BASE}$1"`);
}

function parseTopicIdFromLink(link: string) {
  const match = link.match(/\/t\/(?:[^/]+\/)?(\d+)/)
  return match ? parseInt(match[1], 10) : 0
}

function parsePostNumberFromLink(link: string) {
  const match = link.match(/\/t\/(?:[^/]+\/)?\d+\/(\d+)/)
  return match ? parseInt(match[1], 10) : 1
}

function parseReplyCountFromDescription(description: string) {
  const text = stripHtml(description)
  const postCountMatch = text.match(/(\d+)\s*个帖子/)
  if (postCountMatch) {
    return Math.max(parseInt(postCountMatch[1], 10) - 1, 0)
  }
  return 0
}

function stripTrailingReadMore(html: string) {
  return (html || '').replace(/<p><a href="https:\/\/linux\.do\/t\/[^"]+">[\s\S]*?<\/a><\/p>\s*$/i, '').trim()
}

function extractQuotedUsername(asideHtml: string) {
  const dataUsernameMatch = asideHtml.match(/data-username="([^"]+)"/i)
  if (dataUsernameMatch) return decodeXmlText(dataUsernameMatch[1])

  const avatarMatch = asideHtml.match(/user_avatar\/linux\.do\/([^/]+)\//i)
  if (avatarMatch) return decodeXmlText(avatarMatch[1])

  const letterAvatarMatch = asideHtml.match(/letter_avatar\/([^/]+)\//i)
  if (letterAvatarMatch) return decodeXmlText(letterAvatarMatch[1])

  const titleMatch = asideHtml.match(/<div class="title">[\s\S]*?<a [^>]*>([\s\S]*?)<\/a>/i)
  if (titleMatch) return stripHtml(titleMatch[1])

  const titleTextMatch = asideHtml.match(/<div class="title">[\s\S]*?class="avatar">([\s\S]*?):<\/div>/i)
  if (titleTextMatch) return stripHtml(titleTextMatch[1])

  return ''
}

function parseReplyContext(topicId: number, descriptionHtml: string) {
  const asideRegex = /<aside\b[^>]*class="[^"]*\bquote\b[^"]*"[\s\S]*?<\/aside>/gi
  const internalQuotes: Array<{ fullMatch: string; postNumber: number; username: string }> = []
  let match: RegExpExecArray | null

  while ((match = asideRegex.exec(descriptionHtml || '')) !== null) {
    const fullMatch = match[0]
    const postMatch = fullMatch.match(/data-post="(\d+)"/i)
    if (!postMatch) continue

    const quotedTopicMatch = fullMatch.match(/data-topic="(\d+)"/i)
    const quotedTopicId = quotedTopicMatch ? parseInt(quotedTopicMatch[1], 10) : topicId
    if (quotedTopicId !== topicId) continue

    internalQuotes.push({
      fullMatch,
      postNumber: parseInt(postMatch[1], 10),
      username: extractQuotedUsername(fullMatch)
    })
  }

  let cleanedHtml = descriptionHtml || ''
  for (const quote of internalQuotes) {
    cleanedHtml = cleanedHtml.replace(quote.fullMatch, '')
  }
  cleanedHtml = cleanedHtml.replace(/^\s*(<p><\/p>\s*)+/i, '').trim()

  const lastInternalQuote = internalQuotes[internalQuotes.length - 1] || null
  return {
    parentPostNumber: lastInternalQuote?.postNumber || null,
    replyFloor: lastInternalQuote?.postNumber || null,
    replyAuthor: lastInternalQuote?.username || '',
    cleanedHtml
  }
}

function buildReplyTree<T extends { id: number; parent: number | null; children: T[] }>(replies: T[]) {
  const replyMap = new Map<number, T>()
  const tree: T[] = []

  replies.forEach((reply) => {
    replyMap.set(reply.id, reply)
  })

  replies.forEach((reply) => {
    if (reply.parent && reply.parent !== reply.id) {
      const parentReply = replyMap.get(reply.parent)
      if (parentReply) {
        parentReply.children.push(reply)
        return
      }
    }

    tree.push(reply)
  })

  return tree
}

async function fetchRepliesByIdFromRss(id: number, env: SiteEnv, replyNotice = '') {
  const rss = parseTopicRss(await safeFetchText(`/t/topic/${id}.rss`, env))
  const replyPosts = rss.items.filter((item) => item.postNumber > 1)
  
  const replies = replyPosts.map((item) => {
    const replyContext = parseReplyContext(id, stripTrailingReadMore(item.description))
    return {
      id: item.postNumber,
      author: item.creator || '',
      replyAuthor: replyContext.replyAuthor,
      replyFloor: replyContext.replyFloor,
      // 在这里加上 resolveDiscourseImages 保护回复内容
      replyHtml: resolveDiscourseImages(replyContext.cleanedHtml || ''), 
      likes: 0,
      time: formatRelativeTime(item.pubDate),
      parent: replyContext.parentPostNumber,
      children: [] as any[]
    }
  })

  return {
    opAuthor: rss.opAuthor,
    replies: buildReplyTree(replies),
    total: replyPosts.length,
    allIds: replyPosts.map((post) => post.postNumber),
    replySource: 'rss',
    replyNotice
  }
}

function parseTopicRss(xml: string) {
  const channelMatch = xml.match(/<channel>([\s\S]*?)<\/channel>/i)
  const channel = channelMatch ? channelMatch[1] : xml
  
  const items = parseRssItems(channel)
    .map((item) => ({
      ...item,
      postNumber: parsePostNumberFromLink(item.link)
    }))
    .sort((a, b) => a.postNumber - b.postNumber)

  const firstPostInFeed = items[0]

  const channelTitle = decodeXmlText(extractTagValue(channel, 'title'))
  const channelLink = decodeXmlText(extractTagValue(channel, 'link'))
  
  // 处理外层 description（通常包含完整 1 楼）中的图片
  const rawChannelDescription = decodeXmlText(extractTagValue(channel, 'description'))
  const channelDescription = resolveDiscourseImages(rawChannelDescription)
  
  const title = channelTitle || firstPostInFeed?.title || 'Untitled'
  const topicId = parseTopicIdFromLink(channelLink || firstPostInFeed?.link || '')
  const md = new MarkdownIt({ html: true, linkify: true, breaks: true })
  
  // 核心判断：当前 feed 里最老的那条，真的是 1 楼首帖吗？
  const isActuallyFirstPost = firstPostInFeed && firstPostInFeed.postNumber === 1
  
  let firstPostHtml = ''
  if (isActuallyFirstPost) {
    const rawFirstPostHtml = stripTrailingReadMore(firstPostInFeed.description)
    firstPostHtml = resolveDiscourseImages(rawFirstPostHtml)
  }
  
  const contentHtml = firstPostHtml || (channelDescription ? md.render(channelDescription) : '')

  return {
    id: topicId,
    title,
    originalUrl: channelLink || buildTopicUrl('topic', topicId),
    opAuthor: isActuallyFirstPost ? firstPostInFeed.creator : null,
    contentHtml,
    originContent: channelDescription,
    items: items
  }
}

function formatRelativeTime(input?: string) {
  if (!input) return 'just now'
  const time = new Date(input).getTime()
  if (Number.isNaN(time)) return 'just now'

  const diff = Date.now() - time
  if (diff <= 0) return 'just now'

  const minute = 60 * 1000
  const hour = 60 * minute
  const day = 24 * hour

  if (diff < minute) return 'just now'
  if (diff < hour) return `${Math.floor(diff / minute)}m ago`
  if (diff < day) return `${Math.floor(diff / hour)}h ago`
  if (diff < 30 * day) return `${Math.floor(diff / day)}d ago`

  const date = new Date(time)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function getTopicAuthor(
  topic: DiscourseListTopic,
  users: Map<number, { id: number; username?: string; name?: string }>
) {
  const posters = topic.posters || []
  const originalPoster =
    posters.find((poster) => (poster.description || '').toLowerCase().includes('original')) ||
    posters[0]

  if (!originalPoster?.user_id) return ''
  const user = users.get(originalPoster.user_id)
  return user?.username || user?.name || ''
}

export function buildTopicUrl(slug: string | undefined, id: number) {
  return `${SITE_BASE}/t/${slug || 'topic'}/${id}`
}

export async function fetchLatestTopics(page: number, env: SiteEnv) {
  const query = page > 0 ? `?page=${page}` : ''
  const xml = await safeFetchText(`/latest.rss${query}`, env)
  const items = parseRssItems(xml)

  return {
    items: items.map((item) => ({
      code: encodeId(parseTopicIdFromLink(item.link)),
      title: item.title || 'Untitled',
      author: item.creator || '',
      replies: String(parseReplyCountFromDescription(item.description)),
      time: formatRelativeTime(item.pubDate)
    })),
    count: items.length
  }
}

export async function fetchTopicById(id: number, env: SiteEnv) {
  const rss = parseTopicRss(await safeFetchText(`/t/topic/${id}.rss`, env))

  return {
    id: rss.id || id,
    title: rss.title,
    slug: 'topic',
    content: rss.contentHtml,
    contentHtml: rss.contentHtml,
    member: rss.opAuthor ? { username: rss.opAuthor } : null,
    created: null,
    last_modified: null,
    originalUrl: rss.originalUrl
  }
}

async function fetchRepliesByIdRssFirst(id: number, env: SiteEnv) {
  try {
    return await fetchRepliesByIdFromRss(id, env)
  } catch (error) {
    throw error
  }
}

export async function fetchRepliesById(id: number, env: SiteEnv) {
  return await fetchRepliesByIdRssFirst(id, env)
/*
  let jsonError: unknown = null

  try {
    return await fetchRepliesByIdFromJson(id, env)
  } catch (error) {
    jsonError = error
    const message = error instanceof Error ? error.message : String(error || 'UNKNOWN_ERROR')
    console.warn(`[linux.do] Replies JSON fallback to RSS for topic ${id}: ${message}`)
  }

  try {
    const jsonErrorMessage = jsonError instanceof Error ? jsonError.message : String(jsonError || '')
    const replyNotice =
      jsonErrorMessage === 'LINUXDO_FORBIDDEN_403'
        ? ''
        : jsonErrorMessage
          ? `当前评论通过 RSS 加载。JSON 主题接口请求失败：${jsonErrorMessage}`
          : ''

    return await fetchRepliesByIdFromRss(id, env, replyNotice)
  } catch (rssError) {
    throw jsonError || rssError
  }
*/
}
