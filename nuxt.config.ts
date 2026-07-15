import { config } from 'dotenv'
import { fileURLToPath, pathToFileURL } from 'url'
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
  buildDir: process.env.NODE_ENV === 'production' ? '.nuxt-build' : '.nuxt',
  compatibilityDate: '2026-07-09',
  experimental: {
    appManifest: false
  },
  routeRules: {
    '/api/imgbb/upload': {
      bodyLimit: '12mb'
    }
  },
  vite: {
    plugins: [
      {
        name: 'windows-nuxt-absolute-entry-rewrite',
        outputOptions(options) {
          if (process.platform !== 'win32' || process.env.NODE_ENV === 'production') return
          const existingPaths = options.paths
          options.paths = (id) => {
            const mapped = typeof existingPaths === 'function'
              ? existingPaths(id)
              : existingPaths?.[id] || id
            return /^[A-Za-z]:[\\/]/.test(mapped) ? pathToFileURL(mapped).href : mapped
          }
          return options
        },
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
