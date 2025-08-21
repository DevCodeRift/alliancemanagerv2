import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthFlow } from './components/AuthFlow'
import { Dashboard } from './components/Dashboard'
import { DiscordCallback } from './components/DiscordCallback'
import './App.css'

interface User {
  id: string
  email?: string
  username?: string
  discordUsername?: string
  verified: boolean
  nationId?: number
  nationName?: string
  leaderName?: string
}

function App() {
  const [user, setUser] = useState<User | null>(null)

  const handleAuthComplete = (authenticatedUser: User) => {
    setUser(authenticatedUser)
  }

  const handleLogout = () => {
    localStorage.removeItem('auth_token')
    setUser(null)
  }

  const handleAuthError = (error: string) => {
    console.error('Auth error:', error)
    // Redirect back to login
    window.location.href = '/'
  }

  return (
    <Router>
      <Routes>
        <Route 
          path="/api/auth/discord/callback" 
          element={
            <DiscordCallback 
              onAuthComplete={handleAuthComplete}
              onError={handleAuthError}
            />
          } 
        />
        <Route 
          path="*" 
          element={
            user ? (
              <Dashboard user={user} onLogout={handleLogout} />
            ) : (
              <AuthFlow onAuthComplete={handleAuthComplete} />
            )
          } 
        />
      </Routes>
    </Router>
  )
}

export default App
