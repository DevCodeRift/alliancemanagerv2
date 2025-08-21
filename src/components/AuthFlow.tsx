import React, { useState, useEffect } from 'react'
import { Login } from './Login'
import { Signup } from './Signup'
import { PnWVerification } from './PnWVerification'

type AuthMode = 'login' | 'signup' | 'verify'

interface User {
  id: string
  email?: string
  username?: string
  discordUsername?: string
  verified: boolean
  nationId?: number
  nationName?: string
}

interface AuthFlowProps {
  onAuthComplete: (user: User) => void
}

export const AuthFlow: React.FC<AuthFlowProps> = ({ onAuthComplete }) => {
  const [mode, setMode] = useState<AuthMode>('login')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [currentUser, setCurrentUser] = useState<User | null>(null)

  // Check if user is already logged in
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('auth_token')
        if (token) {
          // TODO: Validate token with backend
          // For now, just check if it exists
          console.log('Token found:', token)
        }
      } catch (err) {
        console.error('Auth check failed:', err)
      }
    }

    checkAuth()
  }, [])

  const handleLogin = async (identifier: string, password: string) => {
    setLoading(true)
    setError('')

    try {
      // TODO: Replace with actual API call
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ identifier, password }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Login failed')
      }

      const data = await response.json()
      
      // Store auth token
      localStorage.setItem('auth_token', data.token)
      
      // Set current user
      setCurrentUser(data.user)
      
      // If user is not verified, show verification step
      if (!data.user.verified) {
        setMode('verify')
      } else {
        onAuthComplete(data.user)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const handleSignup = async (data: { email: string; username: string; password: string }) => {
    setLoading(true)
    setError('')

    try {
      // TODO: Replace with actual API call
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Registration failed')
      }

      const responseData = await response.json()
      
      // Store auth token
      localStorage.setItem('auth_token', responseData.token)
      
      // Set current user and move to verification
      setCurrentUser(responseData.user)
      setMode('verify')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  const handleDiscordLogin = async () => {
    setError('')
    
    try {
      // TODO: Implement Discord OAuth
      // For now, show an alert
      alert('Discord OAuth will be implemented once we have the backend API routes set up!')
    } catch (err) {
      setError('Discord login failed')
    }
  }

  const handlePnWVerification = async (apiKey: string) => {
    if (!currentUser) {
      setError('No user session found')
      return
    }

    setLoading(true)
    setError('')

    try {
      // TODO: Replace with actual API call
      const response = await fetch('/api/pnw/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify({ apiKey }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Verification failed')
      }

      const data = await response.json()
      
      // Update user with verification data
      const verifiedUser = {
        ...currentUser,
        verified: true,
        nationId: data.nationData.id,
        nationName: data.nationData.nationName,
      }
      
      onAuthComplete(verifiedUser)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed')
    } finally {
      setLoading(false)
    }
  }

  const handleSkipVerification = () => {
    if (currentUser) {
      onAuthComplete(currentUser)
    }
  }

  if (mode === 'login') {
    return (
      <Login
        onSwitchToSignup={() => setMode('signup')}
        onLogin={handleLogin}
        onDiscordLogin={handleDiscordLogin}
        loading={loading}
        error={error}
      />
    )
  }

  if (mode === 'signup') {
    return (
      <Signup
        onSwitchToLogin={() => setMode('login')}
        onSignup={handleSignup}
        onDiscordLogin={handleDiscordLogin}
        loading={loading}
        error={error}
      />
    )
  }

  if (mode === 'verify' && currentUser) {
    return (
      <PnWVerification
        onVerify={handlePnWVerification}
        onSkip={handleSkipVerification}
        loading={loading}
        error={error}
        user={currentUser}
      />
    )
  }

  return null
}
