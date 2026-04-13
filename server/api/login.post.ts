import { defineEventHandler, readBody, setCookie, setResponseStatus } from 'h3'
import { ADMIN_PASS, COOKIE_NAME as LINUXDO_COOKIE_NAME, COOKIE_VALUE as LINUXDO_COOKIE_VALUE } from '../utils/linuxdo'
import { COOKIE_NAME as V2_COOKIE_NAME, COOKIE_VALUE as V2_COOKIE_VALUE } from '../utils/v2ex'

export default defineEventHandler(async (event) => {
  const body = await readBody<{ password?: string }>(event)
  const password = body?.password

  if (!ADMIN_PASS) {
    setResponseStatus(event, 400)
    return { error: 'NO_PASSWORD_SET' }
  }

  if (password && password === ADMIN_PASS) {
    setCookie(event, LINUXDO_COOKIE_NAME, LINUXDO_COOKIE_VALUE, {
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
      sameSite: 'lax'
    })
    setCookie(event, V2_COOKIE_NAME, V2_COOKIE_VALUE, {
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
      sameSite: 'lax'
    })
    return { ok: true }
  }

  setResponseStatus(event, 401)
  return { error: 'BAD_PASSWORD' }
})
