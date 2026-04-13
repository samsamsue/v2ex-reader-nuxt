import { defineEventHandler, getCookie, getRouterParam, setResponseStatus } from 'h3'
import MarkdownIt from 'markdown-it'
import {
  ADMIN_PASS,
  COOKIE_NAME,
  COOKIE_VALUE,
  ENV,
  buildSubtleBlocks,
  extractTopicContentHtml,
  safeFetch
} from '../../../utils/v2ex'

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

  const apiUrl = `https://www.v2ex.com/api/topics/show.json?id=${id}`
  const resp = await safeFetch(apiUrl, ENV)
  const json = await resp.json()
  const topic = Array.isArray(json) ? json[0] : json
  if (!topic) {
    setResponseStatus(event, 404)
    return { error: 'NOT_FOUND' }
  }

  const md = new MarkdownIt({ html: true, linkify: true, breaks: true })
  let contentHtml = topic.content_rendered || (topic.content ? md.render(topic.content) : '')

  try {
    const htmlResp = await safeFetch(`https://www.v2ex.com/t/${id}`, ENV)
    const htmlText = await htmlResp.text()
    if (!contentHtml) {
      const fallback = extractTopicContentHtml(htmlText)
      if (fallback) contentHtml = fallback
    }
    const subtles = buildSubtleBlocks(htmlText)
    if (subtles) contentHtml += subtles
  } catch {}

  return {
    id: topic.id,
    title: topic.title,
    content: contentHtml || '',
    content_rendered: contentHtml || '',
    member: topic.member || null,
    created: topic.created,
    last_modified: topic.last_modified
  }
})
