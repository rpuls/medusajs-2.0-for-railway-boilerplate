import { useState, useEffect } from "react"

interface ImportStatusProps {
  executionId: string
}

export const ImportStatus = ({ executionId }: ImportStatusProps) => {
  const [status, setStatus] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const interval = setInterval(() => {
      loadStatus()
    }, 2000) // Poll every 2 seconds

    loadStatus()

    return () => clearInterval(interval)
  }, [executionId])

  const loadStatus = async () => {
    try {
      const response = await fetch(`/admin/xml-importer/imports/${executionId}/status`)
      if (response.ok) {
        const data = await response.json()
        setStatus(data)
        setLoading(false)

        // Stop polling if completed or failed
        if (data.status === 'completed' || data.status === 'failed') {
          // Will be cleared by useEffect cleanup
        }
      }
    } catch (error) {
      console.error('Error loading status:', error)
      setLoading(false)
    }
  }

  if (loading && !status) {
    return (
      <div style={{ padding: '16px', textAlign: 'center' }}>
        <p>Loading status...</p>
      </div>
    )
  }

  if (!status) {
    return (
      <div style={{ padding: '16px', textAlign: 'center', color: '#6B7280' }}>
        Status not found
      </div>
    )
  }

  const progress = status.totalProducts
    ? Math.round((status.processedProducts || 0) / status.totalProducts * 100)
    : 0

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return '#10B981'
      case 'failed':
        return '#EF4444'
      case 'processing':
        return '#3B82F6'
      case 'pending':
        return '#F59E0B'
      default:
        return '#6B7280'
    }
  }

  return (
    <div style={{ padding: '16px', border: '1px solid #E5E7EB', borderRadius: '8px', background: '#FFFFFF' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '600' }}>Import Status</h3>
        <span
          style={{
            padding: '4px 12px',
            borderRadius: '12px',
            fontSize: '12px',
            fontWeight: '500',
            background: `${getStatusColor(status.status)}20`,
            color: getStatusColor(status.status),
          }}
        >
          {status.status}
        </span>
      </div>

      {status.totalProducts && (
        <div style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '14px', color: '#6B7280' }}>Progress</span>
            <span style={{ fontSize: '14px', fontWeight: '600' }}>{progress}%</span>
          </div>
          <div
            style={{
              width: '100%',
              height: '8px',
              background: '#E5E7EB',
              borderRadius: '4px',
              overflow: 'hidden'
            }}
          >
            <div
              style={{
                width: `${progress}%`,
                height: '100%',
                background: getStatusColor(status.status),
                transition: 'width 0.3s ease'
              }}
            />
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
        <div>
          <p style={{ fontSize: '12px', color: '#6B7280', marginBottom: '4px' }}>Total Products</p>
          <p style={{ fontSize: '18px', fontWeight: '600' }}>{status.totalProducts || 0}</p>
        </div>
        <div>
          <p style={{ fontSize: '12px', color: '#6B7280', marginBottom: '4px' }}>Processed</p>
          <p style={{ fontSize: '18px', fontWeight: '600' }}>{status.processedProducts || 0}</p>
        </div>
        <div>
          <p style={{ fontSize: '12px', color: '#6B7280', marginBottom: '4px' }}>Successful</p>
          <p style={{ fontSize: '18px', fontWeight: '600', color: '#10B981' }}>
            {status.successfulProducts || 0}
          </p>
        </div>
        <div>
          <p style={{ fontSize: '12px', color: '#6B7280', marginBottom: '4px' }}>Failed</p>
          <p style={{ fontSize: '18px', fontWeight: '600', color: '#EF4444' }}>
            {status.failedProducts || 0}
          </p>
        </div>
      </div>

      {status.error && (
        <div style={{ marginTop: '16px', padding: '12px', background: '#FEE2E2', borderRadius: '4px' }}>
          <p style={{ fontSize: '12px', color: '#991B1B', fontWeight: '600', marginBottom: '4px' }}>
            Error:
          </p>
          <p style={{ fontSize: '12px', color: '#991B1B' }}>{status.error}</p>
        </div>
      )}
    </div>
  )
}

