'use client'

import { useState, useRef } from 'react'
import { IconUpload, IconX } from '@tabler/icons-react'

interface ImportModalProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function ImportModal({ open, onClose, onSuccess }: ImportModalProps) {
  const [file, setFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string>('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      if (selectedFile.type !== 'application/pdf' && selectedFile.type !== 'text/csv') {
        setError('Format non supporté. Accepte PDF ou CSV.')
        return
      }
      setFile(selectedFile)
      setError('')
    }
  }

  const handleUpload = async () => {
    if (!file) return

    setIsLoading(true)
    setError('')

    try {
      const formData = new FormData()
      formData.append('file', file)

      console.log('[import] uploading file:', file.name)

      const response = await fetch('/api/health/import', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Erreur lors de l\'import')
      }

      console.log('[import] success:', result)
      setFile(null)
      onSuccess()
      onClose()
    } catch (err) {
      console.error('[import] error:', err)
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'import')
    } finally {
      setIsLoading(false)
    }
  }

  if (!open) return null

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: 12,
          padding: 32,
          maxWidth: 400,
          width: '90%',
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 style={{ fontSize: 20, fontWeight: 600, margin: 0 }}>Importer tes données</h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <IconX size={20} />
          </button>
        </div>

        {/* File upload area */}
        <div
          onClick={() => fileInputRef.current?.click()}
          style={{
            border: '2px dashed var(--color-line)',
            borderRadius: 8,
            padding: 32,
            textAlign: 'center',
            cursor: 'pointer',
            marginBottom: 16,
            backgroundColor: file ? 'var(--color-surface)' : 'transparent',
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-ink-2)'
            ;(e.currentTarget as HTMLElement).style.backgroundColor = 'var(--color-surface-2)'
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-line)'
            ;(e.currentTarget as HTMLElement).style.backgroundColor = file ? 'var(--color-surface)' : 'transparent'
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.csv"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />

          {file ? (
            <div>
              <p style={{ margin: '8px 0 0 0', fontSize: 14, color: 'var(--color-ink)' }}>{file.name}</p>
              <p style={{ margin: '4px 0 0 0', fontSize: 12, color: 'var(--color-ink-3)' }}>
                {(file.size / 1024).toFixed(1)} KB
              </p>
            </div>
          ) : (
            <div>
              <IconUpload size={32} color="var(--color-ink-3)" style={{ margin: '0 auto 12px' }} />
              <p style={{ margin: 0, fontSize: 14, fontWeight: 500, color: 'var(--color-ink)' }}>
                Clique pour sélectionner
              </p>
              <p style={{ margin: '4px 0 0 0', fontSize: 12, color: 'var(--color-ink-4)' }}>
                PDF ou CSV (max 10 MB)
              </p>
            </div>
          )}
        </div>

        {error && <p style={{ color: 'var(--color-rust)', fontSize: 12, marginBottom: 16 }}>{error}</p>}

        {/* Buttons */}
        <div style={{ display: 'flex', gap: 12 }}>
          <button
            onClick={onClose}
            disabled={isLoading}
            style={{
              flex: 1,
              padding: '10px 16px',
              border: '1px solid var(--color-line)',
              borderRadius: 8,
              backgroundColor: 'white',
              cursor: 'pointer',
              fontSize: 14,
              fontWeight: 500,
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--color-surface)'
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.backgroundColor = 'white'
            }}
          >
            Annuler
          </button>
          <button
            onClick={handleUpload}
            disabled={!file || isLoading}
            style={{
              flex: 1,
              padding: '10px 16px',
              border: 'none',
              borderRadius: 8,
              backgroundColor: file && !isLoading ? 'black' : 'var(--color-surface-2)',
              color: file && !isLoading ? 'white' : 'var(--color-ink-3)',
              cursor: file && !isLoading ? 'pointer' : 'not-allowed',
              fontSize: 14,
              fontWeight: 500,
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => {
              if (file && !isLoading) {
                (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--color-ink)'
              }
            }}
            onMouseLeave={e => {
              if (file && !isLoading) {
                (e.currentTarget as HTMLElement).style.backgroundColor = 'black'
              }
            }}
          >
            {isLoading ? 'Import...' : 'Importer'}
          </button>
        </div>
      </div>
    </div>
  )
}
