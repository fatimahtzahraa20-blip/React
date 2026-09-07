import { useState } from 'react'
import { supabase, supabaseConfigurationError, checkSupabaseConnection } from './lib/supabase'

export default function App() {
  const [status, setStatus] = useState('idle')
  const [message, setMessage] = useState('Configuration loaded. Click Check connection to verify that your project responds.')

  async function checkConnection() {
    setStatus('checking')
    setMessage('Checking your Supabase project…')
    try {
      await checkSupabaseConnection()
      setStatus('success')
      setMessage('Connection verified: Supabase Auth responded successfully. Database access and table permissions have not been tested.')
    } catch (error) {
      setStatus('error')
      setMessage(error.message)
    }
  }

  return (
    <main>
      <p className="eyebrow">TASK 65 / REACT + SUPABASE</p>
      <h1>Your project starts here.</h1>
      <p className="intro">A React starter with Supabase configuration loaded from environment variables.</p>
      <section aria-labelledby="status-heading">
        <span className={`badge ${status === 'success' ? 'ready' : ''}`}>
          {!supabase ? 'Setup needed' : { idle: 'Configured', checking: 'Checking…', success: 'Connection verified', error: 'Check failed' }[status]}
        </span>
        <h2 id="status-heading">Supabase configuration</h2>
        <p role="status" aria-live="polite">{supabaseConfigurationError || message}</p>
        {supabase && (
          <button type="button" onClick={checkConnection} disabled={status === 'checking'}>
            {status === 'checking' ? 'Checking…' : status === 'idle' ? 'Check connection' : 'Check again'}
          </button>
        )}
        {!supabase && (
          <ol>
            <li>Open the <code>.env</code> file in the project root.</li>
            <li>Set <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_PUBLISHABLE_KEY</code>.</li>
            <li>Restart with <code>npm run dev</code>.</li>
          </ol>
        )}
      </section>
      <p className="footnote">Use a publishable key for this browser app. Keep server secrets on the server.</p>
    </main>
  )
}

