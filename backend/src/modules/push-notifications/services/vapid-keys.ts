import { Logger } from '@medusajs/framework/types'
import * as webPush from 'web-push'
import { VapidKeys } from '../models/vapid-keys'

type InjectedDependencies = {
  logger: Logger
  manager: any // MedusaJS manager for database operations
}

export class VapidKeysService {
  protected logger_: Logger
  protected manager_: any

  constructor({ logger, manager }: InjectedDependencies) {
    this.logger_ = logger
    this.manager_ = manager
  }

  /**
   * Generate VAPID key pair
   */
  async generateKeys(subject: string): Promise<{ publicKey: string; privateKey: string }> {
    const vapidKeys = webPush.generateVAPIDKeys()
    return {
      publicKey: vapidKeys.publicKey,
      privateKey: vapidKeys.privateKey,
    }
  }

  /**
   * Get or create VAPID keys
   */
  async getOrCreateKeys(subject: string): Promise<{ publicKey: string; privateKey: string }> {
    const manager = this.manager_.fork()

    // Try to get existing keys
    const existingKeys = await manager.findOne(VapidKeys, {})
    if (existingKeys) {
      return {
        publicKey: existingKeys.public_key,
        privateKey: existingKeys.private_key,
      }
    }

    // Generate new keys
    const { publicKey, privateKey } = await this.generateKeys(subject)

    // Store in database
    const vapidKeys = manager.create(VapidKeys, {
      id: `vapid_${Date.now()}`,
      public_key: publicKey,
      private_key: privateKey,
      subject,
    })

    await manager.persistAndFlush(vapidKeys)

    this.logger_.info('VAPID keys generated and stored')

    return { publicKey, privateKey }
  }

  /**
   * Get public key (safe to expose to frontend)
   */
  async getPublicKey(): Promise<string> {
    const manager = this.manager_.fork()
    const vapidKeys = await manager.findOne(VapidKeys, {})

    if (!vapidKeys) {
      throw new Error('VAPID keys not found. Please generate them first.')
    }

    return vapidKeys.public_key
  }

  /**
   * Get private key (never expose to frontend)
   */
  async getPrivateKey(): Promise<string> {
    const manager = this.manager_.fork()
    const vapidKeys = await manager.findOne(VapidKeys, {})

    if (!vapidKeys) {
      throw new Error('VAPID keys not found. Please generate them first.')
    }

    return vapidKeys.private_key
  }

  /**
   * Rotate VAPID keys (creates new keys, old subscriptions will need to re-subscribe)
   */
  async rotateKeys(subject: string): Promise<{ publicKey: string; privateKey: string }> {
    const manager = this.manager_.fork()

    // Delete old keys
    await manager.nativeDelete(VapidKeys, {})

    // Generate and store new keys
    return this.getOrCreateKeys(subject)
  }
}

