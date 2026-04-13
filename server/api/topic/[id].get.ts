import { defineEventHandler, getCookie, getRouterParam, setResponseStatus } from 'h3'
import { ADMIN_PASS, COOKIE_NAME, COOKIE_VALUE, ENV, createUpstreamErrorPayload, fetchTopicById } from '../../utils/linuxdo'

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

  try {
    const topic = await fetchTopicById(parseInt(id, 10), ENV)
    if (!topic?.id) {
      setResponseStatus(event, 404)
      return { error: 'NOT_FOUND' }
    }

    return topic
  } catch (error) {
    const payload = createUpstreamErrorPayload(error)
    setResponseStatus(event, payload.statusCode)
    return payload.body
  }
})
