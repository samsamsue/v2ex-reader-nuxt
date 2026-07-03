import crypto from 'crypto'
import { ProxyAgent } from 'undici'
import { readFileSync, existsSync } from 'fs'
import { resolve } from 'path'

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
export const ENV = {
  V2_COOKIE: process.env.V2_COOKIE || ''
}

const PROXY_URL = process.env.HTTP_PROXY || process.env.HTTPS_PROXY || ''
const PROXY_AGENT = PROXY_URL ? new ProxyAgent(PROXY_URL) : null
if (!PROXY_URL) {
  console.warn('[V2EX] No HTTP_PROXY/HTTPS_PROXY found in env; requests will go direct.')
} else {
  console.log(`[V2EX] Proxy enabled -> ${PROXY_URL}`)
}

export const ADMIN_PASS = process.env.PASSWORD || ''
export const COOKIE_NAME = 'v2_auth_token'
export const COOKIE_VALUE = ADMIN_PASS
  ? crypto.createHash('sha256').update(ADMIN_PASS + SALT).digest('hex')
  : 'no_pass_fallback'

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

type V2Env = typeof ENV

export class V2exReplyError extends Error {
  details?: Record<string, unknown>

  constructor(message: string, details?: Record<string, unknown>) {
    super(message)
    this.name = 'V2exReplyError'
    this.details = details
  }
}

function normalizeHtmlText(value: string) {
  return (value || '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;|&#160;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/@\s+/g, '@')
    .replace(/\s+/g, ' ')
    .trim()
}

function decodeHtmlAttr(value: string) {
  return (value || '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
}

export async function safeFetch(url: string, env: V2Env, init?: RequestInit) {
  let safeCookie = env.V2_COOKIE || ''
  if (safeCookie) {
    safeCookie = safeCookie.replace(/^Cookie:\s*/i, '').trim()
    const cleaned = safeCookie.replace(/[^\x00-\xFF]/g, '')
    if (cleaned !== safeCookie) {
      console.warn('[V2EX] V2_COOKIE contained non-ASCII chars; sanitized.')
      safeCookie = cleaned
    }
  }
  const resp = await fetch(url, {
    ...init,
    dispatcher: PROXY_AGENT || undefined,
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
      Accept:
        'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
      'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
      Referer: 'https://www.v2ex.com/',
      Cookie: safeCookie || '',
      'Cache-Control': 'no-cache, no-store, max-age=0, must-revalidate',
      Pragma: 'no-cache',
      ...(init?.headers || {})
    }
  })

  const manualRedirect = init?.redirect === 'manual'
  if (resp.status === 403) throw new Error('V2EX_FORBIDDEN_403')
  if (resp.status >= 300 && resp.status < 400 && manualRedirect) return resp
  if (resp.status === 302 || resp.url.includes('/signin')) throw new Error('V2EX_COOKIE_EXPIRED')
  if (!resp.ok) throw new Error('V2EX_NET_ERROR_' + resp.status)

  return resp
}

export async function fetchAndParseList(url: string, env: V2Env) {
  const resp = await safeFetch(url, env)
  const htmlStr = await resp.text()
  const items: Array<{ code: string; title: string; author: string; replies: string; time: string }> = []

  const itemRegex = /<div class="cell item"[^>]*>([\s\S]*?)<\/table>\s*<\/div>/g
  let match: RegExpExecArray | null
  while ((match = itemRegex.exec(htmlStr)) !== null) {
    const block = match[1]
    const titleMatch = block.match(/<span class="item_title">.*?<a href="\/t\/(\d+)[^>]*>([\s\S]*?)<\/a>/)
    const authMatch = block.match(/<a href="\/member\/([^"]+)">/)
    const repliesMatch = block.match(/class="count_livid"[^>]*>(\d+)<\/a>/)
    const timeMatch =
      block.match(/<span title="[^"]+">([^<]+)<\/span>/) ||
      block.match(/•\s*([^•]+(?:前|分钟|小时|天|秒|Just now))/)

    if (titleMatch) {
      items.push({
        code: encodeId(titleMatch[1]),
        title: titleMatch[2].trim(),
        author: authMatch ? authMatch[1].trim() : '',
        replies: repliesMatch ? repliesMatch[1] : '0',
        time: timeMatch ? timeMatch[1].trim() : '刚刚'
      })
    }
  }

  return { items, count: items.length }
}

function extractLeadingReplyReference(contentHtml: string) {
  const leadingReplyMatch = contentHtml.match(
    /^\s*@<a href="\/member\/[^"]+">([^<]+)<\/a>(?:&nbsp;|&#160;|\s|<br\s*\/?>|:|：|,|，)*/i
  )

  if (!leadingReplyMatch) {
    return {
      replyAuthor: '',
      replyHtml: contentHtml
    }
  }

  return {
    replyAuthor: leadingReplyMatch[1].trim(),
    replyHtml: contentHtml.slice(leadingReplyMatch[0].length).trim()
  }
}

