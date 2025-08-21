import React from 'react'
import './Dashboard.css'

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

interface DashboardProps {
  user: User
  onLogout: () => void
}

export const Dashboard: React.FC<DashboardProps> = ({ user, onLogout }) => {
  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>Alliance Manager</h1>
          <div className="user-menu">
            <div className="user-info">
              <span className="user-name">
                {user.nationName || user.username || user.email || user.discordUsername}
              </span>
              {user.verified && user.nationId && (
                <span className="verification-badge">✓ Verified</span>
              )}
            </div>
            <button onClick={onLogout} className="logout-button">
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="dashboard-main">
        <div className="welcome-section">
          <h2>Welcome to Alliance Manager! 🎉</h2>
          <p>Your authentication system is working perfectly!</p>
          
          {user.verified ? (
            <div className="verified-info">
              <h3>✅ Nation Verified</h3>
              <div className="nation-details">
                <p><strong>Nation:</strong> {user.nationName}</p>
                <p><strong>Leader:</strong> {user.leaderName}</p>
                <p><strong>Nation ID:</strong> {user.nationId}</p>
              </div>
            </div>
          ) : (
            <div className="unverified-info">
              <h3>⚠️ Nation Not Verified</h3>
              <p>You can verify your Politics and War nation later in settings.</p>
            </div>
          )}
        </div>

        <div className="features-grid">
          <div className="feature-card">
            <h3>🏛️ Alliance Management</h3>
            <p>Manage your alliance members, roles, and permissions.</p>
            <button className="feature-button" disabled>Coming Soon</button>
          </div>

          <div className="feature-card">
            <h3>🤖 Discord Bot</h3>
            <p>Control and configure your Discord bot settings.</p>
            <button className="feature-button" disabled>Coming Soon</button>
          </div>

          <div className="feature-card">
            <h3>📊 Statistics</h3>
            <p>View detailed statistics and analytics for your alliance.</p>
            <button className="feature-button" disabled>Coming Soon</button>
          </div>

          <div className="feature-card">
            <h3>⚔️ War Management</h3>
            <p>Track wars, battles, and military statistics.</p>
            <button className="feature-button" disabled>Coming Soon</button>
          </div>
        </div>

        <div className="user-details">
          <h3>Your Account Details</h3>
          <div className="details-grid">
            <div className="detail-item">
              <strong>User ID:</strong> {user.id}
            </div>
            {user.email && (
              <div className="detail-item">
                <strong>Email:</strong> {user.email}
              </div>
            )}
            {user.username && (
              <div className="detail-item">
                <strong>Username:</strong> {user.username}
              </div>
            )}
            {user.discordUsername && (
              <div className="detail-item">
                <strong>Discord:</strong> {user.discordUsername}
              </div>
            )}
            <div className="detail-item">
              <strong>Verification Status:</strong> 
              <span className={user.verified ? 'status-verified' : 'status-unverified'}>
                {user.verified ? ' Verified' : ' Unverified'}
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
