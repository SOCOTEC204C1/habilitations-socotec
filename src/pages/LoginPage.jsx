import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.jsx'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setTimeout(() => {
      const ok = login(password)
      if (ok) {
        navigate('/admin')
      } else {
        setError('Mot de passe incorrect.')
        setLoading(false)
      }
    }, 300)
  }

  return (
    <div className="login-wrap">
      {/* Panneau gauche décoratif */}
      <div className="login-left">
        <div className="login-brand">
          <div className="login-brand-logo">S</div>
          <div className="login-brand-name">Socotec SPS IDF</div>
          <div className="login-brand-desc">
            Gestion des habilitations et formations — suivi en temps réel, fiches QR code individuelles.
          </div>
        </div>
        <div className="login-features">
          <div className="login-feature">
            <div className="login-feature-icon">📋</div>
            Suivi de toutes les habilitations réglementaires
          </div>
          <div className="login-feature">
            <div className="login-feature-icon">⚡</div>
            Alertes automatiques avant expiration
          </div>
          <div className="login-feature">
            <div className="login-feature-icon">📱</div>
            Fiches individuelles accessibles par QR code
          </div>
        </div>
      </div>

      {/* Panneau droit — formulaire */}
      <div className="login-right">
        <div className="login-form-wrap">
          <div className="login-title">Connexion</div>
          <div className="login-subtitle">Accès réservé aux administrateurs</div>

          <form onSubmit={handleSubmit}>
            <div className="login-field">
              <label className="login-label">MOT DE PASSE</label>
              <input
                className="login-input"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoFocus
              />
            </div>
            <button className="login-btn" type="submit" disabled={loading || !password}>
              {loading ? 'Vérification…' : 'Se connecter →'}
            </button>
          </form>

          {error && <div className="login-error">🔒 {error}</div>}

          <div style={{ marginTop: 32, padding: '16px', background: 'var(--surface)', borderRadius: 10, border: '1px solid var(--border)' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink-4)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 8 }}>
              Accès collaborateur
            </div>
            <div style={{ fontSize: 13, color: 'var(--ink-3)', lineHeight: 1.6 }}>
              Pour consulter votre fiche individuelle, scannez le QR code fourni par votre responsable.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
