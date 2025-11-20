import { defineRouteConfig } from "@medusajs/admin-sdk"
import { useState, useEffect } from "react"
import { ImportConfigForm } from "./components/import-config-form"
import { FieldMappingEditor } from "./components/field-mapping-editor"

const XmlImporterPage = () => {
  const [activeTab, setActiveTab] = useState<'configs' | 'mappings' | 'imports'>('configs')
  const [configs, setConfigs] = useState<any[]>([])
  const [mappings, setMappings] = useState<any[]>([])
  const [imports, setImports] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [showConfigModal, setShowConfigModal] = useState(false)
  const [showMappingModal, setShowMappingModal] = useState(false)
  const [editingConfig, setEditingConfig] = useState<any>(null)
  const [editingMapping, setEditingMapping] = useState<any>(null)

  useEffect(() => {
    loadData()
  }, [activeTab])

  const loadData = async () => {
    setLoading(true)
    try {
      if (activeTab === 'configs') {
        const response = await fetch('/admin/xml-importer/configs')
        const data = await response.json()
        setConfigs(data.configs || [])
      } else if (activeTab === 'mappings') {
        const response = await fetch('/admin/xml-importer/mappings')
        const data = await response.json()
        setMappings(data.mappings || [])
      } else if (activeTab === 'imports') {
        const response = await fetch('/admin/xml-importer/imports')
        const data = await response.json()
        setImports(data.imports || [])
      }
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateConfig = () => {
    setEditingConfig(null)
    setShowConfigModal(true)
  }

  const handleEditConfig = (config: any) => {
    setEditingConfig(config)
    setShowConfigModal(true)
  }

  const handleSaveConfig = async (configData: any) => {
    try {
      const url = editingConfig 
        ? `/admin/xml-importer/configs/${editingConfig.id}`
        : '/admin/xml-importer/configs'
      const method = editingConfig ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(configData),
      })

      if (response.ok) {
        const data = await response.json()
        setShowConfigModal(false)
        setEditingConfig(null)
        loadData()
        console.log('Configuration saved successfully:', data.config)
      } else {
        const error = await response.json()
        console.error('Failed to save configuration:', error)
        alert(error.message || 'Failed to save configuration')
      }
    } catch (error) {
      console.error('Error saving config:', error)
      alert('Failed to save configuration: ' + (error instanceof Error ? error.message : 'Unknown error'))
    }
  }

  const handleDeleteConfig = async (id: string) => {
    if (!confirm('Are you sure you want to delete this configuration?')) return

    try {
      const response = await fetch(`/admin/xml-importer/configs/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        loadData()
      } else {
        alert('Failed to delete configuration')
      }
    } catch (error) {
      console.error('Error deleting config:', error)
      alert('Failed to delete configuration')
    }
  }

  const handleImportNow = async (configId: string) => {
    if (!confirm('Start import now? This will import products from the XML file.')) {
      return
    }

    try {
      const response = await fetch(`/admin/xml-importer/configs/${configId}/import`, {
        method: 'POST',
      })

      if (response.ok) {
        const data = await response.json()
        alert(`Import started! Execution ID: ${data.execution.id}\n\nYou can check the progress in the "Import History" tab.`)
        setActiveTab('imports')
        loadData()
      } else {
        const error = await response.json()
        alert(error.message || 'Failed to start import')
      }
    } catch (error) {
      console.error('Error starting import:', error)
      alert('Failed to start import: ' + (error instanceof Error ? error.message : 'Unknown error'))
    }
  }

  const handleCreateMapping = () => {
    setEditingMapping(null)
    setShowMappingModal(true)
  }

  const handleEditMapping = (mapping: any) => {
    setEditingMapping(mapping)
    setShowMappingModal(true)
  }

  const handleSaveMapping = async (mappingData: any) => {
    try {
      const url = editingMapping
        ? `/admin/xml-importer/mappings/${editingMapping.id}`
        : '/admin/xml-importer/mappings'
      const method = editingMapping ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mappingData),
      })

      if (response.ok) {
        const data = await response.json()
        setShowMappingModal(false)
        setEditingMapping(null)
        loadData()
        // Show success message
        console.log('Mapping saved successfully:', data.mapping)
      } else {
        const error = await response.json()
        console.error('Failed to save mapping:', error)
        alert(error.message || 'Failed to save mapping')
      }
    } catch (error) {
      console.error('Error saving mapping:', error)
      alert('Failed to save mapping')
    }
  }

  const handleDeleteMapping = async (id: string) => {
    if (!confirm('Are you sure you want to delete this mapping?')) return

    try {
      const response = await fetch(`/admin/xml-importer/mappings/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        loadData()
      } else {
        alert('Failed to delete mapping')
      }
    } catch (error) {
      console.error('Error deleting mapping:', error)
      alert('Failed to delete mapping')
    }
  }

  return (
    <div style={{ 
      padding: '32px',
      maxWidth: '1400px',
      margin: '0 auto'
    }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ 
          fontSize: '28px', 
          fontWeight: '600', 
          marginBottom: '8px',
          color: 'var(--fg-base)'
        }}>
          XML Product Importer
        </h1>
        <p style={{ 
          color: 'var(--fg-subtle)', 
          fontSize: '14px',
          lineHeight: '1.5'
        }}>
          Import products from XML files with field mapping and recurring import support
        </p>
      </div>

      {/* Tabs */}
      <div style={{ 
        display: 'flex', 
        gap: '4px', 
        borderBottom: '1px solid var(--border-base)',
        marginBottom: '32px'
      }}>
        <button
          onClick={() => setActiveTab('configs')}
          style={{
            padding: '12px 20px',
            border: 'none',
            background: 'transparent',
            color: activeTab === 'configs' ? 'var(--fg-base)' : 'var(--fg-subtle)',
            cursor: 'pointer',
            borderBottom: activeTab === 'configs' ? '2px solid var(--fg-base)' : '2px solid transparent',
            marginBottom: '-1px',
            fontSize: '14px',
            fontWeight: activeTab === 'configs' ? '500' : '400',
            transition: 'all 0.2s'
          }}
        >
          Import Configurations
        </button>
        <button
          onClick={() => setActiveTab('mappings')}
          style={{
            padding: '12px 20px',
            border: 'none',
            background: 'transparent',
            color: activeTab === 'mappings' ? 'var(--fg-base)' : 'var(--fg-subtle)',
            cursor: 'pointer',
            borderBottom: activeTab === 'mappings' ? '2px solid var(--fg-base)' : '2px solid transparent',
            marginBottom: '-1px',
            fontSize: '14px',
            fontWeight: activeTab === 'mappings' ? '500' : '400',
            transition: 'all 0.2s'
          }}
        >
          Saved Mappings
        </button>
        <button
          onClick={() => setActiveTab('imports')}
          style={{
            padding: '12px 20px',
            border: 'none',
            background: 'transparent',
            color: activeTab === 'imports' ? 'var(--fg-base)' : 'var(--fg-subtle)',
            cursor: 'pointer',
            borderBottom: activeTab === 'imports' ? '2px solid var(--fg-base)' : '2px solid transparent',
            marginBottom: '-1px',
            fontSize: '14px',
            fontWeight: activeTab === 'imports' ? '500' : '400',
            transition: 'all 0.2s'
          }}
        >
          Import History
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ 
          padding: '48px', 
          textAlign: 'center',
          color: 'var(--fg-subtle)'
        }}>
          Loading...
        </div>
      ) : (
        <>
          {/* Configurations Tab */}
          {activeTab === 'configs' && (
            <div>
              <div style={{ 
                marginBottom: '24px', 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center' 
              }}>
                <h2 style={{ 
                  fontSize: '20px', 
                  fontWeight: '600',
                  color: 'var(--fg-base)'
                }}>
                  Import Configurations
                </h2>
                <button
                  onClick={handleCreateConfig}
                  style={{
                    padding: '10px 20px',
                    background: 'var(--button-primary-bg)',
                    color: 'var(--button-primary-fg)',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                    transition: 'opacity 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
                  onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                >
                  Create Configuration
                </button>
              </div>
              {configs.length === 0 ? (
                <div style={{ 
                  padding: '48px', 
                  textAlign: 'center',
                  background: 'var(--bg-subtle)',
                  borderRadius: '8px',
                  border: '1px dashed var(--border-base)'
                }}>
                  <p style={{ 
                    color: 'var(--fg-subtle)', 
                    fontSize: '14px',
                    marginBottom: '16px'
                  }}>
                  No import configurations found. Create one to get started.
                  </p>
                </div>
              ) : (
                <div style={{ display: 'grid', gap: '16px' }}>
                  {configs.map((config) => (
                    <div
                      key={config.id}
                      style={{
                        padding: '20px',
                        border: '1px solid var(--border-base)',
                        borderRadius: '8px',
                        background: 'var(--bg-base)',
                        transition: 'box-shadow 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)'}
                      onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                        <div style={{ flex: 1 }}>
                          <h3 style={{ 
                            fontSize: '16px', 
                            fontWeight: '600',
                            marginBottom: '8px',
                            color: 'var(--fg-base)'
                          }}>
                        {config.name}
                      </h3>
                          <p style={{ 
                            color: 'var(--fg-subtle)', 
                            fontSize: '14px', 
                            marginBottom: '8px',
                            lineHeight: '1.5'
                          }}>
                        {config.description || 'No description'}
                      </p>
                          {config.xmlUrl && (
                            <p style={{ 
                              color: 'var(--fg-muted)', 
                              fontSize: '12px',
                              fontFamily: 'monospace',
                              wordBreak: 'break-all'
                            }}>
                              {config.xmlUrl}
                            </p>
                          )}
                        </div>
                        {config.enabled !== false && (
                          <span style={{
                            padding: '4px 12px',
                            borderRadius: '12px',
                            fontSize: '12px',
                            fontWeight: '500',
                            background: 'var(--tag-green-bg)',
                            color: 'var(--tag-green-text)'
                          }}>
                            Active
                          </span>
                        )}
                      </div>
                      <div style={{ 
                        display: 'flex', 
                        gap: '8px', 
                        marginTop: '16px',
                        paddingTop: '16px',
                        borderTop: '1px solid var(--border-base)'
                      }}>
                        <button
                          onClick={() => handleEditConfig(config)}
                          style={{
                            padding: '8px 16px',
                            background: 'transparent',
                            color: 'var(--fg-base)',
                            border: '1px solid var(--border-base)',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: '500',
                            transition: 'all 0.2s'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'var(--bg-subtle)'
                            e.currentTarget.style.borderColor = 'var(--border-strong)'
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent'
                            e.currentTarget.style.borderColor = 'var(--border-base)'
                          }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleImportNow(config.id)}
                          style={{
                            padding: '8px 16px',
                            background: 'var(--button-primary-bg)',
                            color: 'var(--button-primary-fg)',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: '500',
                            transition: 'opacity 0.2s'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
                          onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                          title="Run a one-time import using this configuration"
                        >
                          Run Import Now
                        </button>
                        <button
                          onClick={() => handleDeleteConfig(config.id)}
                          style={{
                            padding: '8px 16px',
                            background: 'transparent',
                            color: 'var(--fg-destructive)',
                            border: '1px solid var(--border-destructive)',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: '500',
                            transition: 'all 0.2s',
                            marginLeft: 'auto'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'var(--bg-destructive-subtle)'
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent'
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Mappings Tab */}
          {activeTab === 'mappings' && (
            <div>
              <div style={{ 
                marginBottom: '24px', 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center' 
              }}>
                <h2 style={{ 
                  fontSize: '20px', 
                  fontWeight: '600',
                  color: 'var(--fg-base)'
                }}>
                  Saved Mappings
                </h2>
                <button
                  onClick={handleCreateMapping}
                  style={{
                    padding: '10px 20px',
                    background: 'var(--button-primary-bg)',
                    color: 'var(--button-primary-fg)',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                    transition: 'opacity 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
                  onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                >
                  Create Mapping
                </button>
              </div>
              {mappings.length === 0 ? (
                <div style={{ 
                  padding: '48px', 
                  textAlign: 'center',
                  background: 'var(--bg-subtle)',
                  borderRadius: '8px',
                  border: '1px dashed var(--border-base)'
                }}>
                  <p style={{ 
                    color: 'var(--fg-subtle)', 
                    fontSize: '14px'
                  }}>
                  No saved mappings found. Create one to get started.
                  </p>
                </div>
              ) : (
                <div style={{ display: 'grid', gap: '16px' }}>
                  {mappings.map((mapping) => (
                    <div
                      key={mapping.id}
                      style={{
                        padding: '20px',
                        border: '1px solid var(--border-base)',
                        borderRadius: '8px',
                        background: 'var(--bg-base)',
                        transition: 'box-shadow 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)'}
                      onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
                    >
                      <h3 style={{ 
                        fontSize: '16px', 
                        fontWeight: '600',
                        marginBottom: '8px',
                        color: 'var(--fg-base)'
                      }}>
                        {mapping.name}
                      </h3>
                      <p style={{ 
                        color: 'var(--fg-subtle)', 
                        fontSize: '14px', 
                        marginBottom: '8px',
                        lineHeight: '1.5'
                      }}>
                        {mapping.description || 'No description'}
                      </p>
                      <p style={{ 
                        color: 'var(--fg-muted)', 
                        fontSize: '12px',
                        marginBottom: '16px'
                      }}>
                        {mapping.mappings?.length || 0} field mappings
                      </p>
                      <div style={{ 
                        display: 'flex', 
                        gap: '8px',
                        paddingTop: '16px',
                        borderTop: '1px solid var(--border-base)'
                      }}>
                        <button
                          onClick={() => handleEditMapping(mapping)}
                          style={{
                            padding: '8px 16px',
                            background: 'transparent',
                            color: 'var(--fg-base)',
                            border: '1px solid var(--border-base)',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: '500',
                            transition: 'all 0.2s'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'var(--bg-subtle)'
                            e.currentTarget.style.borderColor = 'var(--border-strong)'
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent'
                            e.currentTarget.style.borderColor = 'var(--border-base)'
                          }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteMapping(mapping.id)}
                          style={{
                            padding: '8px 16px',
                            background: 'transparent',
                            color: 'var(--fg-destructive)',
                            border: '1px solid var(--border-destructive)',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: '500',
                            transition: 'all 0.2s',
                            marginLeft: 'auto'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'var(--bg-destructive-subtle)'
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent'
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Import History Tab */}
          {activeTab === 'imports' && (
            <div>
              <h2 style={{ 
                fontSize: '20px', 
                fontWeight: '600', 
                marginBottom: '24px',
                color: 'var(--fg-base)'
              }}>
                Import History
              </h2>
              {imports.length === 0 ? (
                <div style={{ 
                  padding: '48px', 
                  textAlign: 'center',
                  background: 'var(--bg-subtle)',
                  borderRadius: '8px',
                  border: '1px dashed var(--border-base)'
                }}>
                  <p style={{ 
                    color: 'var(--fg-subtle)', 
                    fontSize: '14px'
                  }}>
                  No import executions found.
                  </p>
                </div>
              ) : (
                <div style={{ display: 'grid', gap: '16px' }}>
                  {imports.map((importExecution) => (
                    <div
                      key={importExecution.id}
                      style={{
                        padding: '20px',
                        border: '1px solid var(--border-base)',
                        borderRadius: '8px',
                        background: 'var(--bg-base)',
                        transition: 'box-shadow 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)'}
                      onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
                    >
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'start', 
                        marginBottom: '16px' 
                      }}>
                        <div>
                          <h3 style={{ 
                            fontSize: '16px', 
                            fontWeight: '600',
                            marginBottom: '4px',
                            color: 'var(--fg-base)'
                          }}>
                            Import #{importExecution.id.slice(-8)}
                        </h3>
                          {importExecution.createdAt && (
                            <p style={{ 
                              fontSize: '12px',
                              color: 'var(--fg-muted)'
                            }}>
                              {new Date(importExecution.createdAt).toLocaleString()}
                            </p>
                          )}
                        </div>
                        <span
                          style={{
                            padding: '6px 12px',
                            borderRadius: '12px',
                            fontSize: '12px',
                            fontWeight: '500',
                            background:
                              importExecution.status === 'completed'
                                ? 'var(--tag-green-bg)'
                                : importExecution.status === 'failed'
                                ? 'var(--tag-red-bg)'
                                : 'var(--tag-blue-bg)',
                            color:
                              importExecution.status === 'completed'
                                ? 'var(--tag-green-text)'
                                : importExecution.status === 'failed'
                                ? 'var(--tag-red-text)'
                                : 'var(--tag-blue-text)',
                          }}
                        >
                          {importExecution.status}
                        </span>
                      </div>
                      <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(3, 1fr)', 
                        gap: '16px',
                        paddingTop: '16px',
                        borderTop: '1px solid var(--border-base)'
                      }}>
                        <div>
                          <p style={{ 
                            fontSize: '12px', 
                            color: 'var(--fg-subtle)', 
                            marginBottom: '4px' 
                          }}>
                            Total Products
                          </p>
                          <p style={{ 
                            fontSize: '18px', 
                            fontWeight: '600',
                            color: 'var(--fg-base)'
                          }}>
                            {importExecution.totalProducts || 0}
                          </p>
                        </div>
                        <div>
                          <p style={{ 
                            fontSize: '12px', 
                            color: 'var(--fg-subtle)', 
                            marginBottom: '4px' 
                          }}>
                            Successful
                          </p>
                          <p style={{ 
                            fontSize: '18px', 
                            fontWeight: '600', 
                            color: 'var(--fg-success)'
                          }}>
                            {importExecution.successfulProducts || 0}
                          </p>
                        </div>
                        <div>
                          <p style={{ 
                            fontSize: '12px', 
                            color: 'var(--fg-subtle)', 
                            marginBottom: '4px' 
                          }}>
                            Failed
                          </p>
                          <p style={{ 
                            fontSize: '18px', 
                            fontWeight: '600', 
                            color: 'var(--fg-destructive)'
                          }}>
                            {importExecution.failedProducts || 0}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Config Modal */}
      {showConfigModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }} onClick={() => setShowConfigModal(false)}>
          <div style={{
            background: '#1F2937',
            borderRadius: '8px',
            maxWidth: '600px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)'
          }} onClick={(e) => e.stopPropagation()}>
            <ImportConfigForm
              config={editingConfig}
              mappings={mappings}
              onSave={handleSaveConfig}
              onCancel={() => {
                setShowConfigModal(false)
                setEditingConfig(null)
              }}
            />
          </div>
        </div>
      )}

      {/* Mapping Modal */}
      {showMappingModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }} onClick={() => setShowMappingModal(false)}>
          <div style={{
            background: '#1F2937',
            borderRadius: '8px',
            maxWidth: '800px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)'
          }} onClick={(e) => e.stopPropagation()}>
            <FieldMappingEditor
              mapping={editingMapping}
              onSave={handleSaveMapping}
              onPreview={() => {}}
              onCancel={() => {
                setShowMappingModal(false)
                setEditingMapping(null)
              }}
            />
          </div>
        </div>
      )}
    </div>
  )
}

export const config = defineRouteConfig({
  label: "XML Importer",
})

export default XmlImporterPage
