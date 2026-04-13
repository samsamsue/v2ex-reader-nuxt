import { defineEventHandler, getRouterParam, setResponseStatus } from 'h3'
import { ENV, createUpstreamErrorPayload, fetchRepliesById } from '../../utils/linuxdo'

export default defineEventHandler(async (event) => {
  const id = String(getRouterParam(event, 'id') || '')
  if (!/^[0-9]+$/.test(id)) {
    setResponseStatus(event, 400)
    return { error: 'ID_INVALID' }
  }

  try {
    return await fetchRepliesById(parseInt(id, 10), ENV)
  } catch (error) {
    const payload = createUpstreamErrorPayload(error)
    setResponseStatus(event, payload.statusCode)
    return payload.body
  }
})
