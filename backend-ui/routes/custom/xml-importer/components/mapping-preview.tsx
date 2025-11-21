import { useState, useEffect } from "react"

interface MappingPreviewProps {
  xmlUrl: string
  mapping: any
  onClose: () => void
}

export const MappingPreview = ({ xmlUrl, mapping, onClose }: MappingPreviewProps) => {
  const [preview, setPreview] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadPreview()
  }, [xmlUrl, mapping])

  const loadPreview = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/admin/xml-importer/field-mapping/preview', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          xmlUrl,
          mapping,
          sampleSize: 3,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || 'Failed to load preview')
      }

      const data = await response.json()
      setPreview(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <p>Loading preview...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ padding: '24px' }}>
        <div style={{ padding: '16px', background: '#FEE2E2', borderRadius: '8px', marginBottom: '16px' }}>
          <p style={{ color: '#991B1B', fontSize: '14px' }}>Error: {error}</p>
        </div>
        <button
          onClick={onClose}
          style={{
            padding: '10px 20px',
            background: '#111827',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          Close
        </button>
      </div>
    )
  }

  if (!preview) {
    return null
  }

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '600' }}>Mapping Preview</h2>
        <button
          onClick={onClose}
          style={{
            padding: '8px 16px',
            background: '#FFFFFF',
            color: '#111827',
            border: '1px solid #D1D5DB',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          Close
        </button>
      </div>

      {preview.totalProducts !== undefined && (
        <div style={{ padding: '12px', background: '#DBEAFE', borderRadius: '8px', marginBottom: '24px' }}>
          <p style={{ fontSize: '14px', color: '#1E40AF' }}>
            Found {preview.totalProducts} products in XML. Showing preview of {preview.sampleProducts?.length || 0} products.
          </p>
        </div>
      )}

      {preview.errors && preview.errors.length > 0 && (
        <div style={{ padding: '16px', background: '#FEE2E2', borderRadius: '8px', marginBottom: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px', color: '#991B1B' }}>
            Errors
          </h3>
          <ul style={{ listStyle: 'disc', paddingLeft: '20px' }}>
            {preview.errors.map((err: string, index: number) => (
              <li key={index} style={{ color: '#991B1B', fontSize: '14px', marginBottom: '4px' }}>
                {err}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div style={{ display: 'grid', gap: '24px' }}>
        {preview.sampleProducts?.map((product: any, index: number) => (
          <div
            key={index}
            style={{
              border: '1px solid #E5E7EB',
              borderRadius: '8px',
              overflow: 'hidden'
            }}
          >
            <div style={{ padding: '12px', background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600' }}>Product {index + 1}</h3>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0' }}>
              <div style={{ padding: '16px', borderRight: '1px solid #E5E7EB' }}>
                <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px', color: '#6B7280' }}>
                  Original XML
                </h4>
                <pre
                  style={{
                    background: '#F9FAFB',
                    padding: '12px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    overflow: 'auto',
                    maxHeight: '400px',
                    margin: 0
                  }}
                >
                  {JSON.stringify(product.original, null, 2)}
                </pre>
              </div>
              <div style={{ padding: '16px' }}>
                <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px', color: '#6B7280' }}>
                  Mapped Output
                </h4>
                {product.errors && product.errors.length > 0 && (
                  <div style={{ padding: '8px', background: '#FEE2E2', borderRadius: '4px', marginBottom: '12px' }}>
                    <p style={{ fontSize: '12px', color: '#991B1B', fontWeight: '600', marginBottom: '4px' }}>
                      Validation Errors:
                    </p>
                    <ul style={{ listStyle: 'disc', paddingLeft: '20px', margin: 0 }}>
                      {product.errors.map((err: string, errIndex: number) => (
                        <li key={errIndex} style={{ fontSize: '12px', color: '#991B1B' }}>
                          {err}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <pre
                  style={{
                    background: '#F9FAFB',
                    padding: '12px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    overflow: 'auto',
                    maxHeight: '400px',
                    margin: 0
                  }}
                >
                  {JSON.stringify(product.mapped, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

