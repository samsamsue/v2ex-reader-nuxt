import { defineEventHandler, getRouterParam, setResponseStatus } from 'h3'
import { createRequestEnv, createUpstreamErrorPayload, fetchRepliesById } from '../../lib/linuxdo'

export default defineEventHandler(async (event) => {
  const id = String(getRouterParam(event, 'id') || '')
  if (!/^[0-9]+$/.test(id)) {
    setResponseStatus(event, 400)
    return { error: 'ID_INVALID' }
  }

  try {
    return await fetchRepliesById(parseInt(id, 10), createRequestEnv(event))
  } catch (error) {
    const payload = createUpstreamErrorPayload(error)
    setResponseStatus(event, payload.statusCode)
    return payload.body
  }
})
