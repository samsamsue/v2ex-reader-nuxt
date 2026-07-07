import { defineEventHandler, getCookie, setResponseStatus } from 'h3'
import { ADMIN_PASS, COOKIE_NAME, COOKIE_VALUE, ENV, encodeId, safeFetch } from '../../../utils/v2ex'

function stripHtml(value: string) {
  return value
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim()
}

function parseTopicHref(block: string) {
  const hrefMatch = block.match(/href=(["'])((?:https?:\/\/www\.v2ex\.com)?\/t\/\d+[^"']*)\1/i)
  if (!hrefMatch) return null

  const href = hrefMatch[2].replace(/&amp;/g, '&')
  const topicMatch = href.match(/\/t\/(\d+)/)
  if (!topicMatch) return null

  const replyMatch = href.match(/#(?:reply|r_)?(\d+)/i)
  const pageMatch = href.match(/[?&]p=(\d+)/i)

  return {
    topicId: topicMatch[1],
    replyId: replyMatch ? replyMatch[1] : '',
    replyPage: pageMatch ? pageMatch[1] : ''
  }
}

export default defineEventHandler(async (event) => {
  const hasPass = Boolean(ADMIN_PASS)
  const cookieVal = getCookie(event, COOKIE_NAME)
  if (hasPass && cookieVal !== COOKIE_VALUE) {
    setResponseStatus(event, 401)
    return { error: 'UNAUTHORIZED', items: [] }
  }

  try {
    const resp = await safeFetch('https://www.v2ex.com/notifications', ENV)
    const html = await resp.text()
    const items: Array<{
      id: string
      encodedId: string
      replyId: string
      replyPage: string
      desc: string
      payload: string
      time: string
    }> = []

    const cellRegex = /<div class="cell" id="n_(\d+)">([\s\S]*?)<\/table>\s*<\/div>/g
    let match: RegExpExecArray | null
    while ((match = cellRegex.exec(html)) !== null) {
      const notificationId = match[1]
      const block = match[2]
      const topic = parseTopicHref(block)
      if (!topic) continue

      const fadeMatch = block.match(/<span class="fade">([\s\S]*?)<\/span>/)
      const payloadMatch = block.match(/<div class="payload">([\s\S]*?)<\/div>/)
      const timeMatch = block.match(/<span class="snow">([^<]+)<\/span>/)

      items.push({
        id: notificationId,
        encodedId: encodeId(topic.topicId),
        replyId: topic.replyId,
        replyPage: topic.replyPage,
        desc: fadeMatch ? stripHtml(fadeMatch[1]) : 'New notification',
        payload: payloadMatch ? payloadMatch[1].trim() : '',
        time: timeMatch ? timeMatch[1].trim() : ''
      })
    }

    return { items }
  } catch {
    return { items: [] }
  }
})
