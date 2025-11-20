import { FieldMapping, ImportConfig, ImportExecution, ImportExecutionLog } from './types'
import { ulid } from 'ulid'
import { Pool } from 'pg'
import { DATABASE_URL } from '../../lib/constants'

/**
 * Database repository for XML Product Importer
 * Uses raw SQL queries against PostgreSQL database
 * We're NOT using MikroORM entities - just executing SQL directly
 */
export class XmlImporterRepository {
  private pool: Pool

  constructor(connection?: any) {
    // If a connection is provided (from container), use it
    // Otherwise, create a new connection pool from DATABASE_URL
    if (connection && typeof connection.query === 'function') {
      // It's a pg Pool or Client
      this.pool = connection as Pool
    } else if (connection && typeof connection.raw === 'function') {
      // It's Knex - wrap it to use pg Pool
      this.pool = (connection as any).client as Pool
    } else {
      // Create our own connection pool
      this.pool = new Pool({
        connectionString: DATABASE_URL,
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
      })
    }
  }

  /**
   * Field Mappings
   */
  async createMapping(mapping: Omit<FieldMapping, 'id' | 'created_at' | 'updated_at'>): Promise<FieldMapping> {
    const id = ulid()
    const now = new Date()
    
    await this.pool.query(
      `INSERT INTO xml_import_mapping (id, name, description, xml_url, mappings, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5::jsonb, $6, $7)`,
      [
        id,
        mapping.name,
        mapping.description || null,
        mapping.xmlUrl || null,
        JSON.stringify(mapping.mappings),
        now,
        now,
      ]
    )

    return {
      id,
      ...mapping,
      created_at: now,
      updated_at: now,
    }
  }

