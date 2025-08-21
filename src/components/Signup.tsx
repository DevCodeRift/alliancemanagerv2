import React, { useState } from 'react'
import './Auth.css'

interface SignupProps {
  onSwitchToLogin: () => void
  onSignup: (data: { email: string; username: string; password: string }) => Promise<void>
  onDiscordLogin: () => void
  loading?: boolean
  error?: string
}

export const Signup: React.FC<SignupProps> = ({
  onSwitchToLogin,
  onSignup,
  onDiscordLogin,
  loading = false,
  error
}) => {
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [localError, setLocalError] = useState('')

  const validateForm = () => {
    if (!email.trim()) {
      setLocalError('Email is required')
      return false
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setLocalError('Please enter a valid email address')
      return false
    }

    if (!username.trim()) {
      setLocalError('Username is required')
      return false
    }

    if (username.length < 3) {
      setLocalError('Username must be at least 3 characters long')
      return false
    }

    if (!password) {
      setLocalError('Password is required')
      return false
    }

    if (password.length < 8) {
      setLocalError('Password must be at least 8 characters long')
      return false
    }

    if (!/[A-Z]/.test(password)) {
      setLocalError('Password must contain at least one uppercase letter')
      return false
    }

    if (!/[a-z]/.test(password)) {
      setLocalError('Password must contain at least one lowercase letter')
      return false
    }

    if (!/\d/.test(password)) {
      setLocalError('Password must contain at least one number')
      return false
    }

    if (password !== confirmPassword) {
      setLocalError('Passwords do not match')
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLocalError('')

    if (!validateForm()) {
      return
    }

    try {
      await onSignup({
        email: email.trim(),
        username: username.trim(),
        password
      })
    } catch (err) {
      setLocalError('Registration failed')
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Create Account</h2>
        <p className="auth-subtitle">Join Alliance Manager today</p>

        {(error || localError) && (
          <div className="error-message">
            {error || localError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              disabled={loading}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Choose a username"
              disabled={loading}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a password"
              disabled={loading}
              required
            />
            <small className="password-help">
              Must be 8+ characters with uppercase, lowercase, and number
            </small>
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
              disabled={loading}
              required
            />
          </div>

          <button 
            type="submit" 
            className="auth-button primary"
            disabled={loading}
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <div className="auth-divider">
          <span>or</span>
        </div>

        <button 
          onClick={onDiscordLogin}
          className="auth-button discord"
          disabled={loading}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.196.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/>
          </svg>
          Continue with Discord
        </button>

        <div className="auth-switch">
          Already have an account?{' '}
          <button 
            onClick={onSwitchToLogin}
            className="link-button"
            disabled={loading}
          >
            Sign in
          </button>
        </div>
      </div>
    </div>
  )
}
