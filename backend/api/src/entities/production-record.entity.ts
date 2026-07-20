import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Company } from './company.entity';
import { Machine } from './machine.entity';
import { Product } from './product.entity';
import { Employee } from './employee.entity';

@Entity('production_records')
export class ProductionRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  company_id: string;

  @ManyToOne(() => Company)
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @Column({ type: 'date' })
  production_date: Date;

  @Column()
  machine_id: string;

  @ManyToOne(() => Machine)
  @JoinColumn({ name: 'machine_id' })
  machine: Machine;

  @Column()
  product_id: string;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column({ nullable: true })
  batch_number: string;

  @Column()
  quantity_produced: number;

  @Column({ default: 0 })
  quantity_defective: number;

  @Column({ type: 'decimal', precision: 8, scale: 2 })
  hours_operated: number;

  @Column({ type: 'decimal', precision: 8, scale: 2, default: 0 })
  downtime_hours: number;

  @Column({ type: 'decimal', precision: 8, scale: 2, default: 0 })
  setup_time: number;

  @Column({ type: 'jsonb', nullable: true })
  raw_material_used: any;

  @Column({ nullable: true })
  operator_id: string;

  @ManyToOne(() => Employee)
  @JoinColumn({ name: 'operator_id' })
  operator: Employee;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  created_at: Date;
}
