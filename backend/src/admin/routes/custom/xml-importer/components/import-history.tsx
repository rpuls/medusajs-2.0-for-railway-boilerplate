import { useState, useEffect } from "react"

export const ImportHistory = () => {
  const [imports, setImports] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadImports()
  }, [])

  const loadImports = async () => {
    setLoading(true)
    try {
      // Only fetch the last 10 imports
      const response = await fetch('/admin/xml-importer/imports?limit=10&offset=0')
      const data = await response.json()
      setImports(data.imports || [])
    } catch (error) {
      console.error('Error loading imports:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return { bg: '#D1FAE5', text: '#065F46' }
      case 'failed':
        return { bg: '#FEE2E2', text: '#991B1B' }
      case 'processing':
        return { bg: '#DBEAFE', text: '#1E40AF' }
      case 'pending':
        return { bg: '#FEF3C7', text: '#92400E' }
      default:
        return { bg: '#F3F4F6', text: '#6B7280' }
    }
  }

  if (loading) {
    return <div style={{ padding: '24px', textAlign: 'center' }}>Loading...</div>
  }

  if (imports.length === 0) {
    return (
      <div style={{ padding: '24px', textAlign: 'center', color: '#6B7280' }}>
        No import executions found.
      </div>
    )
  }

  return (
    <div style={{ display: 'grid', gap: '16px' }}>
      {imports.map((importExecution) => {
        const statusColors = getStatusColor(importExecution.status)
        return (
          <div
            key={importExecution.id}
            style={{
              padding: '16px',
              border: '1px solid #E5E7EB',
              borderRadius: '8px',
              background: '#FFFFFF'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '4px' }}>
                  Import #{importExecution.id}
                </h3>
                <p style={{ fontSize: '12px', color: '#6B7280' }}>
                  Started: {importExecution.startedAt ? new Date(importExecution.startedAt).toLocaleString() : 'N/A'}
                  {importExecution.completedAt && (
                    <> • Completed: {new Date(importExecution.completedAt).toLocaleString()}</>
                  )}
                </p>
              </div>
              <span
                style={{
                  padding: '4px 12px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: '500',
                  background: statusColors.bg,
                  color: statusColors.text,
                }}
              >
                {importExecution.status}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginTop: '12px' }}>
              <div>
                <p style={{ fontSize: '12px', color: '#6B7280', marginBottom: '4px' }}>Total</p>
                <p style={{ fontSize: '18px', fontWeight: '600' }}>{importExecution.totalProducts || 0}</p>
              </div>
              <div>
                <p style={{ fontSize: '12px', color: '#6B7280', marginBottom: '4px' }}>Processed</p>
                <p style={{ fontSize: '18px', fontWeight: '600' }}>
                  {importExecution.processedProducts || 0}
                </p>
              </div>
              <div>
                <p style={{ fontSize: '12px', color: '#6B7280', marginBottom: '4px' }}>Successful</p>
                <p style={{ fontSize: '18px', fontWeight: '600', color: '#10B981' }}>
                  {importExecution.successfulProducts || 0}
                </p>
              </div>
              <div>
                <p style={{ fontSize: '12px', color: '#6B7280', marginBottom: '4px' }}>Failed</p>
                <p style={{ fontSize: '18px', fontWeight: '600', color: '#EF4444' }}>
                  {importExecution.failedProducts || 0}
                </p>
              </div>
            </div>

            {importExecution.error && (
              <div style={{ marginTop: '12px', padding: '12px', background: '#FEE2E2', borderRadius: '4px' }}>
                <p style={{ fontSize: '12px', color: '#991B1B', fontWeight: '600', marginBottom: '4px' }}>
                  Error:
                </p>
                <p style={{ fontSize: '12px', color: '#991B1B' }}>{importExecution.error}</p>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

