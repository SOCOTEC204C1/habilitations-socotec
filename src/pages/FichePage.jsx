import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'
import { CATEGORIES_LABELS, daysUntil, statusOf, statusLabel } from '../lib/habilitations.js'

const CAT_ICONS = {
  csps:    '🎓',
  secu:    '🦺',
  elec:    '⚡',
  caces:   '🏗',
  risques: '☢',
}

export default function FichePage() {
  const { id } = useParams()
  const [collab, setCollab] = useState(null)
  const [habs, setHabs] = useState([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    async function load() {
      const { data: c, error } = await supabase
        .from('collaborateurs')
        .select('*')
        .eq('id', id)
        .single()

      if (error || !c) { setNotFound(true); setLoading(false); return }

      const { data: h } = await supabase
        .from('habilitations')
        .select('*')
        .eq('collaborateur_id', id)
        .order('categorie')

      setCollab(c)
      setHabs(h || [])
      setLoading(false)
    }
    load()
  }, [id])

  if (loading) return (
    <div className="loading" style={{ minHeight: '100vh' }}>
      <div className="loading-spinner" />
      Chargement de la fiche…
    </div>
  )

  if (notFound) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--surface)' }}>
      <div style={{ textAlign: 'center', padding: 40 }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
        <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--ink)', marginBottom: 8 }}>Fiche introuvable</div>
        <div style={{ fontSize: 14, color: 'var(--ink-3)' }}>Ce collaborateur n'existe pas ou a été supprimé.</div>
      </div>
    </div>
  )

  // Grouper les habilitations par catégorie
  const habsByCategory = {}
  for (const h of habs) {
    if (!habsByCategory[h.categorie]) habsByCategory[h.categorie] = []
    habsByCategory[h.categorie].push(h)
  }

  const initiales = `${collab.nom[0]}${collab.prenom[0]}`

  // Compteurs globaux
  const expiredCount = habs.filter(h => statusOf(daysUntil(h.date_echeance)) === 'expired').length
  const warnCount    = habs.filter(h => statusOf(daysUntil(h.date_echeance)) === 'warn').length
  const okCount      = habs.filter(h => statusOf(daysUntil(h.date_echeance)) === 'ok').length

  return (
    <div className="fiche-page">
      {/* Header */}
      <div className="fiche-header">
        <div className="fiche-header-inner">
          <div className="fiche-avatar-big">{initiales}</div>
          <div style={{ flex: 1 }}>
            <div className="fiche-brand">Socotec SPS IDF — Habilitations</div>
            <div className="fiche-name">{collab.nom} {collab.prenom}</div>
            <div className="fiche-meta">
              {[collab.poste, collab.agence].filter(Boolean).join(' · ')}
              {collab.email && ` · ${collab.email}`}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
            {expiredCount > 0 && (
              <div style={{ background: 'rgba(220,38,38,.2)', color: '#FCA5A5', padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>
                {expiredCount} expirée{expiredCount > 1 ? 's' : ''}
              </div>
            )}
            {okCount > 0 && (
              <div style={{ background: 'rgba(5,150,105,.2)', color: '#6EE7B7', padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>
                {okCount} valide{okCount > 1 ? 's' : ''}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Corps */}
      <div className="fiche-body">
        {habs.length === 0 ? (
          <div className="card">
            <div className="empty">
              <div className="empty-icon">📋</div>
              <div className="empty-text">Aucune habilitation renseignée pour ce collaborateur.</div>
            </div>
          </div>
        ) : (
          Object.entries(habsByCategory).map(([cat, catHabs]) => (
            <div key={cat} className="fiche-section">
              <div className="fiche-section-header">
                <div className="fiche-section-icon">{CAT_ICONS[cat] || '📌'}</div>
                <div className="fiche-section-title">
                  {CATEGORIES_LABELS[cat] || cat}
                </div>
              </div>
              <div className="fiche-hab-grid">
                {catHabs.map(h => {
                  const days = daysUntil(h.date_echeance)
                  const status = statusOf(days)
                  return (
                    <div key={h.id} className={`fiche-hab-card ${status}`}>
                      <div className="fiche-hab-name">{h.label}</div>
                      {h.date_obtention && (
                        <div className="fiche-hab-date">
                          Obtenu le {new Date(h.date_obtention).toLocaleDateString('fr-FR')}
                        </div>
                      )}
                      {h.date_echeance && (
                        <div className="fiche-hab-date">
                          Expire le {new Date(h.date_echeance).toLocaleDateString('fr-FR')}
                        </div>
                      )}
                      <span className={`badge badge-${status}`}>
                        {statusLabel(days)}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          ))
        )}

        <div className="fiche-updated">
          Fiche mise à jour automatiquement · Lecture seule · Socotec SPS IDF
        </div>
      </div>
    </div>
  )
}
