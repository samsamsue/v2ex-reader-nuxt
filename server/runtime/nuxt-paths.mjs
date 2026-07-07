function joinRelativeURL(...parts) {
  return parts
    .filter((part) => part !== undefined && part !== null && part !== '')
    .map((part, index) => {
      const value = String(part)
      if (index === 0) return value.replace(/\/+$/, '')
      return value.replace(/^\/+|\/+$/g, '')
    })
    .join('/')
    .replace(/^(https?:)\/([^/])/, '$1//$2')
}

export function baseURL() {
  return process.env.NUXT_APP_BASE_URL || '/'
}

export function buildAssetsDir() {
  return process.env.NUXT_APP_BUILD_ASSETS_DIR || '/_nuxt/'
}

export function buildAssetsURL(...path) {
  return joinRelativeURL(publicAssetsURL(), buildAssetsDir(), ...path)
}

export function publicAssetsURL(...path) {
  const publicBase = process.env.NUXT_APP_CDN_URL || baseURL()
  return path.length ? joinRelativeURL(publicBase, ...path) : publicBase
}
