import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Company } from './company.entity';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  company_id: string;

  @ManyToOne(() => Company, (company) => company.products)
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @Column()
  sku: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ nullable: true })
  category: string;

  @Column({ nullable: true })
  subcategory: string;

  @Column({ nullable: true })
  brand: string;

  @Column({ nullable: true })
  unit_of_measure: string;

  @Column({ type: 'decimal', precision: 12, scale: 4, nullable: true })
  weight_kg: number;

  @Column({ type: 'decimal', precision: 12, scale: 4, nullable: true })
  volume_m3: number;

  @Column({ type: 'jsonb', nullable: true })
  dimensions: any;

  @Column({ type: 'char', length: 1, nullable: true })
  abc_classification: string;

  @Column({ default: 0 })
  min_stock: number;

  @Column({ nullable: true })
  max_stock: number;

  @Column({ nullable: true })
  reorder_point: number;

  @Column({ type: 'decimal', precision: 15, scale: 4, nullable: true })
  unit_cost: number;

  @Column({ type: 'decimal', precision: 15, scale: 4, nullable: true })
  selling_price: number;

  @Column({ default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
