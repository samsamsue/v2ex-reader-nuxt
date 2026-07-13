import { defineEventHandler, readMultipartFormData, setResponseStatus } from 'h3'

const DEFAULT_IMGUR_CLIENT_ID = '60605aad4a62882'

export default defineEventHandler(async (event) => {
  const clientId = process.env.IMGUR_CLIENT_ID || DEFAULT_IMGUR_CLIENT_ID
  if (!clientId) {
    setResponseStatus(event, 400)
    return { error: 'IMGUR_CLIENT_ID_REQUIRED', message: 'Set IMGUR_CLIENT_ID.' }
  }

  const parts = await readMultipartFormData(event)
  const image = parts?.find((part) => part.name === 'image' && part.data)
  if (!image) {
    setResponseStatus(event, 400)
    return { error: 'IMAGE_REQUIRED', message: 'No image file received.' }
  }

  if (image.type && !image.type.startsWith('image/')) {
    setResponseStatus(event, 400)
    return { error: 'IMAGE_TYPE_INVALID', message: 'Only image files can be uploaded.' }
  }

  const formData = new FormData()
  const blob = new Blob([new Uint8Array(image.data)], { type: image.type || 'application/octet-stream' })
  formData.set('image', blob, image.filename || 'upload.png')

  const resp = await fetch('https://api.imgur.com/3/upload', {
    method: 'POST',
    headers: {
      Authorization: `Client-ID ${clientId}`
    },
    body: formData
  })
  const payload: any = await resp.json().catch(() => null)

  if (!resp.ok || !payload?.success || !payload?.data?.link) {
    setResponseStatus(event, resp.status || 502)
    return {
      error: 'IMGUR_UPLOAD_FAILED',
      message: payload?.data?.error || payload?.error?.message || payload?.error || `Imgur upload failed with ${resp.status}`
    }
  }

  return {
    ok: true,
    link: payload.data.link,
    displayUrl: payload.data.link,
    deleteUrl: payload.data.deletehash || ''
  }
})
