import { useState, useEffect } from "react"

interface FieldMappingEditorProps {
  mapping?: any
  xmlUrl?: string
  onSave: (mapping: any) => void
  onPreview: (mapping: any) => void
  onCancel: () => void
}

export const FieldMappingEditor = ({
  mapping,
  xmlUrl: initialXmlUrl,
  onSave,
  onPreview,
  onCancel,
}: FieldMappingEditorProps) => {
  const [xmlUrl, setXmlUrl] = useState(initialXmlUrl || mapping?.xmlUrl || '')
  const [xmlFields, setXmlFields] = useState<string[]>([])
  const [medusaFields, setMedusaFields] = useState<string[]>([])
  const [loadingXml, setLoadingXml] = useState(false)
  const [loadingMedusaFields, setLoadingMedusaFields] = useState(false)
  const [xmlError, setXmlError] = useState<string | null>(null)
  // Required fields according to CreateProductDTO and business requirements
  // title is the only required field in CreateProductDTO
  // price is required for product variants (will be converted to variants.0.prices structure)
  // images is required for product display
  // description is required for product information
  // external_id is required by us for tracking/updates
  // variants.0.title is required for each variant
  // variants.0.prices.0.amount and variants.0.prices.0.currency_code are required for prices
  const getRequiredFields = () => {
    const baseRequired = [
      { xmlPath: '', medusaField: 'title', required: true },
      { xmlPath: '', medusaField: 'price', required: true },
      { xmlPath: '', medusaField: 'images', required: true },
      { xmlPath: '', medusaField: 'description', required: true },
      { xmlPath: '', medusaField: 'external_id', required: true },
    ]
    
    // If we have an existing mapping, use it, otherwise start with required fields
    if (mapping?.mappings && mapping.mappings.length > 0) {
      return mapping.mappings
    }
    
    return baseRequired
  }

  const [formData, setFormData] = useState({
    name: mapping?.name || '',
    description: mapping?.description || '',
    mappings: getRequiredFields(),
  })

  const commonMedusaFields = [
    'title',
    'description',
    'handle',
    'status',
    'variants.0.sku',
    'price', // Simple price field - will be automatically converted to proper price structure
    'variants.0.prices.0.amount',
    'variants.0.prices.0.currency_code',
    'variants.0.inventory_quantity',
    'images.0.url',
  ]

  useEffect(() => {
    loadMedusaFields()
    // If we have a mapping, initialize formData with it (for editing)
    if (mapping) {
      if (mapping.xmlUrl) {
      setXmlUrl(mapping.xmlUrl)
      }
      // Update formData when mapping changes - preserve all properties including categoryDelimiter
      setFormData({
        name: mapping.name || '',
        description: mapping.description || '',
        mappings: mapping.mappings && mapping.mappings.length > 0 
          ? mapping.mappings.map((m: any) => ({ ...m })) // Preserve all properties
          : getRequiredFields(),
      })
    }
  }, [mapping])

  useEffect(() => {
    if (xmlUrl && xmlUrl.trim()) {
      analyzeXmlStructure()
    } else {
      setXmlFields([])
      setXmlError(null)
    }
  }, [xmlUrl])

  const loadMedusaFields = async () => {
    setLoadingMedusaFields(true)
    try {
      const response = await fetch('/admin/xml-importer/product-fields')
      if (response.ok) {
        const data = await response.json()
        setMedusaFields(data.fields || [])
      }
    } catch (err) {
      console.error('Failed to load Medusa fields:', err)
      // Fallback to common fields if API fails
      setMedusaFields(commonMedusaFields)
    } finally {
      setLoadingMedusaFields(false)
    }
  }

  const analyzeXmlStructure = async () => {
    if (!xmlUrl || !xmlUrl.trim()) {
      setXmlFields([])
      return
    }

    setLoadingXml(true)
    setXmlError(null)
    try {
      const response = await fetch('/admin/xml-importer/analyze-xml', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          xmlUrl,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || data.error || 'Failed to analyze XML')
      }

      const data = await response.json()
      // Use fields directly from the API response
      if (data.fields && Array.isArray(data.fields)) {
        setXmlFields(data.fields)
      } else if (data.sampleData) {
        // Fallback: extract fields from sample data
        const fields = extractXmlFields(data.sampleData)
        setXmlFields(fields)
      }
    } catch (err) {
      setXmlError(err instanceof Error ? err.message : 'Failed to analyze XML')
      setXmlFields([])
    } finally {
      setLoadingXml(false)
    }
  }

  const extractXmlFields = (data: any, prefix = '', fields: string[] = []): string[] => {
    if (Array.isArray(data) && data.length > 0) {
      return extractXmlFields(data[0], prefix, fields)
    }

    if (typeof data === 'object' && data !== null) {
      Object.keys(data).forEach((key) => {
        const path = prefix ? `${prefix}.${key}` : key
        fields.push(path)
        if (typeof data[key] === 'object' && data[key] !== null && !Array.isArray(data[key])) {
          extractXmlFields(data[key], path, fields)
        }
      })
    }

    return fields
  }

  const addMapping = () => {
    setFormData({
      ...formData,
      mappings: [...formData.mappings, { xmlPath: '', medusaField: '', required: false }],
    })
  }

  // Required fields that cannot be removed
  const REQUIRED_FIELDS = ['title', 'price', 'images', 'description', 'external_id']
  
  const removeMapping = (index: number) => {
    const mapping = formData.mappings[index]
    // Prevent removal of required fields
    if (mapping.required && REQUIRED_FIELDS.includes(mapping.medusaField)) {
      alert(`Cannot remove required field: ${mapping.medusaField}`)
      return
    }
    
    setFormData({
      ...formData,
      mappings: formData.mappings.filter((_, i) => i !== index),
    })
  }

  const updateMapping = (index: number, field: string, value: any) => {
    const updated = [...formData.mappings]
    updated[index] = { ...updated[index], [field]: value }
    setFormData({ ...formData, mappings: updated })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate form data
    if (!formData.name || formData.name.trim() === '') {
      alert('Please enter a mapping name')
      return
    }

    if (!xmlUrl || xmlUrl.trim() === '') {
      alert('Please enter an XML URL')
      return
    }

    // Filter out empty mappings and validate
    const validMappings = formData.mappings.filter(
      (m) => m.xmlPath && m.xmlPath.trim() !== '' && m.medusaField && m.medusaField.trim() !== ''
    )

    if (validMappings.length === 0) {
      alert('Please add at least one field mapping with both XML Path and Medusa Field')
      return
    }

    // Validate required fields are present
    const requiredFieldsPresent = REQUIRED_FIELDS.every(field => 
      validMappings.some(m => m.medusaField === field && m.xmlPath && m.xmlPath.trim() !== '')
    )
    
    if (!requiredFieldsPresent) {
      const missingFields = REQUIRED_FIELDS.filter(field => 
        !validMappings.some(m => m.medusaField === field && m.xmlPath && m.xmlPath.trim() !== '')
      )
      alert(`Missing required fields: ${missingFields.join(', ')}. Please map these fields before saving.`)
      return
    }

    // Save with only valid mappings and include xmlUrl
    // Ensure all mapping properties are preserved (including categoryDelimiter, imageDelimiter, etc.)
    const mappingsToSave = validMappings.map(m => {
      // Preserve all properties including categoryDelimiter, imageDelimiter, isImageCollection, etc.
      const mapping = { ...m }
      // Ensure categoryDelimiter is included if medusaField is categories
      if (mapping.medusaField === 'categories' && !mapping.categoryDelimiter) {
        mapping.categoryDelimiter = '>'
      }
      return mapping
    })
    
    console.log('Saving mappings:', JSON.stringify(mappingsToSave, null, 2))
    console.log('Categories mapping:', mappingsToSave.find(m => m.medusaField === 'categories'))
    
    onSave({
      ...formData,
      xmlUrl: xmlUrl.trim(),
      mappings: mappingsToSave,
    })
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

  const selectStyle = {
    ...inputStyle,
    background: '#1F2937',
    color: 'rgba(255, 255, 255, 0.9)',
    cursor: 'pointer',
  }

  const labelStyle = {
    display: 'block' as const,
    marginBottom: '8px',
    fontSize: '14px',
    fontWeight: '500' as const,
    color: 'rgba(255, 255, 255, 0.8)',
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
        {mapping ? 'Edit' : 'Create'} Field Mapping
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
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="url"
              value={xmlUrl}
              onChange={(e) => setXmlUrl(e.target.value)}
              placeholder="https://example.com/products.xml"
              required
              style={inputStyle}
              onFocus={(e) => e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)'}
              onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
            />
            <button
              type="button"
              onClick={analyzeXmlStructure}
              disabled={loadingXml || !xmlUrl.trim()}
              style={{
                padding: '10px 20px',
                background: loadingXml || !xmlUrl.trim() ? 'rgba(255, 255, 255, 0.1)' : '#111827',
                color: 'rgba(255, 255, 255, 0.9)',
                border: 'none',
                borderRadius: '6px',
                cursor: loadingXml || !xmlUrl.trim() ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                whiteSpace: 'nowrap',
                opacity: loadingXml || !xmlUrl.trim() ? 0.5 : 1
              }}
            >
              {loadingXml ? 'Analyzing...' : 'Analyze XML'}
            </button>
          </div>
          {xmlError && (
            <p style={{ 
              fontSize: '12px', 
              color: '#EF4444', 
              marginTop: '6px',
              marginBottom: 0
            }}>
              {xmlError}
            </p>
          )}
          {xmlFields.length > 0 && (
            <p style={{ 
              fontSize: '12px', 
              color: 'rgba(255, 255, 255, 0.5)', 
              marginTop: '6px',
              marginBottom: 0
            }}>
              Found {xmlFields.length} available XML fields
            </p>
          )}
      </div>

        <div style={{ 
          padding: '16px', 
          background: 'rgba(255, 255, 255, 0.03)', 
          borderRadius: '8px',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginBottom: '16px' 
          }}>
            <h3 style={{ 
              fontSize: '16px', 
              fontWeight: '600',
              color: 'rgba(255, 255, 255, 0.95)',
              margin: 0
            }}>
              Field Mappings
            </h3>
          <button
            type="button"
            onClick={addMapping}
            style={{
                padding: '8px 16px',
              background: '#111827',
              color: '#FFFFFF',
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
            Add Mapping
          </button>
        </div>

          <div style={{ display: 'grid', gap: '16px' }}>
          {formData.mappings.map((map, index) => (
            <div
              key={index}
              style={{
                padding: '16px',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                  background: 'rgba(255, 255, 255, 0.02)'
              }}
            >
                <div style={{ 
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}>
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: '2fr 2fr auto auto', 
                    gap: '12px', 
                    alignItems: 'end' 
                  }}>
                <div>
                    <label style={{ 
                      display: 'block', 
                      marginBottom: '8px', 
                      fontSize: '12px', 
                      fontWeight: '500',
                      color: map.required && REQUIRED_FIELDS.includes(map.medusaField)
                        ? '#F59E0B'
                        : 'rgba(255, 255, 255, 0.8)'
                    }}>
                    XML Path {map.required && REQUIRED_FIELDS.includes(map.medusaField) ? '*' : ''}
                    {map.required && REQUIRED_FIELDS.includes(map.medusaField) && (
                      <span style={{ color: '#F59E0B', marginLeft: '4px' }}>(Required)</span>
                    )}
                  </label>
                    {xmlFields.length > 0 ? (
                      <select
                        value={map.xmlPath}
                        onChange={(e) => updateMapping(index, 'xmlPath', e.target.value)}
                        required
                        style={selectStyle}
                        onFocus={(e) => e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)'}
                        onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
                      >
                        <option value="" style={{ background: '#1F2937', color: 'rgba(255, 255, 255, 0.9)' }}>
                          Select XML field...
                        </option>
                        {xmlFields.map((field) => (
                          <option 
                            key={field} 
                            value={field}
                            style={{ background: '#1F2937', color: 'rgba(255, 255, 255, 0.9)' }}
                          >
                            {field}
                          </option>
                        ))}
                      </select>
                    ) : (
                  <input
                    type="text"
                    value={map.xmlPath}
                    onChange={(e) => updateMapping(index, 'xmlPath', e.target.value)}
                    placeholder="product.title"
                    required
                        style={inputStyle}
                        onFocus={(e) => e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)'}
                        onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
                  />
                    )}
                </div>

                <div>
                    <label style={{ 
                      display: 'block', 
                      marginBottom: '8px', 
                      fontSize: '12px', 
                      fontWeight: '500',
                      color: map.required && REQUIRED_FIELDS.includes(map.medusaField)
                        ? '#F59E0B'
                        : 'rgba(255, 255, 255, 0.8)'
                    }}>
                    Medusa Field {map.required && REQUIRED_FIELDS.includes(map.medusaField) ? '*' : ''}
                    {map.required && REQUIRED_FIELDS.includes(map.medusaField) && (
                      <span style={{ color: '#F59E0B', marginLeft: '4px' }}>(Required)</span>
                    )}
                  </label>
                    {loadingMedusaFields ? (
                      <select
                        disabled
                        style={{
                          ...selectStyle,
                          opacity: 0.5,
                          cursor: 'not-allowed'
                        }}
                      >
                        <option style={{ background: '#1F2937', color: 'rgba(255, 255, 255, 0.9)' }}>
                          Loading fields...
                        </option>
                      </select>
                    ) : (
                      <select
                    value={map.medusaField}
                    onChange={(e) => updateMapping(index, 'medusaField', e.target.value)}
                    required
                        style={selectStyle}
                        onFocus={(e) => e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)'}
                        onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
                      >
                        <option value="" style={{ background: '#1F2937', color: 'rgba(255, 255, 255, 0.9)' }}>
                          Select Medusa field...
                        </option>
                        {/* Show special fields first with notes */}
                        <option 
                          value="price"
                          style={{ background: '#1F2937', color: '#60A5FA', fontWeight: 'bold' }}
                        >
                          price (Simple - auto converts to proper structure)
                        </option>
                        <option 
                          value="images"
                          style={{ background: '#1F2937', color: '#10B981', fontWeight: 'bold' }}
                        >
                          images (Image collection - supports delimiter)
                        </option>
                        <option 
                          value="categories"
                          style={{ background: '#1F2937', color: '#8B5CF6', fontWeight: 'bold' }}
                        >
                          categories (Category hierarchy - supports delimiter)
                        </option>
                        {medusaFields.length > 0 ? (
                          medusaFields.filter(f => f !== 'price' && f !== 'images' && f !== 'categories').map((field) => (
                            <option 
                              key={field} 
                              value={field}
                              style={{ background: '#1F2937', color: 'rgba(255, 255, 255, 0.9)' }}
                            >
                              {field}
                            </option>
                          ))
                        ) : (
                          commonMedusaFields.filter(f => f !== 'price' && f !== 'images' && f !== 'categories').map((field) => (
                            <option 
                              key={field} 
                              value={field}
                              style={{ background: '#1F2937', color: 'rgba(255, 255, 255, 0.9)' }}
                            >
                              {field}
                            </option>
                          ))
                        )}
                      </select>
                    )}
                </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingBottom: '8px' }}>
                    <input
                      type="checkbox"
                      id={`required-${index}`}
                      checked={map.required || false}
                      onChange={(e) => {
                        // Prevent unchecking required fields
                        if (!e.target.checked && REQUIRED_FIELDS.includes(map.medusaField)) {
                          return
                        }
                        updateMapping(index, 'required', e.target.checked)
                      }}
                      disabled={REQUIRED_FIELDS.includes(map.medusaField)}
                      style={{
                        width: '18px',
                        height: '18px',
                        cursor: REQUIRED_FIELDS.includes(map.medusaField) ? 'not-allowed' : 'pointer',
                        opacity: REQUIRED_FIELDS.includes(map.medusaField) ? 0.6 : 1
                      }}
                    />
                    <label 
                      htmlFor={`required-${index}`}
                      style={{ 
                        fontSize: '12px',
                        color: map.required && REQUIRED_FIELDS.includes(map.medusaField)
                          ? '#F59E0B'
                          : 'rgba(255, 255, 255, 0.8)',
                        cursor: REQUIRED_FIELDS.includes(map.medusaField) ? 'not-allowed' : 'pointer',
                        margin: 0
                      }}
                    >
                    Required
                    {REQUIRED_FIELDS.includes(map.medusaField) && (
                      <span style={{ color: '#F59E0B', marginLeft: '4px' }}>(Always)</span>
                    )}
                  </label>
                </div>
                
                {/* Image collection options - show when medusaField is 'images' */}
                {map.medusaField === 'images' && (
                  <div style={{
                    gridColumn: '1 / -1',
                    marginTop: '12px',
                    padding: '12px',
                    background: 'rgba(16, 185, 129, 0.1)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    borderRadius: '6px'
                  }}>
                    <div style={{ marginBottom: '12px' }}>
                      <label style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        marginBottom: '8px',
                        fontSize: '12px',
                        fontWeight: '500',
                        color: '#10B981'
                      }}>
                        <input
                          type="checkbox"
                          checked={map.isImageCollection || false}
                          onChange={(e) => updateMapping(index, 'isImageCollection', e.target.checked)}
                          style={{
                            width: '18px',
                            height: '18px',
                            cursor: 'pointer'
                          }}
                        />
                        Enable Image Collection (multiple images separated by delimiter)
                      </label>
                    </div>
                    {map.isImageCollection && (
                      <div>
                        <label style={{
                          display: 'block',
                          marginBottom: '6px',
                          fontSize: '12px',
                          color: 'rgba(255, 255, 255, 0.8)'
                        }}>
                          Image Delimiter (default: ", ")
                        </label>
                        <input
                          type="text"
                          value={map.imageDelimiter || ', '}
                          onChange={(e) => updateMapping(index, 'imageDelimiter', e.target.value)}
                          placeholder=", "
                          style={{
                            ...inputStyle,
                            width: '100%',
                            fontSize: '12px'
                          }}
                        />
                        <div style={{
                          marginTop: '6px',
                          fontSize: '11px',
                          color: 'rgba(255, 255, 255, 0.6)'
                        }}>
                          Images will be split by this delimiter and uploaded to MinIO in production
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Category hierarchy options - show when medusaField is 'categories' */}
                {map.medusaField === 'categories' && (
                  <div style={{
                    gridColumn: '1 / -1',
                    marginTop: '12px',
                    padding: '12px',
                    background: 'rgba(139, 92, 246, 0.1)',
                    border: '1px solid rgba(139, 92, 246, 0.3)',
                    borderRadius: '6px'
                  }}>
                    <div style={{ marginBottom: '12px' }}>
                      <div style={{
                        fontSize: '12px',
                        fontWeight: '500',
                        color: '#8B5CF6',
                        marginBottom: '8px'
                      }}>
                        Category Hierarchy Configuration
                      </div>
                      <div style={{
                        fontSize: '11px',
                        color: 'rgba(255, 255, 255, 0.6)',
                        marginBottom: '12px'
                      }}>
                        Categories will be parsed as hierarchical paths (e.g., "Parent &gt; Child &gt; Grandchild") and created automatically if they don't exist.
                      </div>
                    </div>
                    <div>
                      <label style={{
                        display: 'block',
                        marginBottom: '6px',
                        fontSize: '12px',
                        color: 'rgba(255, 255, 255, 0.8)'
                      }}>
                        Category Delimiter (default: "&gt;")
                      </label>
                      <input
                        type="text"
                        value={map.categoryDelimiter || '>'}
                        onChange={(e) => updateMapping(index, 'categoryDelimiter', e.target.value)}
                        placeholder=">"
                        style={{
                          ...inputStyle,
                          width: '100%',
                          fontSize: '12px'
                        }}
                      />
                      <div style={{
                        marginTop: '6px',
                        fontSize: '11px',
                        color: 'rgba(255, 255, 255, 0.6)'
                      }}>
                        Categories will be split by this delimiter. Spaces around the delimiter will be automatically removed (e.g., " &gt; " becomes "&gt;").
                      </div>
                    </div>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => removeMapping(index)}
                  disabled={map.required && REQUIRED_FIELDS.includes(map.medusaField)}
                  style={{
                    padding: '8px 12px',
                      background: map.required && REQUIRED_FIELDS.includes(map.medusaField) 
                        ? 'transparent' 
                        : 'transparent',
                      color: map.required && REQUIRED_FIELDS.includes(map.medusaField)
                        ? 'rgba(239, 68, 68, 0.4)'
                        : '#EF4444',
                      border: `1px solid ${map.required && REQUIRED_FIELDS.includes(map.medusaField)
                        ? 'rgba(239, 68, 68, 0.4)'
                        : '#EF4444'}`,
                      borderRadius: '6px',
                    cursor: map.required && REQUIRED_FIELDS.includes(map.medusaField)
                      ? 'not-allowed'
                      : 'pointer',
                      fontSize: '14px',
                      fontWeight: '500',
                      transition: 'all 0.2s',
                      whiteSpace: 'nowrap',
                      opacity: map.required && REQUIRED_FIELDS.includes(map.medusaField) ? 0.5 : 1
                    }}
                    onMouseEnter={(e) => {
                      if (!(map.required && REQUIRED_FIELDS.includes(map.medusaField))) {
                        e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent'
                  }}
                  title={map.required && REQUIRED_FIELDS.includes(map.medusaField) 
                    ? 'Required field cannot be removed' 
                    : 'Remove mapping'}
                >
                  Remove
                </button>
              </div>
              </div>
            </div>
          ))}
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
        {xmlUrl && (
          <button
            type="button"
            onClick={() => onPreview({ ...formData, xmlUrl })}
            style={{
              padding: '10px 20px',
              background: '#3B82F6',
              color: '#FFFFFF',
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
            Preview Mapping
          </button>
        )}
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
          Save Mapping
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
