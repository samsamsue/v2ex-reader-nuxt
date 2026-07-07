import { defineEventHandler, getQuery, getCookie, setResponseStatus } from 'h3'
import { ADMIN_PASS, COOKIE_NAME, COOKIE_VALUE, createRequestEnv, createUpstreamErrorPayload, fetchLatestTopics } from '../utils/linuxdo'

export default defineEventHandler(async (event) => {
  const hasPass = Boolean(ADMIN_PASS)
  const cookieVal = getCookie(event, COOKIE_NAME)
  if (hasPass && cookieVal !== COOKIE_VALUE) {
    setResponseStatus(event, 401)
    return { error: 'AUTH' }
  }

  const q = getQuery(event)
  const p = parseInt(String(q.p || 0), 10)
  try {
    const listData = await fetchLatestTopics(p, createRequestEnv(event))
    return { items: listData.items, count: listData.count }
  } catch (error) {
    const payload = createUpstreamErrorPayload(error)
    setResponseStatus(event, payload.statusCode)
    return payload.body
  }
})
