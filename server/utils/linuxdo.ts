import crypto from 'crypto'
import { ProxyAgent } from 'undici'
import { readFileSync, existsSync } from 'fs'
import { resolve } from 'path'
import MarkdownIt from 'markdown-it'

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

export const SALT = 987654
export const SHARE_SALT = 1234567
export const SITE_NAME = 'linux.do'
export const SITE_BASE = (process.env.LINUXDO_BASE_URL || 'https://linux.do').replace(/\/+$/, '')
export const USER_AGENT =
  process.env.LINUXDO_USER_AGENT ||
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36'
export const ENV = {
  LINUXDO_COOKIE: process.env.LINUXDO_COOKIE || process.env.V2_COOKIE || ''
}

const PROXY_URL = process.env.HTTP_PROXY || process.env.HTTPS_PROXY || ''
const PROXY_AGENT = PROXY_URL ? new ProxyAgent(PROXY_URL) : null
if (!PROXY_URL) {
  console.warn('[linux.do] No HTTP_PROXY/HTTPS_PROXY found in env; requests will go direct.')
} else {
  console.log(`[linux.do] Proxy enabled -> ${PROXY_URL}`)
}

export const ADMIN_PASS = process.env.PASSWORD || ''
export const COOKIE_NAME = 'linuxdo_reader_auth'
export const COOKIE_VALUE = ADMIN_PASS
  ? crypto.createHash('sha256').update(ADMIN_PASS + SALT).digest('hex')
  : 'no_pass_fallback'

type SiteEnv = typeof ENV

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

type DiscourseTopicResponse = {
  id: number
  title?: string
  fancy_title?: string
  slug?: string
  created_at?: string
  last_posted_at?: string
  posts_count?: number
  details?: {
    created_by?: {
      id?: number
      username?: string
      name?: string
    }
  }
  post_stream?: {
    stream?: number[]
    posts?: DiscoursePost[]
  }
}

type DiscoursePostsResponse = {
  post_stream?: {
    posts?: DiscoursePost[]
  }
}

type DiscoursePost = {
  id: number
  username?: string
  display_username?: string
  created_at?: string
  cooked?: string
  post_number: number
  reply_to_post_number?: number | null
  like_count?: number
  actions_summary?: Array<{ id?: number; count?: number }>
}

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

export async function safeFetch(pathOrUrl: string, env: SiteEnv, init?: RequestInit) {
  const safeCookie = sanitizeCookie(env.LINUXDO_COOKIE || '')
  const resp = await fetch(buildUrl(pathOrUrl), {
    ...init,
    dispatcher: PROXY_AGENT || undefined,
    headers: {
      'User-Agent': USER_AGENT,
      Accept: 'application/json, text/html, application/xhtml+xml;q=0.9, */*;q=0.8',
      'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
      Referer: `${SITE_BASE}/`,
      Cookie: safeCookie || '',
      'Cache-Control': 'no-cache, no-store, max-age=0, must-revalidate',
      Pragma: 'no-cache',
      ...(init?.headers || {})
    }
  })

  if (resp.status === 403) throw new Error('LINUXDO_FORBIDDEN_403')
  if (resp.status === 429) throw new Error('LINUXDO_RATE_LIMIT_429')
  if (!resp.ok) throw new Error('LINUXDO_NET_ERROR_' + resp.status)

  return resp
}

export async function safeFetchJson<T>(pathOrUrl: string, env: SiteEnv) {
  const resp = await safeFetch(pathOrUrl, env)
  return (await resp.json()) as T
}

export async function safeFetchText(pathOrUrl: string, env: SiteEnv) {
  const resp = await safeFetch(pathOrUrl, env, {
    headers: {
      Accept: 'application/rss+xml, application/xml;q=0.9, text/xml;q=0.8, text/html;q=0.7, */*;q=0.5'
    }
  })
  return await resp.text()
}

export function getUpstreamHint() {
  return `${SITE_NAME} returned 403 for the current outbound IP. Try a different HTTP_PROXY/HTTPS_PROXY, refresh LINUXDO_COOKIE from a logged-in browser if it is already set, or point LINUXDO_BASE_URL to a working reverse proxy.`
}

