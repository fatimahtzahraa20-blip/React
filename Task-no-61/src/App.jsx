import { useState } from 'react';

export function TaskStatus({ completed = false, onToggle }) {
  return (
    <button
      type="button"
      className={`task-status ${completed ? 'task-status--complete' : ''}`}
      aria-pressed={completed}
      onClick={onToggle}
    >
      <span aria-hidden="true">{completed ? '✓' : '○'}</span>
      {completed ? 'Complete' : 'Mark complete'}
    </button>
  );
}

export default function App() {
  const [completed, setCompleted] = useState(false);
  const [apiState, setApiState] = useState('idle');
  const [apiMessage, setApiMessage] = useState('No API check has been run yet.');

  async function checkApi() {
    setApiState('loading');
    setApiMessage('Checking /api/health...');

    try {
      const response = await fetch('/api/health');
      if (!response.ok) {
        throw new Error(`Request failed with ${response.status}`);
      }

      const result = await response.json();
      setApiState(result.status === 'ok' ? 'passed' : 'failed');
      setApiMessage(result.status === 'ok' ? 'API returned a healthy response.' : 'API returned an unexpected status.');
    } catch {
      setApiState('failed');
      setApiMessage('API is unavailable. Start it with npm run server.');
    }
  }

  return (
    <main className="app-shell">
      <p className="eyebrow">Task 71 / Testing Lab</p>
      <h1>Small tests, clear contracts.</h1>
      <p className="intro">
        Exercise the component and route directly, then verify both behaviors with Vitest.
      </p>
      <div className="test-grid">
        <section className="task-card" aria-labelledby="task-title">
          <div>
            <p className="task-label">React component</p>
            <h2 id="task-title">Toggle task status</h2>
            <p>Click the control to exercise the state change tested in App.test.jsx.</p>
          </div>
          <TaskStatus completed={completed} onToggle={() => setCompleted((value) => !value)} />
          <p className="result" role="status">
            Result: {completed ? 'passed, task is complete' : 'ready to run'}
          </p>
        </section>
        <section className="task-card" aria-labelledby="api-title">
          <div>
            <p className="task-label">Express route</p>
            <h2 id="api-title">Check API health</h2>
            <p>Call the route tested in api.test.js and inspect its live response.</p>
          </div>
          <button className="api-check" type="button" onClick={checkApi} disabled={apiState === 'loading'}>
            {apiState === 'loading' ? 'Checking...' : 'Run API check'}
          </button>
          <p className={`result result--${apiState}`} role="status">{apiMessage}</p>
        </section>
      </div>
    </main>
  );
}
