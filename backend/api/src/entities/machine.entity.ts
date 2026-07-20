import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Company } from './company.entity';
import { Branch } from './branch.entity';

@Entity('machines')
export class Machine {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  company_id: string;

  @ManyToOne(() => Company)
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @Column({ nullable: true })
  branch_id: string;

  @ManyToOne(() => Branch)
  @JoinColumn({ name: 'branch_id' })
  branch: Branch;

  @Column()
  code: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  type: string;

  @Column({ nullable: true })
  brand: string;

  @Column({ nullable: true })
  model: string;

  @Column({ nullable: true })
  serial_number: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  max_capacity: number;

  @Column({ nullable: true })
  capacity_unit: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 100.00 })
  efficiency_rate: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  hourly_rate: number;

  @Column({ type: 'date', nullable: true })
  installation_date: Date;

  @Column({ type: 'date', nullable: true })
  last_maintenance: Date;

  @Column({ type: 'date', nullable: true })
  next_maintenance: Date;

  @Column({ default: 'operational' })
  status: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
