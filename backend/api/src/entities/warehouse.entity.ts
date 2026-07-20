import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Company } from './company.entity';
import { Branch } from './branch.entity';

@Entity('warehouses')
export class Warehouse {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  company_id: string;

  @ManyToOne(() => Company, (company) => company.warehouses)
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

  @Column({ type: 'text', nullable: true })
  address: string;

  @Column({ nullable: true })
  city: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  total_area_m2: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  usable_area_m2: number;

  @Column({ nullable: true })
  storage_capacity_units: number;

  @Column({ nullable: true })
  dock_doors: number;

  @Column({ type: 'jsonb', nullable: true })
  operating_hours: any;

  @Column({ nullable: true })
  contact_person: string;

  @Column({ nullable: true })
  contact_phone: string;

  @Column({ default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
