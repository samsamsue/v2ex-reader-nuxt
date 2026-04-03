import { defineEventHandler, getCookie, getRouterParam, setResponseStatus } from 'h3'
import { ADMIN_PASS, COOKIE_NAME, COOKIE_VALUE, ENV, fetchAndParsePostFull } from '../../utils/v2ex'

export default defineEventHandler(async (event) => {
  const hasPass = Boolean(ADMIN_PASS)
  const cookieVal = getCookie(event, COOKIE_NAME)
  if (hasPass && cookieVal !== COOKIE_VALUE) {
    setResponseStatus(event, 401)
    return { error: 'AUTH' }
  }

  const id = String(getRouterParam(event, 'id') || '')
  if (!/^[0-9]+$/.test(id)) {
    setResponseStatus(event, 400)
    return { error: 'ID_INVALID' }
  }

  const postData = await fetchAndParsePostFull(`https://www.v2ex.com/t/${id}`, ENV)
  return {
    opAuthor: postData.opAuthor,
    replies: postData.replies,
    total: postData.total,
    allIds: postData.allIds
  }
})
