export default function ConfigPanel() {
  return (
    <div className="config-card">
      <div className="page-header">
        <div className="page-title">Configuration</div>
        <div className="page-sub">Paramètres de l'application</div>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-header">
          <div className="card-title">Variables d'environnement</div>
        </div>
        <div className="card-body">
          <p style={{ fontSize: 13.5, color: 'var(--ink-3)', marginBottom: 20, lineHeight: 1.7 }}>
            Les paramètres principaux sont définis dans les variables d'environnement sur Vercel.
            Modifiez-les dans <strong>Settings → Environment Variables</strong>, puis redéployez.
          </p>
          <div className="env-grid">
            {[
              { key: 'VITE_SUPABASE_URL',      desc: 'URL de votre projet Supabase' },
              { key: 'VITE_SUPABASE_ANON_KEY', desc: 'Clé publique Supabase (anon)' },
              { key: 'VITE_APP_URL',           desc: 'URL de votre app déployée (pour les QR codes)' },
              { key: 'VITE_ADMIN_PASSWORD',    desc: 'Mot de passe administrateur' },
            ].map(v => (
              <div key={v.key} className="env-row">
                <div className="env-key">{v.key}</div>
                <div className="env-desc">{v.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="card-title">À propos</div>
        </div>
        <div className="card-body">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              { icon: '🗄', label: 'Base de données', value: 'Supabase (PostgreSQL)' },
              { icon: '🚀', label: 'Hébergement',     value: 'Vercel' },
              { icon: '📱', label: 'QR Codes',        value: 'Fiches individuelles en lecture seule' },
              { icon: '🔒', label: 'Authentification', value: 'Mot de passe unique admin (sessionStorage)' },
            ].map(item => (
              <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{
                  width: 36, height: 36, background: 'var(--accent-bg)', borderRadius: 8,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0
                }}>{item.icon}</div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink-4)', textTransform: 'uppercase', letterSpacing: '.5px' }}>{item.label}</div>
                  <div style={{ fontSize: 13.5, color: 'var(--ink-2)', marginTop: 2 }}>{item.value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
