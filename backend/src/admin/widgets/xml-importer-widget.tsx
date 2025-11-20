import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { useState, useEffect } from "react"

const XmlImporterWidget = () => {
  const [recentImports, setRecentImports] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadRecentImports()
  }, [])

  const loadRecentImports = async () => {
    setLoading(true)
    try {
      const response = await fetch('/admin/xml-importer/imports?limit=5')
      const data = await response.json()
      setRecentImports(data.imports || [])
    } catch (error) {
      console.error('Error loading recent imports:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: '16px', background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '8px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '600' }}>Recent XML Imports</h3>
        <a
          href="/xml-importer"
          style={{
            fontSize: '14px',
            color: '#3B82F6',
            textDecoration: 'none'
          }}
        >
          View All
        </a>
      </div>

      {loading ? (
        <p style={{ fontSize: '14px', color: '#6B7280' }}>Loading...</p>
      ) : recentImports.length === 0 ? (
        <p style={{ fontSize: '14px', color: '#6B7280' }}>No recent imports</p>
      ) : (
        <div style={{ display: 'grid', gap: '8px' }}>
          {recentImports.map((importExecution) => (
            <div
              key={importExecution.id}
              style={{
                padding: '8px',
                background: '#F9FAFB',
                borderRadius: '4px',
                fontSize: '12px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: '500' }}>Import #{importExecution.id.slice(-8)}</span>
                <span
                  style={{
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontSize: '10px',
                    fontWeight: '500',
                    background:
                      importExecution.status === 'completed'
                        ? '#D1FAE5'
                        : importExecution.status === 'failed'
                        ? '#FEE2E2'
                        : '#DBEAFE',
                    color:
                      importExecution.status === 'completed'
                        ? '#065F46'
                        : importExecution.status === 'failed'
                        ? '#991B1B'
                        : '#1E40AF',
                  }}
                >
                  {importExecution.status}
                </span>
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '4px', color: '#6B7280' }}>
                <span>{importExecution.successfulProducts || 0} successful</span>
                {importExecution.failedProducts > 0 && (
                  <span style={{ color: '#EF4444' }}>{importExecution.failedProducts} failed</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export const config = defineWidgetConfig({
  zone: "product.list.before",
})

export default XmlImporterWidget

