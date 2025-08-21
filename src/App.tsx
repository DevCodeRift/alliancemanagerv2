import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Alliance Manager v2</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          A Discord bot and web application for managing Politics and War alliances.
        </p>
      </div>
      <div className="features">
        <h2>🚀 Coming Soon</h2>
        <ul>
          <li>Discord OAuth Authentication</li>
          <li>Politics and War Integration</li>
          <li>Alliance Member Management</li>
          <li>Real-time Bot Control</li>
        </ul>
      </div>
      <p className="read-the-docs">
        Built with React + TypeScript + Vite
      </p>
    </>
  )
}

export default App
