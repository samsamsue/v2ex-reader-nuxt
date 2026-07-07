import { defineEventHandler, getCookie, readBody, setResponseStatus } from 'h3'
import { ADMIN_PASS, COOKIE_NAME, COOKIE_VALUE, ENV, createRequestEnv, createTopicReply, createUpstreamErrorPayload } from '../utils/linuxdo'

export default defineEventHandler(async (event) => {
  const hasPass = Boolean(ADMIN_PASS)
  const cookieVal = getCookie(event, COOKIE_NAME)
  if (hasPass && cookieVal !== COOKIE_VALUE) {
    setResponseStatus(event, 401)
    return { error: 'AUTH' }
  }

  if (!ENV.LINUXDO_COOKIE) {
    setResponseStatus(event, 400)
    return { error: 'COOKIE_REQUIRED', message: 'LINUXDO_COOKIE is required to reply.' }
  }

  const body = await readBody<{ topicId?: number | string; raw?: string; replyToPostNumber?: number | string | null }>(event)
  const topicId = Number(body?.topicId)
  const replyToPostNumber = body?.replyToPostNumber ? Number(body.replyToPostNumber) : null
  const raw = String(body?.raw || '').trim()

  if (!Number.isInteger(topicId) || topicId <= 0) {
    setResponseStatus(event, 400)
    return { error: 'ID_INVALID' }
  }
  if (body?.replyToPostNumber && (!Number.isInteger(replyToPostNumber) || replyToPostNumber! <= 0)) {
    setResponseStatus(event, 400)
    return { error: 'REPLY_TARGET_INVALID' }
  }
  if (!raw) {
    setResponseStatus(event, 400)
    return { error: 'REPLY_EMPTY' }
  }

  try {
    const result = await createTopicReply(topicId, raw, createRequestEnv(event), replyToPostNumber)
    return { ok: true, result }
  } catch (error) {
    const payload = createUpstreamErrorPayload(error)
    setResponseStatus(event, payload.statusCode)
    return payload.body
  }
})
