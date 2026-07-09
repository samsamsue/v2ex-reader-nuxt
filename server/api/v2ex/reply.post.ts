import { defineEventHandler, getCookie, readBody, setResponseStatus } from 'h3'
import { ADMIN_PASS, COOKIE_NAME, COOKIE_VALUE, ENV, V2exReplyError, createTopicReply } from '../../lib/v2ex'

export default defineEventHandler(async (event) => {
  const hasPass = Boolean(ADMIN_PASS)
  const cookieVal = getCookie(event, COOKIE_NAME)
  if (hasPass && cookieVal !== COOKIE_VALUE) {
    setResponseStatus(event, 401)
    return { error: 'AUTH' }
  }

  if (!ENV.V2_COOKIE) {
    setResponseStatus(event, 400)
    return { error: 'COOKIE_REQUIRED', message: 'V2_COOKIE is required to reply.' }
  }

  const body = await readBody<{ topicId?: number | string; raw?: string; replyToAuthor?: string }>(event)
  const topicId = Number(body?.topicId)
  const raw = String(body?.raw || '').trim()
  const replyToAuthor = String(body?.replyToAuthor || '').trim()

  if (!Number.isInteger(topicId) || topicId <= 0) {
    setResponseStatus(event, 400)
    return { error: 'ID_INVALID' }
  }
  if (!raw) {
    setResponseStatus(event, 400)
    return { error: 'REPLY_EMPTY' }
  }

  try {
    const result = await createTopicReply(topicId, raw, ENV, replyToAuthor)
    return { ok: true, result }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error || 'UNKNOWN_ERROR')
    const statusCode =
      message === 'V2EX_COOKIE_EXPIRED'
        ? 401
        : message === 'V2EX_FORBIDDEN_403'
          ? 502
          : 502
    setResponseStatus(event, statusCode)
    return {
      error: 'UPSTREAM_ERROR',
      message,
      details: error instanceof V2exReplyError ? error.details : undefined
    }
  }
})
