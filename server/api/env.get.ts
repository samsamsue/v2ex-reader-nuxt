import { defineEventHandler } from 'h3'
import { readFileSync, existsSync } from 'fs'
import { resolve } from 'path'

function loadEnvFile() {
  try {
    const p = resolve(process.cwd(), '.env')
    if (!existsSync(p)) return
    const raw = readFileSync(p, 'utf8')
    raw.split(/\r?\n/).forEach((line) => {
      if (!line || line.trim().startsWith('#')) return
      const idx = line.indexOf('=')
      if (idx === -1) return
      const key = line.slice(0, idx).trim()
      const val = line.slice(idx + 1).trim()
      if (key && !process.env[key]) process.env[key] = val
    })
  } catch {}
}

loadEnvFile()

export default defineEventHandler(() => {
  return {
    httpProxy: process.env.HTTP_PROXY || '',
    httpsProxy: process.env.HTTPS_PROXY || '',
    hasV2Cookie: Boolean(process.env.V2_COOKIE),
    hasPassword: Boolean(process.env.PASSWORD)
  }
})
