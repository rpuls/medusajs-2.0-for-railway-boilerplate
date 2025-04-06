import {
  BeforeInsert,
  Column,
  Entity,
  PrimaryColumn,
} from "typeorm";
import { generateEntityId } from "@medusajs/utils";

/**
 * Changelog Model
 * This is a model for tracking product version changes.
 */
@Entity()
export class Changelog {
  @PrimaryColumn()
  id: string;

  @Column()
  product_id: string;

  @Column()
  version: string;

  @Column({ type: "text" })
  changes: string;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  release_date: Date;

  @BeforeInsert()
  private beforeInsert(): void {
    this.id = generateEntityId(this.id, "clog");
  }
}
