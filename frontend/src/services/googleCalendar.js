import { useGoogleStore } from '../store/googleStore'
import { silentRefresh, isGapiReady } from './googleAuth'

async function ensureToken() {
  const store = useGoogleStore.getState()
  if (!store.isTokenValid()) {
    silentRefresh()
    throw new Error('Token expired — re-authenticating')
  }
}

export async function fetchUpcomingEvents(maxResults = 20) {
  await ensureToken()
  const store = useGoogleStore.getState()
  store.setLoading(true)

  try {
    const response = await window.gapi.client.calendar.events.list({
      calendarId: 'primary',
      timeMin: new Date().toISOString(),
      maxResults,
      singleEvents: true,
      orderBy: 'startTime',
    })
    const events = response.result.items ?? []
    useGoogleStore.getState().setEvents(events)
    useGoogleStore.getState().setLoading(false)
    return events
  } catch (err) {
    useGoogleStore.getState().setError(err.message)
    throw err
  }
}

export async function createEvent({ title, description, startDate, endDate }) {
  await ensureToken()

  const start = startDate
    ? { dateTime: new Date(startDate).toISOString(), timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone }
    : { date: new Date().toISOString().split('T')[0] }

  const end = endDate
    ? { dateTime: new Date(endDate).toISOString(), timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone }
    : start

  const response = await window.gapi.client.calendar.events.insert({
    calendarId: 'primary',
    resource: {
      summary: title,
      description,
      start,
      end,
    },
  })

  return response.result
}

export async function deleteEvent(eventId) {
  await ensureToken()
  await window.gapi.client.calendar.events.delete({
    calendarId: 'primary',
    eventId,
  })
}

export function formatEventDate(event) {
  const raw = event.start?.dateTime ?? event.start?.date
  if (!raw) return null
  return new Date(raw)
}
