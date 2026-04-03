import { defineEventHandler, getRouterParam, setResponseStatus } from 'h3'
import { ENV, decodeShare, fetchAndParsePostFull } from '../../utils/v2ex'

export default defineEventHandler(async (event) => {
  const code = String(getRouterParam(event, 'id') || '')
  const rawId = decodeShare(code)
  if (!rawId) {
    setResponseStatus(event, 400)
    return { error: 'ID_DECODE_FAILED' }
  }

  const postData = await fetchAndParsePostFull(`https://www.v2ex.com/t/${rawId}`, ENV)
  return { ...postData, rawId }
})
