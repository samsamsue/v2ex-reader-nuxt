import { defineEventHandler, getRouterParam, setResponseStatus } from 'h3'
import { ENV, fetchAndParsePostFull } from '../../../utils/v2ex'

export default defineEventHandler(async (event) => {
  const id = String(getRouterParam(event, 'id') || '')
  if (!/^[0-9]+$/.test(id)) {
    setResponseStatus(event, 400)
    return { error: 'ID_INVALID' }
  }

  const postData = await fetchAndParsePostFull(`https://www.v2ex.com/t/${id}`, ENV)
  return {
    opAuthor: postData.opAuthor,
    replies: postData.replies,
    total: postData.total,
    allIds: postData.allIds
  }
})
