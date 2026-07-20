import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Company } from './company.entity';
import { Branch } from './branch.entity';
import { User } from './user.entity';
import { SaleLine } from './sale-line.entity';

@Entity('sales')
export class Sale {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  company_id: string;

  @ManyToOne(() => Company)
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @Column()
  invoice_number: string;

  @Column({ nullable: true })
  branch_id: string;

  @ManyToOne(() => Branch)
  @JoinColumn({ name: 'branch_id' })
  branch: Branch;

  @Column({ nullable: true })
  customer_name: string;

  @Column({ nullable: true })
  customer_document: string;

  @Column({ type: 'date' })
  sale_date: Date;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  subtotal: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  tax: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  total_amount: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  total_cost: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  gross_profit: number;

  @Column({ default: 'COP' })
  currency: string;

  @Column({ nullable: true })
  payment_method: string;

  @Column({ default: 'completed' })
  status: string;

  @Column({ nullable: true })
  created_by: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by' })
  creator: User;

  @CreateDateColumn()
  created_at: Date;

  @OneToMany(() => SaleLine, (line) => line.sale)
  lines: SaleLine[];
}
