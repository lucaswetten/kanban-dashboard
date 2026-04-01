import { useGoogleStore } from '../store/googleStore'

const SCOPES = [
  'https://www.googleapis.com/auth/calendar.readonly',
  'https://www.googleapis.com/auth/calendar.events',
].join(' ')

let gapiReady = false
let gisReady = false
let tokenClient = null

function waitForScript(checkFn, timeout = 10000) {
  return new Promise((resolve, reject) => {
    if (checkFn()) return resolve()
    const interval = setInterval(() => {
      if (checkFn()) {
        clearInterval(interval)
        resolve()
      }
    }, 100)
    setTimeout(() => {
      clearInterval(interval)
      reject(new Error('Script load timeout'))
    }, timeout)
  })
}

export async function initGoogle() {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
  const apiKey = import.meta.env.VITE_GOOGLE_API_KEY

  if (!clientId || !apiKey) {
    console.warn('Google credentials not set in .env')
    return
  }

  try {
    // Wait for both scripts
    await Promise.all([
      waitForScript(() => typeof window.gapi !== 'undefined'),
      waitForScript(() => typeof window.google !== 'undefined'),
    ])

    // Init gapi client
    await new Promise((resolve) => {
      window.gapi.load('client', async () => {
        await window.gapi.client.init({
          apiKey,
          discoveryDocs: [
            'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest',
          ],
        })
        gapiReady = true
        resolve()
      })
    })

    // Init GIS token client
    tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: SCOPES,
      callback: (tokenResponse) => {
        if (tokenResponse.error) {
          useGoogleStore.getState().setError(tokenResponse.error_description ?? 'Auth failed')
          return
        }
        window.gapi.client.setToken({ access_token: tokenResponse.access_token })
        useGoogleStore.getState().setToken(tokenResponse.access_token, tokenResponse.expires_in)
      },
    })
    gisReady = true
  } catch (err) {
    console.error('Google init error:', err)
  }
}

export function signIn() {
  if (!gisReady || !tokenClient) {
    useGoogleStore.getState().setError('Google not initialized. Check your credentials.')
    return
  }
  tokenClient.requestAccessToken({ prompt: 'consent' })
}

export function signOut() {
  const { accessToken } = useGoogleStore.getState()
  if (accessToken) {
    window.google?.accounts.oauth2.revoke(accessToken, () => {})
    window.gapi?.client.setToken(null)
  }
  useGoogleStore.getState().clearToken()
}

export function silentRefresh() {
  if (!gisReady || !tokenClient) return
  tokenClient.requestAccessToken({ prompt: '' })
}

export function isGapiReady() {
  return gapiReady
}
