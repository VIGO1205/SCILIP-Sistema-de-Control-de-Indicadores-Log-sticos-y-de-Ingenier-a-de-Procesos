import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Company } from './company.entity';
import { PurchaseOrder } from './purchase-order.entity';

@Entity('suppliers')
export class Supplier {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  company_id: string;

  @ManyToOne(() => Company, (company) => company.suppliers)
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @Column()
  code: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  tax_id: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ type: 'text', nullable: true })
  address: string;

  @Column({ nullable: true })
  contact_person: string;

  @Column({ nullable: true })
  contact_phone: string;

  @Column({ nullable: true })
  payment_terms: string;

  @Column({ default: 0 })
  lead_time_days: number;

  @Column({ default: false })
  is_certified: boolean;

  @Column({ type: 'date', nullable: true })
  certification_date: Date;

  @Column({ type: 'date', nullable: true })
  certification_expiry: Date;

  @Column({ nullable: true })
  certification_document_url: string;

  @Column({ type: 'decimal', precision: 3, scale: 2, nullable: true })
  rating: number;

  @Column({ default: 'active' })
  status: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(() => PurchaseOrder, (po) => po.supplier)
  purchase_orders: PurchaseOrder[];
}
