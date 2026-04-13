import { defineEventHandler, getQuery, getCookie, setResponseStatus } from 'h3'
import { ADMIN_PASS, COOKIE_NAME, COOKIE_VALUE, ENV, fetchAndParseList } from '../../utils/v2ex'

export default defineEventHandler(async (event) => {
  const hasPass = Boolean(ADMIN_PASS)
  const cookieVal = getCookie(event, COOKIE_NAME)
  if (hasPass && cookieVal !== COOKIE_VALUE) {
    setResponseStatus(event, 401)
    return { error: 'AUTH' }
  }

  const q = getQuery(event)
  const p = parseInt(String(q.p || 0), 10)
  const target = p === 0 ? 'https://www.v2ex.com/?tab=all' : `https://www.v2ex.com/recent?p=${p}`
  const listData = await fetchAndParseList(target, ENV)
  return { items: listData.items, count: listData.count }
})