function extractLeadingReplyReferenceSafe(contentHtml: string) {
  const leadingReplyMatch = contentHtml.match(
    /^\s*@<a href="\/member\/[^"]+">([^<]+)<\/a>(?:&nbsp;|&#160;|\s|<br\s*\/?>|[:\uFF1A,\uFF0C])*/i
  )

  if (!leadingReplyMatch) {
    return {
      replyAuthor: '',
      replyHtml: contentHtml
    }
  }

  return {
    replyAuthor: leadingReplyMatch[1].trim(),
    replyHtml: contentHtml.slice(leadingReplyMatch[0].length).trim()
  }
}

export async function fetchAndParsePostFull(targetUrl: string, env: V2Env) {
  const firstResp = await safeFetch(targetUrl, env)
  const firstHtml = await firstResp.text()
  const title = (firstHtml.match(/<h1>(.*?)<\/h1>/) || ['', '无标题'])[1].replace(' - V2EX', '')
  let content = (firstHtml.match(/<div class="topic_content">([\s\S]*?)<\/div>/) || ['', ''])[1]

  const subtleBlocks = buildSubtleBlocks(firstHtml)
  if (subtleBlocks) content += subtleBlocks

  if (!content) {
    content =
      '<div class="content-empty"><svg t="1775183815751" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1098" width="64" height="64"><path d="M811.7248 136.533333l6.9632 0.375467A68.266667 68.266667 0 0 1 879.991467 204.8v623.7184l-0.341334 6.9632a68.334933 68.334933 0 0 1-60.962133 60.928l-6.9632 0.375467H238.933333l-6.9632-0.375467a68.232533 68.232533 0 0 1-60.928-60.928L170.666667 828.5184V204.8a68.266667 68.266667 0 0 1 61.303466-67.8912L238.933333 136.533333h572.791467z m0 34.133334H238.933333a34.133333 34.133333 0 0 0-34.133333 34.133333v623.7184a34.133333 34.133333 0 0 0 34.133333 34.133333h572.791467a34.133333 34.133333 0 0 0 34.133333-34.133333V204.8c0-18.8416-15.291733-34.0992-34.133333-34.133333z m-167.697067 302.353066a17.066667 17.066667 0 0 1 0 34.133334h-292.078933a17.066667 17.066667 0 0 1 0-34.133334h292.078933z m-108.032-113.7664a17.066667 17.066667 0 0 1 0 34.133334h-184.046933a17.066667 17.066667 0 0 1 0-34.133334h184.046933z" p-id="1099" fill="#cccccc"></path></svg>Empty</div>'
  }

  const opAuthorMatch = firstHtml.match(/<small class="gray"><a href="\/member\/.*?">(.*?)<\/a>/)
  const opAuthor = opAuthorMatch ? opAuthorMatch[1] : null

  let pagesHtml = [firstHtml]
  const pageMatches = firstHtml.match(/href="\/t\/\d+\?p=(\d+)"/g)
  if (pageMatches) {
    const maxPage = Math.max(...pageMatches.map((m) => parseInt(m.match(/p=(\d+)/)![1], 10)))
    if (maxPage > 1) {
      const fetchers = [] as Promise<string>[]
      for (let i = 2; i <= Math.min(maxPage, 3); i++) {
        fetchers.push(safeFetch(`${targetUrl}?p=${i}`, env).then((r) => r.text()))
      }
      pagesHtml = pagesHtml.concat(await Promise.all(fetchers))
    }
  }

  let userMap: Record<string, number> = {}
  let allReplies: Array<{
    id: number
    author: string
    replyAuthor: string
    replyHtml: string
    likes: number
    time: string
    parent: number | null
    children: any[]
  }> = []
  let globalIdx = 1
  pagesHtml.forEach((html) => {
    const blocks = html.substring(html.indexOf('<div id="replies"')).match(/<td width="auto" valign="top" align="left">.*?<\/td>/gs) || []
    blocks.forEach((block) => {
      const auth = (block.match(/strong><a href="\/member\/.*?">(.*?)<\/a><\/strong>/) || ['', ''])[1]
      const timeMatch = block.match(/class="ago" title=".*?">(.*?)<\/span>/)
      const contentBlock = (block.match(/<div class="reply_content">(.*?)<\/div>/s) || ['', ''])[1]
      const { replyAuthor, replyHtml: strippedReplyHtml } = extractLeadingReplyReferenceSafe(contentBlock)
      const replyHtml = strippedReplyHtml.replace(
        /@<a href="\/member\/.*?">(.*?)<\/a>/g,
        '<span class="reply-author">@$1</span>'
      )
      const likes = (block.match(/alt="❤️" \/>\s*(\d+)/) || [0, 0])[1]
      const reply = {
        id: globalIdx++,
        author: auth,
        replyAuthor,
        replyHtml,
        likes: parseInt(String(likes), 10),
        time: timeMatch ? timeMatch[1] : '',
        parent: replyAuthor && userMap[replyAuthor] ? userMap[replyAuthor] : null,
        children: [] as any[]
      }
      allReplies.push(reply)
      userMap[auth] = reply.id
    })
  })

  let tree: typeof allReplies = []
  let map: Record<number, any> = {}
  allReplies.forEach((reply) => {
    map[reply.id] = reply
  })

  const getUltimateRootId = (parentId: number) => {
    let current = map[parentId]
    let depth = 0
    while (current && current.parent && map[current.parent] && depth < 50) {
      current = map[current.parent]
      depth++
    }
    return current ? current.id : parentId
  }

  allReplies.forEach((reply) => {
    if (reply.parent && map[reply.parent]) {
      const rootId = getUltimateRootId(reply.parent)
      map[rootId].children.push(reply)
    } else {
      tree.push(reply)
    }
  })

  tree.sort((a, b) => b.likes - a.likes)

  return {
    title,
    contentHtml: content,
    opAuthor,
    replies: tree,
    total: allReplies.length,
    allIds: allReplies.map((reply) => reply.id)
  }
}

