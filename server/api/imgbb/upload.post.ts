import { defineEventHandler, readMultipartFormData, setResponseStatus } from 'h3'

const DEFAULT_IMGUR_CLIENT_ID = '60605aad4a62882'
const IMGUR_UPLOAD_URL = 'https://api.imgur.com/3/upload'
const IMGBB_UPLOAD_URL = 'https://api.imgbb.com/1/upload'
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

type UploadResult = {
  ok: true
  provider: 'imgur' | 'imgbb'
  link: string
  displayUrl: string
  deleteUrl: string
}

type UploadFailure = {
  ok: false
  status: number
  provider: 'imgur' | 'imgbb'
  message: string
}

const createImageFormData = (image: NonNullable<Awaited<ReturnType<typeof readMultipartFormData>>>[number]) => {
  const formData = new FormData()
  const blob = new Blob([new Uint8Array(image.data)], { type: image.type || 'application/octet-stream' })
  formData.set('image', blob, image.filename || 'upload.png')
  return formData
}

const uploadToImgur = async (
  image: NonNullable<Awaited<ReturnType<typeof readMultipartFormData>>>[number],
  clientId: string
): Promise<UploadResult | UploadFailure> => {
  const resp = await fetch(IMGUR_UPLOAD_URL, {
    method: 'POST',
    headers: {
      Authorization: `Client-ID ${clientId}`,
      Accept: 'application/json',
      Origin: 'https://www.v2ex.com',
      Referer: 'https://www.v2ex.com/'
    },
    body: createImageFormData(image)
  })
  const payload: any = await resp.json().catch(() => null)

  if (!resp.ok || !payload?.success || !payload?.data?.link) {
    return {
      ok: false,
      status: resp.status || 502,
      provider: 'imgur',
      message: payload?.data?.error || payload?.error?.message || payload?.error || `Imgur upload failed with ${resp.status}`
    }
  }

  return {
    ok: true,
    provider: 'imgur',
    link: payload.data.link,
    displayUrl: payload.data.link,
    deleteUrl: payload.data.deletehash || ''
  }
}

const uploadToImgBB = async (
  image: NonNullable<Awaited<ReturnType<typeof readMultipartFormData>>>[number],
  apiKey: string
): Promise<UploadResult | UploadFailure> => {
  const formData = createImageFormData(image)
  if (image.filename) formData.set('name', image.filename.replace(/\.[^.]+$/, ''))

  const resp = await fetch(`${IMGBB_UPLOAD_URL}?key=${encodeURIComponent(apiKey)}`, {
    method: 'POST',
    body: formData
  })
  const payload: any = await resp.json().catch(() => null)

  if (!resp.ok || !payload?.success || !payload?.data?.url) {
    return {
      ok: false,
      status: resp.status || 502,
      provider: 'imgbb',
      message: payload?.error?.message || payload?.error || `ImgBB upload failed with ${resp.status}`
    }
  }

  return {
    ok: true,
    provider: 'imgbb',
    link: payload.data.url,
    displayUrl: payload.data.display_url || payload.data.url,
    deleteUrl: payload.data.delete_url || ''
  }
}

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

  const firstImgurResult = await uploadToImgur(image, clientId)
  if (firstImgurResult.ok) return firstImgurResult

  await wait(700)
  const secondImgurResult = await uploadToImgur(image, clientId)
  if (secondImgurResult.ok) return secondImgurResult

  const imgbbKey = process.env.IMGBB_API_KEY || ''
  if (imgbbKey) {
    const imgbbResult = await uploadToImgBB(image, imgbbKey)
    if (imgbbResult.ok) return imgbbResult

    setResponseStatus(event, imgbbResult.status)
    return {
      error: 'IMAGE_UPLOAD_FAILED',
      message: `${secondImgurResult.message}; fallback failed: ${imgbbResult.message}`,
      provider: imgbbResult.provider
    }
  }

  setResponseStatus(event, secondImgurResult.status)
  return {
    error: 'IMGUR_UPLOAD_FAILED',
    message: secondImgurResult.message,
    provider: secondImgurResult.provider
  }
})
