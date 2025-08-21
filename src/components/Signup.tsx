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
      {/* Desktop Icons */}
      <div className="cyber-desktop-icons">
        <div className="cyber-desktop-icon">
          <div className="icon"></div>
          <div className="label">Alliance Manager</div>
        </div>
        <div className="cyber-desktop-icon">
          <div className="icon"></div>
          <div className="label">System</div>
        </div>
        <div className="cyber-desktop-icon">
          <div className="icon"></div>
          <div className="label">Network</div>
        </div>
      </div>

      {/* Main Authentication Window */}
      <div className="auth-card">
        {/* Window Title Bar */}
        <div className="cyber-titlebar">
          <div className="cyber-window-title">Alliance Manager - User Registration</div>
          <div className="cyber-window-controls">
            <div className="cyber-control-btn">_</div>
            <div className="cyber-control-btn">□</div>
            <div className="cyber-control-btn close">×</div>
          </div>
        </div>
        
        {/* Window Content */}
        <div className="cyber-window-content">
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
            className="primary-button"
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="auth-divider">
          <span>or</span>
        </div>

        <button 
          onClick={onDiscordLogin}
          className="secondary-button"
          disabled={loading}
        >
          Continue with Discord
        </button>

          <div className="auth-switch">
            Already have an account?{' '}
            <button 
              onClick={onSwitchToLogin}
              className="link-button"
              disabled={loading}
            >
              Sign In
            </button>
          </div>
        </div>
      </div>

      {/* Windows Taskbar */}
      <div className="cyber-taskbar">
        <button className="cyber-start-button">DevCodeRift</button>
        <div className="cyber-system-tray">
          <div className="cyber-tray-icon"></div>
          <div className="cyber-tray-icon"></div>
          <div className="cyber-tray-icon"></div>
          <div className="cyber-taskbar-time">
            {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </div>
    </div>
  )
}
