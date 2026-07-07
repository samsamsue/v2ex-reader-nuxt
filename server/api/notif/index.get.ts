import { defineEventHandler, getCookie, setResponseStatus } from 'h3'
import { ADMIN_PASS, COOKIE_NAME, COOKIE_VALUE } from '../../utils/linuxdo'

export default defineEventHandler(async (event) => {
  const hasPass = Boolean(ADMIN_PASS)
  const cookieVal = getCookie(event, COOKIE_NAME)
  if (hasPass && cookieVal !== COOKIE_VALUE) {
    setResponseStatus(event, 401)
    return { error: 'UNAUTHORIZED', items: [] }
  }

  return { items: [] }
})
