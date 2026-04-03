import { defineEventHandler, getCookie, getRouterParam, setResponseStatus } from 'h3'
import { ADMIN_PASS, COOKIE_NAME, COOKIE_VALUE, ENV, decodeId, fetchAndParsePostFull } from '../../utils/v2ex'

export default defineEventHandler(async (event) => {
  const hasPass = Boolean(ADMIN_PASS)
  const cookieVal = getCookie(event, COOKIE_NAME)
  if (hasPass && cookieVal !== COOKIE_VALUE) {
    setResponseStatus(event, 401)
    return { error: 'AUTH' }
  }

  const code = String(getRouterParam(event, 'id') || '')
  const rawId = decodeId(code)
  if (!rawId) {
    setResponseStatus(event, 400)
    return { error: 'ID_DECODE_FAILED' }
  }

  const postData = await fetchAndParsePostFull(`https://www.v2ex.com/t/${rawId}`, ENV)
  return { ...postData, rawId }
})
