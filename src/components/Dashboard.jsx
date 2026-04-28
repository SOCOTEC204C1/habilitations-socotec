import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase.js'
import { daysUntil, statusOf } from '../lib/habilitations.js'

export default function Dashboard({ onNavigate }) {
  const [stats, setStats] = useState({ total: 0, expired: 0, warn: 0, ok: 0 })
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: collabs } = await supabase.from('collaborateurs').select('id, nom, prenom')
      const { data: habs } = await supabase.from('habilitations').select('*')

      const total = collabs?.length || 0
      let expired = 0, warn = 0, ok = 0
      const alertList = []

      for (const h of habs || []) {
        const days = daysUntil(h.date_echeance)
        const s = statusOf(days)
        if (s === 'expired') { expired++; alertList.push({ h, days, s }) }
        else if (s === 'warn') { warn++; alertList.push({ h, days, s }) }
        else if (s === 'ok') ok++
      }

      const collabMap = {}
      for (const c of collabs || []) collabMap[c.id] = c
      const enriched = alertList
        .map(a => ({ ...a, collab: collabMap[a.h.collaborateur_id] }))
        .filter(a => a.collab)
        .sort((a, b) => a.days - b.days)

      setStats({ total, expired, warn, ok })
      setAlerts(enriched)
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return (
    <div className="loading">
      <div className="loading-spinner" />
      Chargement du tableau de bord…
    </div>
  )

  return (
    <>
      <div className="page-header">
        <div className="page-title">Tableau de bord</div>
        <div className="page-sub">Vue d'ensemble des habilitations — {new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
      </div>

      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-label">Collaborateurs</div>
          <div className="stat-value">{stats.total}</div>
          <div className="stat-trend">effectif total</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Habilitations expirées</div>
          <div className={`stat-value${stats.expired > 0 ? ' danger' : ''}`}>{stats.expired}</div>
          <div className="stat-trend">{stats.expired > 0 ? '⚠ action requise' : '✓ aucune'}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">À renouveler (90j)</div>
          <div className={`stat-value${stats.warn > 0 ? ' warning' : ''}`}>{stats.warn}</div>
          <div className="stat-trend">{stats.warn > 0 ? 'dans les 3 prochains mois' : '✓ aucune urgence'}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Habilitations valides</div>
          <div className={`stat-value${stats.ok > 0 ? ' ok' : ''}`}>{stats.ok}</div>
          <div className="stat-trend">à jour</div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">Alertes prioritaires</div>
            <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 2 }}>
              Habilitations expirées ou arrivant à échéance
            </div>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={() => onNavigate('collaborateurs')}>
            Voir tous →
          </button>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Collaborateur</th>
                <th>Habilitation</th>
                <th>Échéance</th>
                <th>Statut</th>
              </tr>
            </thead>
            <tbody>
              {alerts.slice(0, 50).map(({ h, days, collab }) => (
                <tr key={h.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: '50%',
                        background: 'var(--accent-bg)', color: 'var(--accent)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 11, fontWeight: 700, flexShrink: 0
                      }}>
                        {collab.nom[0]}{collab.prenom[0]}
                      </div>
                      <div>
                        <div className="collab-name">{collab.nom} {collab.prenom}</div>
                      </div>
                    </div>
                  </td>
                  <td>{h.label}</td>
                  <td style={{ fontFamily: 'DM Mono, monospace', fontSize: 12 }}>
                    {h.date_echeance || '–'}
                  </td>
                  <td>
                    <span className={`badge badge-${days < 0 ? 'expired' : 'warn'}`}>
                      {days < 0 ? `Expiré (${Math.abs(days)}j)` : `Dans ${days}j`}
                    </span>
                  </td>
                </tr>
              ))}
              {alerts.length === 0 && (
                <tr>
                  <td colSpan={4}>
                    <div className="empty">
                      <div className="empty-icon">🎉</div>
                      <div className="empty-text">Aucune alerte — toutes les habilitations sont à jour !</div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