  async getMapping(id: string): Promise<FieldMapping | null> {
    const result = await this.pool.query(
      'SELECT * FROM xml_import_mapping WHERE id = $1',
      [id]
    )

    if (!result.rows || result.rows.length === 0) {
      return null
    }

    const row = result.rows[0]
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      xmlUrl: row.xml_url,
      mappings: typeof row.mappings === 'string' ? JSON.parse(row.mappings) : row.mappings,
      created_at: row.created_at,
      updated_at: row.updated_at,
    }
  }

  async listMappings(): Promise<FieldMapping[]> {
    const result = await this.pool.query(
      'SELECT * FROM xml_import_mapping ORDER BY created_at DESC'
    )

    return (result.rows || []).map((row: any) => ({
      id: row.id,
      name: row.name,
      description: row.description,
      xmlUrl: row.xml_url,
      mappings: typeof row.mappings === 'string' ? JSON.parse(row.mappings) : row.mappings,
      created_at: row.created_at,
      updated_at: row.updated_at,
    }))
  }

  async updateMapping(id: string, updates: Partial<FieldMapping>): Promise<FieldMapping> {
    const now = new Date()
    
    const updatesList: string[] = []
    const values: any[] = []
    let paramIndex = 1

    if (updates.name !== undefined) {
      updatesList.push(`name = $${paramIndex++}`)
      values.push(updates.name)
    }
    if (updates.description !== undefined) {
      updatesList.push(`description = $${paramIndex++}`)
      values.push(updates.description)
    }
    if (updates.xmlUrl !== undefined) {
      updatesList.push(`xml_url = $${paramIndex++}`)
      values.push(updates.xmlUrl)
    }
    if (updates.mappings !== undefined) {
      updatesList.push(`mappings = $${paramIndex++}::jsonb`)
      values.push(JSON.stringify(updates.mappings))
    }
    
    updatesList.push(`updated_at = $${paramIndex++}`)
    values.push(now)
    values.push(id)

    await this.pool.query(
      `UPDATE xml_import_mapping SET ${updatesList.join(', ')} WHERE id = $${paramIndex}`,
      values
    )

    const updated = await this.getMapping(id)
    if (!updated) {
      throw new Error(`Mapping ${id} not found after update`)
    }
    return updated
  }

  async deleteMapping(id: string): Promise<void> {
    await this.pool.query('DELETE FROM xml_import_mapping WHERE id = $1', [id])
  }

  /**
   * Import Configs
   */
  async createConfig(config: Omit<ImportConfig, 'id' | 'created_at' | 'updated_at'>): Promise<ImportConfig> {
    const id = ulid()
    const now = new Date()
    
    await this.pool.query(
      `INSERT INTO xml_import_config (id, name, description, xml_url, mapping_id, options, recurring, enabled, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7::jsonb, $8, $9, $10)`,
      [
        id,
        config.name,
        config.description || null,
        config.xmlUrl,
        config.mappingId,
        JSON.stringify(config.options),
        config.recurring ? JSON.stringify(config.recurring) : null,
        config.enabled !== undefined ? config.enabled : true,
        now,
        now,
      ]
    )

    return {
      id,
      ...config,
      created_at: now,
      updated_at: now,
    }
  }

  async getConfig(id: string): Promise<ImportConfig | null> {
    const result = await this.pool.query(
      'SELECT * FROM xml_import_config WHERE id = $1',
      [id]
    )

    if (!result.rows || result.rows.length === 0) {
      return null
    }

    const row = result.rows[0]
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      xmlUrl: row.xml_url,
      mappingId: row.mapping_id,
      options: typeof row.options === 'string' ? JSON.parse(row.options) : row.options,
      recurring: row.recurring ? (typeof row.recurring === 'string' ? JSON.parse(row.recurring) : row.recurring) : undefined,
      enabled: row.enabled,
      created_at: row.created_at,
      updated_at: row.updated_at,
    }
  }

  async listConfigs(): Promise<ImportConfig[]> {
    const result = await this.pool.query(
      'SELECT * FROM xml_import_config ORDER BY created_at DESC'
    )

    return (result.rows || []).map((row: any) => ({
      id: row.id,
      name: row.name,
      description: row.description,
      xmlUrl: row.xml_url,
      mappingId: row.mapping_id,
      options: typeof row.options === 'string' ? JSON.parse(row.options) : row.options,
      recurring: row.recurring ? (typeof row.recurring === 'string' ? JSON.parse(row.recurring) : row.recurring) : undefined,
      enabled: row.enabled,
      created_at: row.created_at,
      updated_at: row.updated_at,
    }))
  }

  async updateConfig(id: string, updates: Partial<ImportConfig>): Promise<ImportConfig> {
    const now = new Date()
    
    const updatesList: string[] = []
    const values: any[] = []
    let paramIndex = 1

    if (updates.name !== undefined) {
      updatesList.push(`name = $${paramIndex++}`)
      values.push(updates.name)
    }
    if (updates.description !== undefined) {
      updatesList.push(`description = $${paramIndex++}`)
      values.push(updates.description)
    }
    if (updates.xmlUrl !== undefined) {
      updatesList.push(`xml_url = $${paramIndex++}`)
      values.push(updates.xmlUrl)
    }
    if (updates.mappingId !== undefined) {
      updatesList.push(`mapping_id = $${paramIndex++}`)
      values.push(updates.mappingId)
    }
    if (updates.options !== undefined) {
      updatesList.push(`options = $${paramIndex++}::jsonb`)
      values.push(JSON.stringify(updates.options))
    }
    if (updates.recurring !== undefined) {
      updatesList.push(`recurring = $${paramIndex++}::jsonb`)
      values.push(updates.recurring ? JSON.stringify(updates.recurring) : null)
    }
    if (updates.enabled !== undefined) {
      updatesList.push(`enabled = $${paramIndex++}`)
      values.push(updates.enabled)
    }
    
    updatesList.push(`updated_at = $${paramIndex++}`)
    values.push(now)
    values.push(id)

    await this.pool.query(
      `UPDATE xml_import_config SET ${updatesList.join(', ')} WHERE id = $${paramIndex}`,
      values
    )

    const updated = await this.getConfig(id)
    if (!updated) {
      throw new Error(`Config ${id} not found after update`)
    }
    return updated
  }

  async deleteConfig(id: string): Promise<void> {
    await this.pool.query('DELETE FROM xml_import_config WHERE id = $1', [id])
  }

  /**
   * Import Executions
   */
  async createExecution(execution: Omit<ImportExecution, 'id' | 'startedAt'>): Promise<ImportExecution> {
    const id = ulid()
    const now = new Date()
    
    await this.pool.query(
      `INSERT INTO xml_import_execution (id, config_id, status, started_at, completed_at, total_products, processed_products, successful_products, failed_products, error)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [
        id,
        execution.configId,
        execution.status,
        now,
        execution.completedAt || null,
        execution.totalProducts || null,
        execution.processedProducts || 0,
        execution.successfulProducts || 0,
        execution.failedProducts || 0,
        execution.error || null,
      ]
    )

    return {
      id,
      ...execution,
      startedAt: now,
    }
  }

  async getExecution(id: string): Promise<ImportExecution | null> {
    const result = await this.pool.query(
      'SELECT * FROM xml_import_execution WHERE id = $1',
      [id]
    )

    if (!result.rows || result.rows.length === 0) {
      return null
    }

    const row = result.rows[0]
    const logs = await this.listExecutionLogs(id)
    
    return {
      id: row.id,
      configId: row.config_id,
      status: row.status,
      startedAt: row.started_at,
      completedAt: row.completed_at,
      totalProducts: row.total_products,
      processedProducts: row.processed_products,
      successfulProducts: row.successful_products,
      failedProducts: row.failed_products,
      error: row.error,
      logs,
    }
  }

  async listExecutions(options?: { configId?: string; status?: string; limit?: number; offset?: number }): Promise<ImportExecution[]> {
    const conditions: string[] = []
    const values: any[] = []
    let paramIndex = 1

    if (options?.configId) {
      conditions.push(`config_id = $${paramIndex++}`)
      values.push(options.configId)
    }
    if (options?.status) {
      conditions.push(`status = $${paramIndex++}`)
      values.push(options.status)
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''
    const limitClause = options?.limit ? `LIMIT $${paramIndex++}` : ''
    const offsetClause = options?.offset ? `OFFSET $${paramIndex++}` : ''
    
    if (options?.limit) values.push(options.limit)
    if (options?.offset) values.push(options.offset)

    const result = await this.pool.query(
      `SELECT * FROM xml_import_execution ${whereClause} ORDER BY started_at DESC ${limitClause} ${offsetClause}`,
      values
    )

    return Promise.all(
      (result.rows || []).map(async (row: any) => {
        const logs = await this.listExecutionLogs(row.id)
        return {
          id: row.id,
          configId: row.config_id,
          status: row.status,
          startedAt: row.started_at,
          completedAt: row.completed_at,
          totalProducts: row.total_products,
          processedProducts: row.processed_products,
          successfulProducts: row.successful_products,
          failedProducts: row.failed_products,
          error: row.error,
          logs,
        }
      })
    )
  }

  async updateExecution(id: string, updates: Partial<ImportExecution>): Promise<ImportExecution> {
    const updatesList: string[] = []
    const values: any[] = []
    let paramIndex = 1

    if (updates.status !== undefined) {
      updatesList.push(`status = $${paramIndex++}`)
      values.push(updates.status)
    }
    if (updates.completedAt !== undefined) {
      updatesList.push(`completed_at = $${paramIndex++}`)
      values.push(updates.completedAt)
    }
    if (updates.totalProducts !== undefined) {
      updatesList.push(`total_products = $${paramIndex++}`)
      values.push(updates.totalProducts)
    }
    if (updates.processedProducts !== undefined) {
      updatesList.push(`processed_products = $${paramIndex++}`)
      values.push(updates.processedProducts)
    }
    if (updates.successfulProducts !== undefined) {
      updatesList.push(`successful_products = $${paramIndex++}`)
      values.push(updates.successfulProducts)
    }
    if (updates.failedProducts !== undefined) {
      updatesList.push(`failed_products = $${paramIndex++}`)
      values.push(updates.failedProducts)
    }
    if (updates.error !== undefined) {
      updatesList.push(`error = $${paramIndex++}`)
      values.push(updates.error)
    }
    
    values.push(id)

    if (updatesList.length > 0) {
      await this.pool.query(
        `UPDATE xml_import_execution SET ${updatesList.join(', ')} WHERE id = $${paramIndex}`,
        values
      )
    }

    const updated = await this.getExecution(id)
    if (!updated) {
      throw new Error(`Execution ${id} not found after update`)
    }
    return updated
  }

  /**
   * Execution Logs
   */
  async createExecutionLog(log: Omit<ImportExecutionLog, 'id' | 'timestamp'>): Promise<ImportExecutionLog> {
    const id = ulid()
    const now = new Date()
    
    await this.pool.query(
      `INSERT INTO xml_import_execution_log (id, execution_id, level, message, product_index, product_data, error, timestamp)
       VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7::jsonb, $8)`,
      [
        id,
        log.executionId,
        log.level,
        log.message,
        log.productIndex || null,
        log.productData ? JSON.stringify(log.productData) : null,
        log.error ? JSON.stringify(log.error) : null,
        now,
      ]
    )

    return {
      id,
      ...log,
      timestamp: now,
    }
  }

  async listExecutionLogs(executionId: string): Promise<ImportExecutionLog[]> {
    const result = await this.pool.query(
      'SELECT * FROM xml_import_execution_log WHERE execution_id = $1 ORDER BY timestamp ASC',
      [executionId]
    )

    return (result.rows || []).map((row: any) => ({
      id: row.id,
      executionId: row.execution_id,
      level: row.level,
      message: row.message,
      productIndex: row.product_index,
      productData: row.product_data ? (typeof row.product_data === 'string' ? JSON.parse(row.product_data) : row.product_data) : undefined,
      error: row.error ? (typeof row.error === 'string' ? JSON.parse(row.error) : row.error) : undefined,
      timestamp: row.timestamp,
    }))
  }
}

