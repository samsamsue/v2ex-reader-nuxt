import { defineEventHandler, readMultipartFormData, setResponseStatus } from 'h3'

export default defineEventHandler(async (event) => {
  const apiKey = process.env.IMGBB_API_KEY || ''
  if (!apiKey) {
    setResponseStatus(event, 400)
    return { error: 'IMGBB_API_KEY_REQUIRED', message: 'Set IMGBB_API_KEY.' }
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
  if (image.filename) formData.set('name', image.filename.replace(/\.[^.]+$/, ''))

  const resp = await fetch(`https://api.imgbb.com/1/upload?key=${encodeURIComponent(apiKey)}`, {
    method: 'POST',
    body: formData
  })
  const payload: any = await resp.json().catch(() => null)

  if (!resp.ok || !payload?.success || !payload?.data?.url) {
    setResponseStatus(event, resp.status || 502)
    return {
      error: 'IMGBB_UPLOAD_FAILED',
      message: payload?.error?.message || payload?.error || `ImgBB upload failed with ${resp.status}`
    }
  }

  return {
    ok: true,
    link: payload.data.url,
    displayUrl: payload.data.display_url || payload.data.url,
    deleteUrl: payload.data.delete_url || ''
  }
})
