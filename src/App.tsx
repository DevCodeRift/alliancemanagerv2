import { useState } from 'react'
import { AuthFlow } from './components/AuthFlow'
import { Dashboard } from './components/Dashboard'
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

  if (!user) {
    return <AuthFlow onAuthComplete={handleAuthComplete} />
  }

  return <Dashboard user={user} onLogout={handleLogout} />
}

export default App
