import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import GymStickers from '../components/GymStickers'

function LoginPage() {
  const { login, signup, hasFirebaseConfig } = useAuth()
  const navigate = useNavigate()
  const [isSignup, setIsSignup] = useState(false)
  const [form, setForm] = useState({ email: '', password: '' })
  const [keepSignedIn, setKeepSignedIn] = useState(true)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const persist = keepSignedIn
      if (isSignup) await signup(form.email, form.password, { persist })
      else await login(form.email, form.password, { persist })
      navigate('/dashboard')
    } catch (err) {
      setError(err.message || 'Auth failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="center-screen neo-shell login-root">
      <GymStickers variant="login" />
      <form className="auth-card auth-premium" onSubmit={onSubmit}>
        <h2>{isSignup ? 'Create Account' : 'Welcome Back'}</h2>
        <p>Access your training command center.</p>
        {!hasFirebaseConfig && (
          <div className="warn">
            Firebase is not configured. Create `.env` from `.env.example` and add your
            Firebase keys.
          </div>
        )}
        <input
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
          required
        />
        <input
          type="password"
          placeholder="Password (min 6 chars)"
          minLength={6}
          value={form.password}
          onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
          required
        />
        <label className="auth-session-row">
          <input
            type="checkbox"
            checked={keepSignedIn}
            onChange={(e) => setKeepSignedIn(e.target.checked)}
          />
          <span>Keep me signed in on this device</span>
        </label>
        {error && <div className="error">{error}</div>}
        <button className="btn-primary" disabled={loading}>
          {loading ? 'Please wait...' : isSignup ? 'Sign up' : 'Log in'}
        </button>
        <button
          type="button"
          className="btn-secondary"
          onClick={() => setIsSignup((s) => !s)}
        >
          {isSignup ? 'Already have an account? Log in' : 'New here? Create account'}
        </button>
        <Link to="/" className="mini-link">
          Back to landing
        </Link>
      </form>
    </div>
  )
}

export default LoginPage
