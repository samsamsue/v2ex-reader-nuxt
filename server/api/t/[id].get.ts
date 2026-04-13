import { defineEventHandler, getCookie, getRouterParam, setResponseStatus } from 'h3'
import { ADMIN_PASS, COOKIE_NAME, COOKIE_VALUE, ENV, createUpstreamErrorPayload, decodeId, fetchRepliesById, fetchTopicById } from '../../utils/linuxdo'

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

  try {
    const [topicData, replyData] = await Promise.all([fetchTopicById(rawId, ENV), fetchRepliesById(rawId, ENV)])
    return { ...topicData, ...replyData, rawId }
  } catch (error) {
    const payload = createUpstreamErrorPayload(error)
    setResponseStatus(event, payload.statusCode)
    return payload.body
  }
})
