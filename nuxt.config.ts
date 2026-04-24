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
  experimental: {
    appManifest: false
  },
  nitro: {
    // preset: process.env.VERCEL ? 'vercel' : 'node-server',
    imports: {
      exclude: [
        /server[\\/]+utils[\\/]+linuxdo/,
        /server[\\/]+utils[\\/]+v2ex/
      ]
    }
  },
  runtimeConfig: {
    LINUXDO_COOKIE: process.env.LINUXDO_COOKIE || process.env.V2_COOKIE || '',
    PASSWORD: process.env.PASSWORD || '',
    public: {
      hasPassword: Boolean(process.env.PASSWORD)
    }
  }
})
