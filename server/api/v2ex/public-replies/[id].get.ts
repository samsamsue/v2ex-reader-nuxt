import { defineEventHandler, getQuery, getRouterParam, setResponseStatus } from 'h3'
import { ENV, fetchAndParsePostFull } from '../../../utils/v2ex'

export default defineEventHandler(async (event) => {
  const id = String(getRouterParam(event, 'id') || '')
  if (!/^[0-9]+$/.test(id)) {
    setResponseStatus(event, 400)
    return { error: 'ID_INVALID' }
  }

  const query = getQuery(event)
  const minPages = parseInt(String(query.page || 0), 10) || 0
  const postData = await fetchAndParsePostFull(`https://www.v2ex.com/t/${id}`, ENV, { minPages })
  return {
    opAuthor: postData.opAuthor,
    replies: postData.replies,
    total: postData.total,
    loadedPages: postData.loadedPages,
    maxPages: postData.maxPages,
    hasMorePages: postData.hasMorePages,
    allIds: postData.allIds,
    replyFloorMap: postData.replyFloorMap
  }
})
