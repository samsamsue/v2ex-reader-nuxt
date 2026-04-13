import { defineEventHandler, getRouterParam, setResponseStatus } from 'h3'
import { ENV, createUpstreamErrorPayload, decodeShare, fetchRepliesById, fetchTopicById } from '../../utils/linuxdo'

export default defineEventHandler(async (event) => {
  const code = String(getRouterParam(event, 'id') || '')
  const rawId = decodeShare(code)
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
