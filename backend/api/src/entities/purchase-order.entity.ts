import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Company } from './company.entity';
import { Supplier } from './supplier.entity';
import { User } from './user.entity';
import { PurchaseOrderLine } from './purchase-order-line.entity';

@Entity('purchase_orders')
export class PurchaseOrder {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  company_id: string;

  @ManyToOne(() => Company)
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @Column()
  po_number: string;

  @Column()
  supplier_id: string;

  @ManyToOne(() => Supplier, (supplier) => supplier.purchase_orders)
  @JoinColumn({ name: 'supplier_id' })
  supplier: Supplier;

  @Column({ nullable: true })
  warehouse_id: string;

  @Column({ type: 'date' })
  order_date: Date;

  @Column({ type: 'date', nullable: true })
  expected_delivery_date: Date;

  @Column({ type: 'date', nullable: true })
  actual_delivery_date: Date;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  subtotal: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  tax: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  total_amount: number;

  @Column({ default: 'COP' })
  currency: string;

  @Column({ default: 'pending' })
  status: string;

  @Column({ type: 'text', nullable: true })
  rejection_reason: string;

  @Column({ nullable: true })
  created_by: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by' })
  creator: User;

  @Column({ nullable: true })
  approved_by: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'approved_by' })
  approver: User;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(() => PurchaseOrderLine, (line) => line.purchase_order)
  lines: PurchaseOrderLine[];
}
