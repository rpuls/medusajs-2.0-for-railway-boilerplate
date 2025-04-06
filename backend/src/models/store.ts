/**
 * Store Model Extensions
 *
 * This file defines metadata for the Store entity.
 * In Medusa 2.0, we should use migrations to add fields to existing entities.
 *
 * For now, we'll use the metadata field that already exists in the Store entity.
 */

// Define the structure of our store extensions
export interface StoreExtensionData {
  profile_image_id?: string;
  banner_image_id?: string;
  biography?: string;
  is_verified?: boolean;
  square_account_data?: Record<string, unknown>;
}

// This is just a type definition, not an actual entity
export class StoreExtension implements StoreExtensionData {
  profile_image_id?: string;
  banner_image_id?: string;
  biography?: string;
  is_verified: boolean = false;
  square_account_data?: Record<string, unknown>;
}
