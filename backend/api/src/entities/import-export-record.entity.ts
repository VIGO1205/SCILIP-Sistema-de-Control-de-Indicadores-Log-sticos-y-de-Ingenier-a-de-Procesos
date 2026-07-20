import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Company } from './company.entity';
import { Product } from './product.entity';
import { Supplier } from './supplier.entity';

@Entity('import_export_records')
export class ImportExportRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  company_id: string;

  @ManyToOne(() => Company)
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @Column()
  operation_type: string;

  @Column()
  product_id: string;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column({ nullable: true })
  supplier_id: string;

  @ManyToOne(() => Supplier)
  @JoinColumn({ name: 'supplier_id' })
  supplier: Supplier;

  @Column({ nullable: true })
  customer_name: string;

  @Column({ type: 'date' })
  operation_date: Date;

  @Column()
  quantity: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  unit_cost_usd: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  total_cost_usd: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  freight_cost_usd: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  insurance_cost_usd: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  customs_duties_usd: number;

  @Column({ nullable: true })
  port_of_origin: string;

  @Column({ nullable: true })
  port_of_destination: string;

  @Column({ nullable: true })
  container_number: string;

  @Column({ nullable: true })
  bl_number: string;

  @Column({ nullable: true })
  status: string;

  @CreateDateColumn()
  created_at: Date;
}
