import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase.js'
import { HABILITATIONS_DEF, CATEGORIES_LABELS } from '../lib/habilitations.js'

const CAT_ICONS = {
  csps:    '🎓',
  secu:    '🦺',
  elec:    '⚡',
  caces:   '🏗',
  risques: '☢',
}

const EMPTY_FORM = {
  nom: '', prenom: '', poste: '', agence: '204C1', email: '', tel: ''
}

export default function CollabModal({ collab, onClose, onSaved }) {
  const isNew = !collab?.id
  const [form, setForm] = useState(isNew ? EMPTY_FORM : {
    nom:    collab.nom    || '',
    prenom: collab.prenom || '',
    poste:  collab.poste  || '',
    agence: collab.agence || '204C1',
    email:  collab.email  || '',
    tel:    collab.tel    || '',
  })
  const [habForm, setHabForm] = useState({})
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('infos')

  useEffect(() => {
    if (!isNew && collab.habs) {
      const map = {}
      for (const h of collab.habs) {
        map[h.code] = {
          date_obtention: h.date_obtention || '',
          date_echeance:  h.date_echeance  || '',
        }
      }
      setHabForm(map)
    }
  }, [])

  function setHab(code, field, value) {
    setHabForm(prev => ({
      ...prev,
      [code]: { ...(prev[code] || {}), [field]: value }
    }))
  }

  async function handleSave() {
    if (!form.nom.trim() || !form.prenom.trim()) {
      setError('Le nom et le prénom sont obligatoires.')
      return
    }
    setSaving(true)
    setError('')

    try {
      let collabId = collab?.id

      if (isNew) {
        const { data, error: e } = await supabase
          .from('collaborateurs')
          .insert([form])
          .select()
          .single()
        if (e) throw e
        collabId = data.id
      } else {
        const { error: e } = await supabase
          .from('collaborateurs')
          .update(form)
          .eq('id', collabId)
        if (e) throw e
      }

      // Construire les upserts d'habilitations
      const upserts = []
      for (const [cat, defs] of Object.entries(HABILITATIONS_DEF)) {
        for (const def of defs) {
          const h = habForm[def.code]
          if (h && (h.date_obtention || h.date_echeance)) {
            upserts.push({
              collaborateur_id: collabId,
              code:             def.code,
              label:            def.label,
              categorie:        cat,
              date_obtention:   h.date_obtention || null,
              date_echeance:    h.date_echeance  || null,
            })
          }
        }
      }

      // Supprimer les anciennes puis réinsérer
      const { error: delErr } = await supabase
        .from('habilitations')
        .delete()
        .eq('collaborateur_id', collabId)
      if (delErr) throw delErr

      if (upserts.length > 0) {
        const { error: insErr } = await supabase
          .from('habilitations')
          .insert(upserts)
        if (insErr) throw insErr
      }

      onSaved()
    } catch (e) {
      setError(e.message || 'Une erreur est survenue.')
      setSaving(false)
    }
  }

  const tabs = [
    { id: 'infos', label: 'Informations' },
    ...Object.entries(CATEGORIES_LABELS).map(([id, label]) => ({ id, label: label.split(' ')[0] + '…' }))
  ]

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <div>
            <div className="modal-title">
              {isNew ? 'Ajouter un collaborateur' : `${collab.nom} ${collab.prenom}`}
            </div>
            <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 2 }}>
              {isNew ? 'Remplissez les informations ci-dessous' : 'Modifier le profil et les habilitations'}
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        {/* Tabs navigation */}
        <div style={{
          display: 'flex', gap: 0, borderBottom: '1px solid var(--border)',
          padding: '0 28px', overflowX: 'auto', flexShrink: 0,
        }}>
          {[
            { id: 'infos', label: '👤 Informations' },
            { id: 'csps',    label: '🎓 CSPS' },
            { id: 'secu',    label: '🦺 Sécurité' },
            { id: 'elec',    label: '⚡ Électrique' },
            { id: 'caces',   label: '🏗 CACES' },
            { id: 'risques', label: '☢ Risques' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                padding: '12px 16px',
                fontSize: 12.5, fontWeight: 600, fontFamily: 'inherit',
                color: activeTab === tab.id ? 'var(--accent)' : 'var(--ink-3)',
                borderBottom: `2px solid ${activeTab === tab.id ? 'var(--accent)' : 'transparent'}`,
                whiteSpace: 'nowrap',
                transition: 'all .15s',
                marginBottom: -1,
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="modal-body">
          {/* Tab: Informations */}
          {activeTab === 'infos' && (
            <div className="form-grid">
              {[
                { id: 'nom',    label: 'Nom *',       placeholder: 'DUPONT' },
                { id: 'prenom', label: 'Prénom *',    placeholder: 'Jean' },
                { id: 'poste',  label: 'Poste',       placeholder: 'CSPS Niveau 2' },
                { id: 'agence', label: 'Agence',      placeholder: '204C1' },
                { id: 'email',  label: 'Email',       placeholder: 'j.dupont@socotec.com' },
                { id: 'tel',    label: 'Téléphone',   placeholder: '06 …' },
              ].map(f => (
                <div className="form-group" key={f.id}>
                  <label className="form-label">{f.label}</label>
                  <input
                    className="form-input"
                    placeholder={f.placeholder}
                    value={form[f.id]}
                    onChange={e => setForm(p => ({ ...p, [f.id]: e.target.value }))}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Tabs: Habilitations par catégorie */}
          {['csps', 'secu', 'elec', 'caces', 'risques'].includes(activeTab) && (
            <div>
              <div style={{ marginBottom: 16, padding: '10px 14px', background: 'var(--accent-lt)', borderRadius: 8, fontSize: 12.5, color: 'var(--accent)', fontWeight: 500 }}>
                Renseignez uniquement les habilitations détenues. Les champs vides seront ignorés.
              </div>
              <div className="hab-grid">
                {(HABILITATIONS_DEF[activeTab] || []).map(def => (
                  <div className="hab-item" key={def.code}>
                    <div className="hab-item-name">{def.label}</div>
                    <div style={{ fontSize: 10, color: 'var(--ink-4)', marginBottom: 2 }}>
                      Recyclage tous les {def.recyclage} mois
                    </div>
                    <div className="hab-date-label">Date d'obtention</div>
                    <input
                      className="form-input"
                      type="date"
                      style={{ padding: '5px 8px', fontSize: 12 }}
                      value={habForm[def.code]?.date_obtention || ''}
                      onChange={e => setHab(def.code, 'date_obtention', e.target.value)}
                    />
                    <div className="hab-date-label" style={{ marginTop: 4 }}>Date d'échéance</div>
                    <input
                      className="form-input"
                      type="date"
                      style={{ padding: '5px 8px', fontSize: 12 }}
                      value={habForm[def.code]?.date_echeance || ''}
                      onChange={e => setHab(def.code, 'date_echeance', e.target.value)}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {error && <div className="error-msg">⚠ {error}</div>}
        </div>

        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>Annuler</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Enregistrement…' : (isNew ? '+ Créer le collaborateur' : 'Enregistrer les modifications')}
          </button>
        </div>
      </div>
    </div>
  )
}
