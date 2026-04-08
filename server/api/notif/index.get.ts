import { defineEventHandler, getCookie, setResponseStatus } from 'h3'
import { ADMIN_PASS, COOKIE_NAME, COOKIE_VALUE, ENV, encodeId, safeFetch } from '../../utils/v2ex'

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
    const items: Array<{ encodedId: string; desc: string; payload: string; time: string }> = []

    const cellRegex = /<div class="cell" id="n_\d+">([\s\S]*?)<\/table>\s*<\/div>/g
    let match: RegExpExecArray | null
    while ((match = cellRegex.exec(html)) !== null) {
      const block = match[1]
      const topicMatch = block.match(/href="\/t\/(\d+)[^"]*"/)
      const fadeMatch = block.match(/<span class="fade">([\s\S]*?)<\/span>/)
      const payloadMatch = block.match(/<div class="payload">([\s\S]*?)<\/div>/)
      const timeMatch = block.match(/<span class="snow">([^<]+)<\/span>/)

      if (topicMatch) {
        const pureDesc = fadeMatch
          ? fadeMatch[1].replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim()
          : '新提醒'
        items.push({
          encodedId: encodeId(topicMatch[1]),
          desc: pureDesc,
          payload: payloadMatch ? payloadMatch[1].trim() : '',
          time: timeMatch ? timeMatch[1].trim() : ''
        })
      }
    }

    return { items }
  } catch {
    return { items: [] }
  }
})
