import { defineEventHandler, getCookie, setResponseStatus } from 'h3'
import { ADMIN_PASS, COOKIE_NAME, COOKIE_VALUE, ENV, safeFetch } from '../../../utils/v2ex'

export default defineEventHandler(async (event) => {
  const hasPass = Boolean(ADMIN_PASS)
  const cookieVal = getCookie(event, COOKIE_NAME)
  if (hasPass && cookieVal !== COOKIE_VALUE) {
    setResponseStatus(event, 401)
    return { error: 'UNAUTHORIZED', count: 0 }
  }

  try {
    const resp = await safeFetch('https://www.v2ex.com/', ENV)
    const html = await resp.text()
    const match = html.match(/href="\/notifications"[^>]*>\s*(\d+)\s*条未读提醒/)
    return { count: match ? parseInt(match[1], 10) : 0 }
  } catch {
    return { count: 0 }
  }
})
