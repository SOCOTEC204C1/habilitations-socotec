import { useEffect, useRef } from 'react'
import QRCode from 'qrcode'

export default function QRModal({ collab, onClose }) {
  const canvasRef = useRef(null)
  const appUrl = import.meta.env.VITE_APP_URL || window.location.origin
  const ficheUrl = `${appUrl}/fiche/${collab.id}`

  useEffect(() => {
    if (canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, ficheUrl, {
        width: 240,
        margin: 2,
        color: { dark: '#0F172A', light: '#ffffff' },
        errorCorrectionLevel: 'H',
      })
    }
  }, [ficheUrl])

  function download() {
    const url = canvasRef.current.toDataURL('image/png')
    const a = document.createElement('a')
    a.href = url
    a.download = `QR_${collab.nom}_${collab.prenom}.png`
    a.click()
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ width: 400 }}>
        <div className="modal-header">
          <div>
            <div className="modal-title">QR Code</div>
            <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 2 }}>
              {collab.nom} {collab.prenom}
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <div className="qr-wrap">
            <div className="qr-box">
              <canvas ref={canvasRef} />
            </div>
            <div className="qr-url">{ficheUrl}</div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-primary btn-sm" onClick={download}>
                ⬇ Télécharger PNG
              </button>
              <button className="btn btn-ghost btn-sm" onClick={() => {
                navigator.clipboard.writeText(ficheUrl)
              }}>
                📋 Copier l'URL
              </button>
            </div>
            <div style={{ fontSize: 12, color: 'var(--ink-4)', textAlign: 'center', lineHeight: 1.6 }}>
              Ce QR code donne accès à la fiche individuelle en lecture seule.<br/>
              Aucun mot de passe requis.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
