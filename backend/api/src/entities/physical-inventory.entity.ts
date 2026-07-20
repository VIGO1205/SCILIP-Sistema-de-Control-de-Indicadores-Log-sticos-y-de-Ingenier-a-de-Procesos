import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Company } from './company.entity';
import { Warehouse } from './warehouse.entity';
import { Product } from './product.entity';
import { User } from './user.entity';

@Entity('physical_inventory')
export class PhysicalInventory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  company_id: string;

  @ManyToOne(() => Company)
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @Column()
  warehouse_id: string;

  @ManyToOne(() => Warehouse)
  @JoinColumn({ name: 'warehouse_id' })
  warehouse: Warehouse;

  @Column({ type: 'date' })
  inventory_date: Date;

  @Column()
  product_id: string;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column({ nullable: true })
  location_id: string;

  @Column()
  theoretical_quantity: number;

  @Column()
  physical_quantity: number;

  @Column()
  difference: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  difference_value: number;

  @Column({ nullable: true })
  reason_code: string;

  @Column({ nullable: true })
  counted_by: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'counted_by' })
  counter: User;

  @Column({ nullable: true })
  verified_by: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'verified_by' })
  verifier: User;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  created_at: Date;
}