export function buildSubtleBlocks(firstHtml: string) {
  let out = ''
  const subtleRegex = /<div class="subtle">([\s\S]*?)<div class="topic_content">([\s\S]*?)<\/div>\s*<\/div>/g
  let subtleMatch: RegExpExecArray | null
  while ((subtleMatch = subtleRegex.exec(firstHtml)) !== null) {
    const meta = (subtleMatch[1].match(/<span class="fade">(.*?)<\/span>/) || ['', '附言'])[1]
    const subContent = subtleMatch[2]
    out += `<div class="subtle-block" style="margin-top: 18px; padding: 12px 16px; background: #ff2c5511; border-left: 4px solid #ff2c55; border-radius: 0 8px 8px 0;">
      <div style="font-size: 0.8rem; color: var(--meta); margin-bottom: 8px; font-weight: bold;">${meta}</div>
      <div class="topic_content" style="font-size: 0.95rem;">${subContent}</div>
    </div>`
  }
  return out
}

export function extractTopicContentHtml(firstHtml: string) {
  const match = firstHtml.match(/<div class="topic_content">([\s\S]*?)<\/div>/)
  return match ? match[1] : ''
}

function extractV2exOnce(html: string) {
  const inputMatch = html.match(/<input\b[^>]*\bname=["']once["'][^>]*>/i)
  if (inputMatch) {
    const value = inputMatch[0].match(/\bvalue=["']([^"']+)["']/i)?.[1]
    if (value) return value
  }

  const reverseInputMatch = html.match(/<input\b[^>]*\bvalue=["']([^"']+)["'][^>]*\bname=["']once["'][^>]*>/i)
  if (reverseInputMatch?.[1]) return reverseInputMatch[1]

  return (
    html.match(/\bonce\s*[:=]\s*["']?([0-9a-zA-Z_-]+)["']?/i)?.[1] ||
    html.match(/[?&]once=([0-9a-zA-Z_-]+)/i)?.[1] ||
    ''
  )
}

function describeV2exReplyPage(html: string) {
  if (/\/signin|登录|登入|sign in/i.test(html)) return 'V2EX_SIGNIN_PAGE'
  if (/captcha|cloudflare|cf-|challenge|Just a moment/i.test(html)) return 'V2EX_CHALLENGE_PAGE'
  if (/主题已被锁定|不能回复|无法回复|closed|locked/i.test(html)) return 'V2EX_REPLY_CLOSED'
  if (!/reply|回复|once/i.test(html)) return 'V2EX_REPLY_FORM_MISSING'
  return 'V2EX_ONCE_NOT_FOUND'
}

function extractReplyContents(html: string) {
  const replies: string[] = []
  const replyRegex = /<div\b[^>]*class=["'][^"']*\breply_content\b[^"']*["'][^>]*>([\s\S]*?)<\/div>/gi
  let match: RegExpExecArray | null
  while ((match = replyRegex.exec(html || '')) !== null) {
    replies.push(normalizeHtmlText(match[1]))
  }
  return replies
}

function confirmV2exReplyResult(html: string, previousReplyCount: number, submittedContent: string) {
  const replies = extractReplyContents(html)
  if (replies.length > previousReplyCount) return true

  const normalizedSubmitted = normalizeHtmlText(submittedContent)
  if (!normalizedSubmitted) return false

  const submittedPrefix = normalizedSubmitted.slice(0, 80)
  return replies
    .slice(Math.max(0, previousReplyCount - 2))
    .some((reply) => reply.includes(submittedPrefix))
}

function describeV2exReplyResult(html: string) {
  const plain = normalizeHtmlText(html)
  if (/每日登录奖励|请登录|登录后方可|\/signin|sign in/i.test(html)) return 'V2EX_COOKIE_EXPIRED'
  if (/captcha|cloudflare|cf-|challenge|Just a moment/i.test(html)) return 'V2EX_CHALLENGE_PAGE'
  if (/主题已被锁定|不能回复|无法回复|closed|locked/i.test(html)) return 'V2EX_REPLY_CLOSED'
  if (/回复内容不能为空|内容不能为空|请输入回复内容/i.test(plain)) return 'V2EX_REPLY_EMPTY_REJECTED'
  if (/频率|太快|稍后|rate limit|too fast|spam/i.test(plain)) return 'V2EX_REPLY_RATE_LIMITED'
  if (/感谢你的回复|回复成功|感谢回复/i.test(plain)) return ''
  return 'V2EX_REPLY_NOT_CONFIRMED'
}

function extractV2exReplyDiagnostics(html: string) {
  const plain = normalizeHtmlText(html)
  const problem =
    plain.match(/(你[^\s。！？]{0,40}(?:不能|无法|需要|请|太快|频率)[^\s。！？]{0,80})/)?.[1] ||
    plain.match(/((?:不能|无法|需要|请|太快|频率|错误|失败)[^\s。！？]{0,100})/)?.[1] ||
    ''
  const hasProblem = /problem|error|warning|message|sl/i.test(html)
  const hasReplyForm = /name=["']content["'][\s\S]*name=["']once["']|name=["']once["'][\s\S]*name=["']content["']/i.test(html)
  return {
    title: normalizeHtmlText(html.match(/<title>([\s\S]*?)<\/title>/i)?.[1] || '').slice(0, 120),
    problem: problem.slice(0, 160),
    hasProblem,
    hasReplyForm
  }
}

function extractV2exReplyAction(html: string, topicUrl: string) {
  const formMatch =
    html.match(/<form\b[^>]*\bmethod=["']post["'][^>]*>[\s\S]*?\bname=["']once["'][\s\S]*?<\/form>/i) ||
    html.match(/<form\b[^>]*>[\s\S]*?\bname=["']once["'][\s\S]*?<\/form>/i)
  const action = formMatch?.[0].match(/\baction=["']([^"']+)["']/i)?.[1] || ''
  if (!action) return topicUrl
  if (/^https?:\/\//i.test(action)) return action
  return `https://www.v2ex.com${action.startsWith('/') ? action : `/${action}`}`
}

function extractV2exReplyFields(html: string) {
  const formMatch =
    html.match(/<form\b[^>]*\bmethod=["']post["'][^>]*>[\s\S]*?\bname=["']once["'][\s\S]*?<\/form>/i) ||
    html.match(/<form\b[^>]*>[\s\S]*?\bname=["']once["'][\s\S]*?<\/form>/i)
  const form = formMatch?.[0] || ''
  const fields: Record<string, string> = {}
  const inputRegex = /<input\b[^>]*\bname=["']([^"']+)["'][^>]*>/gi
  let match: RegExpExecArray | null

  while ((match = inputRegex.exec(form)) !== null) {
    const input = match[0]
    const name = match[1]
    const value =
      input.match(/\bvalue=["']([^"']*)["']/i)?.[1] ||
      ''
    fields[name] = decodeHtmlAttr(value)
  }

  return fields
}

export async function createTopicReply(topicId: number, raw: string, env: V2Env, replyToAuthor?: string) {
  const content = raw.trim()
  if (!content) throw new Error('REPLY_EMPTY')

  const topicUrl = `https://www.v2ex.com/t/${topicId}`
  const pageResp = await safeFetch(topicUrl, env)
  const pageHtml = await pageResp.text()
  const once = extractV2exOnce(pageHtml)
  if (!once) throw new Error(describeV2exReplyPage(pageHtml))
  const replyUrl = extractV2exReplyAction(pageHtml, topicUrl)
  const replyFields = extractV2exReplyFields(pageHtml)
  const previousReplyCount = extractReplyContents(pageHtml).length

  const replyContent =
    replyToAuthor && !new RegExp(`^\\s*@${replyToAuthor}\\b`).test(content)
      ? `@${replyToAuthor} ${content}`
      : content

  const body = new URLSearchParams()
  Object.entries(replyFields).forEach(([key, value]) => {
    if (key !== 'content') body.set(key, value)
  })
  body.set('content', replyContent)
  body.set('once', once)

  const resp = await safeFetch(replyUrl, env, {
    method: 'POST',
    redirect: 'manual',
    headers: {
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Content-Type': 'application/x-www-form-urlencoded',
      Origin: 'https://www.v2ex.com',
      Referer: topicUrl
    },
    body
  })

  if (resp.status >= 300 && resp.status < 400) {
    const location = resp.headers.get('location') || ''
    if (/\/signin/i.test(location)) throw new Error('V2EX_COOKIE_EXPIRED')
    if (location) {
      return {
        status: resp.status,
        url: new URL(location, replyUrl).toString(),
        confirmed: true,
        redirected: true
      }
    }
  }

  const resultHtml = await resp.text()
  if (confirmV2exReplyResult(resultHtml, previousReplyCount, replyContent)) {
    return { status: resp.status, url: resp.url, confirmed: true }
  }

  const resultError = describeV2exReplyResult(resultHtml)
  if (resultError) {
    throw new V2exReplyError(resultError, {
      status: resp.status,
      url: resp.url,
      replyUrl,
      replyFields: Object.keys(replyFields),
      previousReplyCount,
      returnedReplyCount: extractReplyContents(resultHtml).length,
      ...extractV2exReplyDiagnostics(resultHtml)
    })
  }

  return { status: resp.status, url: resp.url, confirmed: true }
}
