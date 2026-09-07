import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { validateUser } from './validateUser';
import './styles.css';
function App() {
  const [values, setValues] = useState({ name: '', email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [validatedUser, setValidatedUser] = useState(null);
  function submit(event) {
    event.preventDefault();
    const result = validateUser(values);
    setErrors(result.success ? {} : result.errors);
    setValidatedUser(result.success ? { name: result.data.name, email: result.data.email } : null);
    if (result.success) setValues({ ...result.data, password: '' });
  }
  return <main>
    <p className="eyebrow">TASK 62 / ZOD VALIDATION</p>
    <h1>Validate user data</h1>
    <p className="intro">Check user details before accepting a submission. Invalid input is stopped and each field shows what needs fixing.</p>
    <section className="purpose" aria-labelledby="purpose-title">
      <h2 id="purpose-title">Task purpose</h2>
      <p>Use <code>validateUser</code> with Zod to check a required name, a valid email format, and a password of at least 8 characters.</p>
      <p className="flow">Enter details → Validate → Review result</p>
    </section>
    <form onSubmit={submit} noValidate>
      {[
        { name: 'name', label: 'Full name', type: 'text', autoComplete: 'name', placeholder: 'Alex Morgan' },
        { name: 'email', label: 'Email address', type: 'email', autoComplete: 'email', placeholder: 'alex@example.com' },
        { name: 'password', label: 'Password', type: 'password', autoComplete: 'new-password', placeholder: 'At least 8 characters' },
      ].map(({ name, label, ...props }) => <div className="field" key={name}>
        <label htmlFor={name}>{label}</label>
        <input {...props} id={name} name={name} required value={values[name]}
          aria-invalid={Boolean(errors[name])} aria-describedby={errors[name] ? `${name}-error` : undefined}
          onChange={event => {
            setValues(previous => ({ ...previous, [name]: event.target.value }));
            setErrors(previous => ({ ...previous, [name]: undefined }));
            setValidatedUser(null);
          }} />
        {errors[name] && <p className="error" id={`${name}-error`} role="alert">{errors[name]}</p>}
      </div>)}
      <button type="submit">Validate user <span aria-hidden="true">→</span></button>
    </form>
    {validatedUser && <section className="success" role="status" aria-labelledby="result-title">
      <h2 id="result-title">Validation passed</h2>
      <dl>
        <dt>Name</dt><dd>{validatedUser.name}</dd>
        <dt>Email entered</dt><dd>{validatedUser.email}</dd>
        <dt>Password</dt><dd>Meets the minimum length requirement</dd>
        <dt>Delivery status</dt><dd>Not sent — local validation only</dd>
      </dl>
      <p>The email format is valid. Ownership of this address has not been verified.</p>
    </section>}
    <p className="note">This React demo checks data in your browser. To confirm who owns an email address, connect a backend that sends a verification link or code.</p>
  </main>;
}
createRoot(document.getElementById('root')).render(<React.StrictMode><App /></React.StrictMode>);
