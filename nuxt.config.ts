import { config } from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'
import { existsSync } from 'fs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const envPath = resolve(__dirname, '.env')
if (existsSync(envPath)) {
  config({ path: envPath, override: true })
}

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  ssr: true,
  compatibilityDate: '2026-07-09',
  experimental: {
    appManifest: false
  },
  vite: {
    plugins: [
      {
        name: 'windows-nuxt-absolute-entry-rewrite',
        configureServer(server) {
          if (process.platform !== 'win32') return
          server.middlewares.use((req, res, next) => {
            if (req.url?.startsWith('/_nuxt/') && /^\/_nuxt\/[A-Za-z]:\//.test(req.url)) {
              req.url = req.url.replace(/^\/_nuxt\//, '/@fs/')
            } else if (req.url?.startsWith('/@fs/') && /^\/@fs\/[A-Za-z]:\//.test(req.url)) {
              res.statusCode = 307
              res.setHeader('Location', req.url.replace(/^\/@fs\//, '/_nuxt/'))
              res.end()
              return
            }
            next()
          })
        }
      }
    ]
  },
  runtimeConfig: {
    LINUXDO_COOKIE: process.env.LINUXDO_COOKIE || process.env.V2_COOKIE || '',
    PASSWORD: process.env.PASSWORD || '',
    public: {
      hasPassword: Boolean(process.env.PASSWORD)
    }
  }
})
