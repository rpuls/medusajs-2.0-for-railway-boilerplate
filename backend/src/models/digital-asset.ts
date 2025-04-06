import {
  BeforeInsert,
  Column,
  Entity,
  PrimaryColumn,
} from "typeorm";
import { generateEntityId } from "@medusajs/utils";

/**
 * Digital Asset Model
 * This is a model for digital assets that can be attached to products.
 */

export enum ReviewStatus {
  PENDING = "pending",
  APPROVED = "approved",
  REJECTED = "rejected"
}

@Entity()
export class DigitalAsset {
  @PrimaryColumn()
  id: string;

  @Column()
  file_key: string;

  @Column()
  file_name: string;

  @Column()
  mime_type: string;

  @Column({ type: "int" })
  file_size: number;

  @Column()
  product_id: string;

  @Column({ type: "jsonb", nullable: true })
  metadata: Record<string, unknown>;

  @Column({
    type: "enum",
    enum: ReviewStatus,
    default: ReviewStatus.PENDING
  })
  review_status: ReviewStatus;

  @Column({ type: "int", default: 1 })
  version: number;

  @Column({ type: "jsonb", nullable: true })
  versionHistory: Array<{
    version: number;
    changes: string;
    uploadDate: Date;
    file_key: string; // Store old file keys if needed
  }>;

  @Column({ type: "varchar", nullable: true })
  githubUrl: string; // For linking FOSS assets

  @Column({ type: "jsonb", nullable: true })
  assetMetrics: {
    downloadCount: number;
    averageRating?: number;
    lastDownloaded?: Date;
    popularityScore?: number;
  };

  @Column({ type: "jsonb", nullable: true })
  assetDetails: {
    isAiGenerated?: boolean;
    aiModelUsed?: string;
    licenseType?: string;
    compatibleWith?: string[]; // e.g., ["unity", "unreal", "godot"]
    tags?: string[];
    complexity?: "beginner" | "intermediate" | "advanced";
    polygonCount?: number; // For 3D models
    renderEngine?: string; // For rendered images/models
    hasSourceFiles?: boolean;
  };

  @Column({ type: "timestamp", nullable: true })
  last_scanned_at: Date;

  @BeforeInsert()
  private beforeInsert(): void {
    this.id = generateEntityId(this.id, "dast");
  }
}
