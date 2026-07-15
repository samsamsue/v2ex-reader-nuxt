import { defineEventHandler, setResponseStatus } from 'h3'

export default defineEventHandler(async (event) => {
  setResponseStatus(event, 410)
  return { error: 'FEATURE_DISABLED', message: 'linux.do reply is disabled.' }
})
