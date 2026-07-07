import { defineEventHandler, getRouterParam, setResponseStatus } from 'h3'
import { createRequestEnv, createUpstreamErrorPayload, decodeShare, fetchRepliesById, fetchTopicById } from '../../utils/linuxdo'

export default defineEventHandler(async (event) => {
  const code = String(getRouterParam(event, 'id') || '')
  const rawId = decodeShare(code)
  if (!rawId) {
    setResponseStatus(event, 400)
    return { error: 'ID_DECODE_FAILED' }
  }

  try {
    const requestEnv = createRequestEnv(event)
    const [topicData, replyData] = await Promise.all([fetchTopicById(rawId, requestEnv), fetchRepliesById(rawId, requestEnv)])
    return { ...topicData, ...replyData, rawId }
  } catch (error) {
    const payload = createUpstreamErrorPayload(error)
    setResponseStatus(event, payload.statusCode)
    return payload.body
  }
})
