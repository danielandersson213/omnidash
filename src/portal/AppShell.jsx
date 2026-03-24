import { useNavigate } from 'react-router-dom'
import './AppShell.css'

export default function AppShell({ children, bodyStyle }) {
  const navigate = useNavigate()

  return (
    <div className="app-shell-root" style={bodyStyle}>
      <button className="back-btn" onClick={() => navigate('/')}>
        <span className="back-logo-mark">◈</span>
        <span>OmniDash</span>
      </button>
      {children}
    </div>
  )
}