export function createUpstreamErrorPayload(error: unknown) {
  const message = error instanceof Error ? error.message : String(error || 'UNKNOWN_ERROR')
  if (message === 'LINUXDO_FORBIDDEN_403') {
    return {
      statusCode: 502,
      body: {
        error: 'UPSTREAM_FORBIDDEN',
        message: getUpstreamHint()
      }
    }
  }

  if (message === 'LINUXDO_RATE_LIMIT_429') {
    return {
      statusCode: 429,
      body: {
        error: 'UPSTREAM_RATE_LIMIT',
        message: `${SITE_NAME} rate limited the current outbound IP.`
      }
    }
  }

  return {
    statusCode: 502,
    body: {
      error: 'UPSTREAM_ERROR',
      message
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

async function fetchTopicJsonWithPosts(id: number, env: SiteEnv) {
  const topic = await safeFetchJson<DiscourseTopicResponse>(`/t/topic/${id}.json`, env)
  const stream = topic.post_stream?.stream || []
  const posts = [...(topic.post_stream?.posts || [])]
  const loadedIds = new Set(posts.map((post) => post.id))

  if (stream.length > posts.length) {
    const missingPostIds = stream.filter((postId) => !loadedIds.has(postId))

    for (let i = 0; i < missingPostIds.length; i += 20) {
      const batch = missingPostIds.slice(i, i + 20)
      const query = batch.map((postId) => `post_ids[]=${postId}`).join('&')
      const extra = await safeFetchJson<DiscoursePostsResponse>(`/t/${id}/posts.json?${query}`, env)
      const extraPosts = extra.post_stream?.posts || []

      extraPosts.forEach((post) => {
        if (!loadedIds.has(post.id)) {
          loadedIds.add(post.id)
          posts.push(post)
        }
      })
    }
  }

  topic.post_stream = {
    ...(topic.post_stream || {}),
    posts: posts.sort((a, b) => a.post_number - b.post_number)
  }

  return topic
}

async function fetchRepliesByIdFromJson(id: number, env: SiteEnv) {
  const topic = await fetchTopicJsonWithPosts(id, env)
  const posts = (topic.post_stream?.posts || []).sort((a, b) => a.post_number - b.post_number)
  const authorByPostNumber = new Map<number, string>()

  posts.forEach((post) => {
    authorByPostNumber.set(post.post_number, getPostAuthor(post))
  })

  const replyPosts = posts.filter((post) => post.post_number > 1)
  const replies = replyPosts.map((post) => {
    const replyContext = parseReplyContext(id, post.cooked || '')
    const parentPostNumber = post.reply_to_post_number ?? replyContext.parentPostNumber
    const replyAuthor =
      (parentPostNumber ? authorByPostNumber.get(parentPostNumber) : '') || replyContext.replyAuthor || ''

    return {
      id: post.post_number,
      author: getPostAuthor(post),
      replyAuthor,
      replyFloor: parentPostNumber,
      replyHtml: replyContext.cleanedHtml || post.cooked || '',
      likes: getPostLikes(post),
      time: formatRelativeTime(post.created_at),
      parent: parentPostNumber,
      children: [] as any[]
    }
  })

  return {
    opAuthor: getPostAuthor(posts[0]) || topic.details?.created_by?.username || topic.details?.created_by?.name || null,
    replies: buildReplyTree(replies),
    total: replyPosts.length,
    allIds: replyPosts.map((post) => post.post_number),
    replySource: 'json'
  }
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

function getPostAuthor(post?: DiscoursePost) {
  return post?.display_username || post?.username || ''
}

function getPostLikes(post?: DiscoursePost) {
  if (!post) return 0
  const liked = post.actions_summary?.find((item) => item.id === 2)?.count
  return typeof liked === 'number' ? liked : post.like_count || 0
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

export async function fetchRepliesById(id: number, env: SiteEnv) {
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
}
