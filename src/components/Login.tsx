import React, { useState } from 'react'
import './Auth.css'

interface LoginProps {
  onSwitchToSignup: () => void
  onLogin: (identifier: string, password: string) => Promise<void>
  onDiscordLogin: () => void
  loading?: boolean
  error?: string
}

export const Login: React.FC<LoginProps> = ({
  onSwitchToSignup,
  onLogin,
  onDiscordLogin,
  loading = false,
  error
}) => {
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [localError, setLocalError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLocalError('')

    if (!identifier.trim()) {
      setLocalError('Please enter your email or username')
      return
    }

    if (!password) {
      setLocalError('Please enter your password')
      return
    }

    try {
      await onLogin(identifier.trim(), password)
    } catch (err) {
      setLocalError('Login failed')
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
          <div className="cyber-window-title">Alliance Manager - User Authentication</div>
          <div className="cyber-window-controls">
            <div className="cyber-control-btn">_</div>
            <div className="cyber-control-btn">□</div>
            <div className="cyber-control-btn close">×</div>
          </div>
        </div>
        
        {/* Window Content */}
        <div className="cyber-window-content">
          <h2>Welcome Back</h2>
          <p className="auth-subtitle">Sign in to Alliance Manager</p>

          {(error || localError) && (
            <div className="error-message">
              {error || localError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="identifier">Email or Username</label>
              <input
                id="identifier"
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="Enter your email or username"
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
                placeholder="Enter your password"
                disabled={loading}
                required
              />
            </div>

            <button 
              type="submit" 
              className="primary-button"
              disabled={loading}
            >
              {loading ? 'Authenticating...' : 'Access System'}
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
            Discord Network Access
          </button>

          <div className="auth-switch">
            New user?{' '}
            <button 
              onClick={onSwitchToSignup}
              className="link-button"
              disabled={loading}
            >
              Create Account
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
