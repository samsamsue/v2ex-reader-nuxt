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
  nitro: {
    preset: 'node-server'
  },
  runtimeConfig: {
    V2_COOKIE: process.env.V2_COOKIE || '',
    PASSWORD: process.env.PASSWORD || ''
  }
})
