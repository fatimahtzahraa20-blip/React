import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL?.trim()
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim()

let client = null
let configurationError = ''

if (!url || !key) {
  configurationError = 'Add your Supabase URL and publishable key to .env, then restart the development server.'
} else {
  try {
    client = createClient(url, key)
  } catch {
    configurationError = 'Check your Supabase URL and publishable key in .env, then restart the development server.'
  }
}

export const supabase = client
export const supabaseConfigurationError = configurationError

export async function checkSupabaseConnection() {
  if (!client) throw new Error(configurationError)
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 10000)
  try {
    const response = await fetch(`${url.replace(/\/+$/, '')}/auth/v1/settings`, {
      headers: { apikey: key },
      signal: controller.signal,
      cache: 'no-store',
    })
    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        throw new Error('Supabase rejected the API key. Check that the URL and publishable key belong to the same project, then restart Vite.')
      }
      throw new Error(`Supabase returned HTTP ${response.status}. Check that your project is active and try again.`)
    }
    const settings = await response.json()
    if (!settings || typeof settings.external !== 'object' || settings.external === null) {
      throw new Error('The URL did not return Supabase Auth settings. Check your project URL.')
    }
  } catch (error) {
    if (controller.signal.aborted) throw new Error('Connection timed out. Check your network and whether the Supabase project is paused.')
    if (error instanceof TypeError) throw new Error('Unable to reach Supabase. Check your project URL, network, and browser network restrictions.')
    throw error
  } finally {
    clearTimeout(timeout)
  }
}

