import { useState, useEffect } from "react"

interface ImportConfigFormProps {
  config?: any
  mappings: any[]
  onSave: (config: any) => void
  onCancel: () => void
}

export const ImportConfigForm = ({ config, mappings, onSave, onCancel }: ImportConfigFormProps) => {
  const [shippingProfiles, setShippingProfiles] = useState<Array<{ id: string; name: string; type: string }>>([])
  const [loadingProfiles, setLoadingProfiles] = useState(false)
  
  const [formData, setFormData] = useState({
    name: config?.name || '',
    description: config?.description || '',
    xmlUrl: config?.xmlUrl || '',
    mappingId: config?.mappingId || '',
    shippingProfileId: config?.shippingProfileId || '',
    enabled: config?.enabled ?? true,
    options: {
      batchSize: config?.options?.batchSize || 100,
      updateExisting: config?.options?.updateExisting || false,
      updateBy: config?.options?.updateBy || 'sku',
      skipErrors: config?.options?.skipErrors ?? true,
    },
    recurring: {
      enabled: config?.recurring?.enabled || false,
      schedule: config?.recurring?.schedule || '0 0 * * *',
      timezone: config?.recurring?.timezone || 'UTC',
    },
  })

  useEffect(() => {
    loadShippingProfiles()
  }, [])

  const loadShippingProfiles = async () => {
    setLoadingProfiles(true)
    try {
      const response = await fetch('/admin/xml-importer/shipping-profiles')
      if (response.ok) {
        const data = await response.json()
        setShippingProfiles(data.shippingProfiles || [])
      }
    } catch (err) {
      console.error('Failed to load shipping profiles:', err)
    } finally {
      setLoadingProfiles(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  const inputStyle = {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '6px',
    fontSize: '14px',
    background: 'rgba(255, 255, 255, 0.05)',
    color: 'rgba(255, 255, 255, 0.9)',
    boxSizing: 'border-box' as const,
    outline: 'none',
  }

  const labelStyle = {
    display: 'block' as const,
    marginBottom: '8px',
    fontSize: '14px',
    fontWeight: '500' as const,
    color: 'rgba(255, 255, 255, 0.8)',
  }

  const sectionStyle = {
    padding: '16px',
    background: 'rgba(255, 255, 255, 0.03)',
    borderRadius: '8px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
  }

  return (
    <form onSubmit={handleSubmit} style={{ padding: '24px', color: 'rgba(255, 255, 255, 0.9)' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '24px',
        paddingBottom: '16px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <h2 style={{ 
          fontSize: '20px', 
          fontWeight: '600',
          color: 'rgba(255, 255, 255, 0.95)',
          margin: 0
        }}>
        {config ? 'Edit' : 'Create'} Import Configuration
      </h2>
        <button
          type="button"
          onClick={onCancel}
          style={{
            background: 'transparent',
            border: 'none',
            fontSize: '24px',
            cursor: 'pointer',
            color: 'rgba(255, 255, 255, 0.6)',
            padding: '0',
            width: '28px',
            height: '28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '4px',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
            e.currentTarget.style.color = 'rgba(255, 255, 255, 0.9)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent'
            e.currentTarget.style.color = 'rgba(255, 255, 255, 0.6)'
          }}
        >
          ×
        </button>
      </div>

      <div style={{ display: 'grid', gap: '20px' }}>
        <div>
          <label style={labelStyle}>
            Name *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            style={inputStyle}
            onFocus={(e) => e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)'}
            onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
          />
        </div>

        <div>
          <label style={labelStyle}>
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
            style={{
              ...inputStyle,
              resize: 'vertical' as const,
              fontFamily: 'inherit'
            }}
            onFocus={(e) => e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)'}
            onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
          />
        </div>

        <div>
          <label style={labelStyle}>
            XML URL *
          </label>
          <input
            type="url"
            value={formData.xmlUrl}
            onChange={(e) => setFormData({ ...formData, xmlUrl: e.target.value })}
            required
            placeholder="https://example.com/products.xml"
            style={inputStyle}
            onFocus={(e) => e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)'}
            onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
          />
        </div>

        <div>
          <label style={labelStyle}>
            Field Mapping *
          </label>
          <select
            value={formData.mappingId}
            onChange={(e) => setFormData({ ...formData, mappingId: e.target.value })}
            required
            style={{
              ...inputStyle,
              background: '#1F2937',
              color: 'rgba(255, 255, 255, 0.9)',
              cursor: 'pointer',
            }}
            onFocus={(e) => e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)'}
            onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
          >
            <option value="" style={{ background: '#1F2937', color: 'rgba(255, 255, 255, 0.9)' }}>
              Select a mapping
            </option>
            {mappings.map((mapping) => (
              <option 
                key={mapping.id} 
                value={mapping.id}
                style={{ background: '#1F2937', color: 'rgba(255, 255, 255, 0.9)' }}
              >
                {mapping.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label style={labelStyle}>
            Shipping Profile
          </label>
          {loadingProfiles ? (
            <select
              disabled
              style={{
                ...inputStyle,
                background: '#1F2937',
                color: 'rgba(255, 255, 255, 0.9)',
                opacity: 0.5,
                cursor: 'not-allowed',
              }}
            >
              <option style={{ background: '#1F2937', color: 'rgba(255, 255, 255, 0.9)' }}>
                Loading shipping profiles...
              </option>
            </select>
          ) : (
            <select
              value={formData.shippingProfileId}
              onChange={(e) => setFormData({ ...formData, shippingProfileId: e.target.value })}
              style={{
                ...inputStyle,
                background: '#1F2937',
                color: 'rgba(255, 255, 255, 0.9)',
                cursor: 'pointer',
              }}
              onFocus={(e) => e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)'}
              onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
            >
              <option value="" style={{ background: '#1F2937', color: 'rgba(255, 255, 255, 0.9)' }}>
                Use default shipping profile
              </option>
              {shippingProfiles.map((profile) => (
                <option 
                  key={profile.id} 
                  value={profile.id}
                  style={{ background: '#1F2937', color: 'rgba(255, 255, 255, 0.9)' }}
                >
                  {profile.name} {profile.type === 'default' ? '(Default)' : ''}
                </option>
              ))}
            </select>
          )}
          <p style={{ 
            fontSize: '12px', 
            color: 'rgba(255, 255, 255, 0.5)', 
            marginTop: '6px',
            marginBottom: 0
          }}>
            Select a shipping profile for imported products. If not selected, a default profile will be used.
          </p>
        </div>

        <div style={sectionStyle}>
          <h3 style={{ 
            fontSize: '16px', 
            fontWeight: '600', 
            marginBottom: '16px',
            color: 'rgba(255, 255, 255, 0.95)',
            marginTop: 0
          }}>
            Import Options
          </h3>
          <div style={{ display: 'grid', gap: '16px' }}>
            <div>
              <label style={labelStyle}>
                Batch Size
              </label>
              <input
                type="number"
                value={formData.options.batchSize}
                onChange={(e) => setFormData({
                  ...formData,
                  options: { ...formData.options, batchSize: parseInt(e.target.value) || 100 }
                })}
                min={1}
                style={inputStyle}
                onFocus={(e) => e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)'}
                onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <input
                type="checkbox"
                id="updateExisting"
                checked={formData.options.updateExisting}
                onChange={(e) => setFormData({
                  ...formData,
                  options: { ...formData.options, updateExisting: e.target.checked }
                })}
                style={{
                  width: '18px',
                  height: '18px',
                  cursor: 'pointer'
                }}
              />
              <label htmlFor="updateExisting" style={{ 
                fontSize: '14px',
                color: 'rgba(255, 255, 255, 0.8)',
                cursor: 'pointer',
                margin: 0
              }}>
                Update existing products
              </label>
            </div>

            {formData.options.updateExisting && (
              <div>
                <label style={labelStyle}>
                  Match By
                </label>
                <select
                  value={formData.options.updateBy}
                  onChange={(e) => setFormData({
                    ...formData,
                    options: { ...formData.options, updateBy: e.target.value as 'sku' | 'handle' }
                  })}
                  style={inputStyle}
                  onFocus={(e) => e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)'}
                  onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
                >
                  <option value="sku">SKU</option>
                  <option value="handle">Handle</option>
                </select>
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <input
                type="checkbox"
                id="skipErrors"
                checked={formData.options.skipErrors}
                onChange={(e) => setFormData({
                  ...formData,
                  options: { ...formData.options, skipErrors: e.target.checked }
                })}
                style={{
                  width: '18px',
                  height: '18px',
                  cursor: 'pointer'
                }}
              />
              <label htmlFor="skipErrors" style={{ 
                fontSize: '14px',
                color: 'rgba(255, 255, 255, 0.8)',
                cursor: 'pointer',
                margin: 0
              }}>
                Skip errors and continue
              </label>
            </div>
          </div>
        </div>

        <div style={sectionStyle}>
          <h3 style={{ 
            fontSize: '16px', 
            fontWeight: '600', 
            marginBottom: '16px',
            color: 'rgba(255, 255, 255, 0.95)',
            marginTop: 0
          }}>
            Recurring Import
          </h3>
          <div style={{ display: 'grid', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <input
                type="checkbox"
                id="recurringEnabled"
                checked={formData.recurring.enabled}
                onChange={(e) => setFormData({
                  ...formData,
                  recurring: { ...formData.recurring, enabled: e.target.checked }
                })}
                style={{
                  width: '18px',
                  height: '18px',
                  cursor: 'pointer'
                }}
              />
              <label htmlFor="recurringEnabled" style={{ 
                fontSize: '14px',
                color: 'rgba(255, 255, 255, 0.8)',
                cursor: 'pointer',
                margin: 0
              }}>
                Enable recurring import
              </label>
            </div>

            {formData.recurring.enabled && (
                <div>
                <label style={labelStyle}>
                    Schedule (Cron Expression) *
                  </label>
                  <input
                    type="text"
                    value={formData.recurring.schedule}
                    onChange={(e) => setFormData({
                      ...formData,
                      recurring: { ...formData.recurring, schedule: e.target.value }
                    })}
                    placeholder="0 0 * * *"
                    required={formData.recurring.enabled}
                  style={inputStyle}
                  onFocus={(e) => e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)'}
                  onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
                  />
                <p style={{ 
                  fontSize: '12px', 
                  color: 'rgba(255, 255, 255, 0.5)', 
                  marginTop: '6px',
                  marginBottom: 0
                }}>
                    Example: 0 0 * * * (daily at midnight)
                  </p>
                </div>
            )}
          </div>
        </div>
      </div>

      <div style={{ 
        display: 'flex', 
        gap: '12px', 
        marginTop: '32px',
        paddingTop: '24px',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <button
          type="submit"
          style={{
            padding: '10px 20px',
            background: '#111827',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            transition: 'opacity 0.2s',
            flex: 1
          }}
          onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
          onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
        >
          Save Configuration
        </button>
        <button
          type="button"
          onClick={onCancel}
          style={{
            padding: '10px 20px',
            background: 'transparent',
            color: 'rgba(255, 255, 255, 0.8)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            transition: 'all 0.2s',
            flex: 1
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent'
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)'
          }}
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
