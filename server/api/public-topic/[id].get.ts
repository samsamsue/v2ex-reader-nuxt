import { defineEventHandler, getRouterParam, setResponseStatus } from 'h3'
import { ENV, createUpstreamErrorPayload, fetchTopicById } from '../../utils/linuxdo'

export default defineEventHandler(async (event) => {
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
