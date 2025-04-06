import {
  BeforeInsert,
  Column,
  Entity,
  PrimaryColumn,
} from "typeorm";
import { generateEntityId } from "@medusajs/utils";

/**
 * Review Model
 * This is a model for product reviews.
 */
@Entity()
export class Review {
  @PrimaryColumn()
  id: string;

  @Column()
  product_id: string;

  @Column()
  customer_id: string;

  @Column({ type: "int" })
  rating: number;

  @Column({ type: "text", nullable: true })
  content: string;

  @Column({ default: false })
  is_verified_purchase: boolean;

  @BeforeInsert()
  private beforeInsert(): void {
    this.id = generateEntityId(this.id, "rev");
  }
}
