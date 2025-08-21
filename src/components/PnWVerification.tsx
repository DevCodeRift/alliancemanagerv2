import React, { useState } from 'react'
import './Auth.css'

interface PnWVerificationProps {
  onVerify: (apiKey: string) => Promise<void>
  onSkip?: () => void
  loading?: boolean
  error?: string
  user?: {
    email?: string
    username?: string
    discordUsername?: string
  }
}

export const PnWVerification: React.FC<PnWVerificationProps> = ({
  onVerify,
  onSkip,
  loading = false,
  error,
  user
}) => {
  const [apiKey, setApiKey] = useState('')
  const [localError, setLocalError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLocalError('')

    if (!apiKey.trim()) {
      setLocalError('Please enter your Politics and War API key')
      return
    }

    try {
      await onVerify(apiKey.trim())
    } catch (err) {
      setLocalError('Verification failed')
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Verify Your Nation</h2>
        <p className="auth-subtitle">
          Connect your Politics and War account to complete setup
        </p>

        {user && (
          <div className="user-info">
            <p>Welcome, {user.username || user.email || user.discordUsername}!</p>
          </div>
        )}

        <div className="info-box">
          <h3>🏛️ Why verify your nation?</h3>
          <ul>
            <li>Access alliance management features</li>
            <li>Get personalized data and statistics</li>
            <li>Connect with your alliance members</li>
            <li>Use bot commands linked to your nation</li>
          </ul>
        </div>

        {(error || localError) && (
          <div className="error-message">
            {error || localError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="apiKey">Politics and War API Key</label>
            <input
              id="apiKey"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your PnW API key"
              disabled={loading}
              required
            />
            <small className="form-help">
              You can find your API key at{' '}
              <a 
                href="https://politicsandwar.com/account/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="help-link"
              >
                politicsandwar.com/account
              </a>
            </small>
          </div>

          <div className="form-actions">
            <button 
              type="submit" 
              className="auth-button primary"
              disabled={loading}
            >
              {loading ? 'Verifying...' : 'Verify Nation'}
            </button>

            {onSkip && (
              <button 
                type="button"
                onClick={onSkip}
                className="auth-button secondary"
                disabled={loading}
              >
                Skip for now
              </button>
            )}
          </div>
        </form>

        <div className="info-box">
          <h4>🔒 Your data is secure</h4>
          <p>
            Your API key is encrypted and stored securely. We only use it to 
            fetch your nation data and verify your identity.
          </p>
        </div>
      </div>
    </div>
  )
}
