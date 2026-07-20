import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Company } from './company.entity';
import { Branch } from './branch.entity';

@Entity('vehicles')
export class Vehicle {
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
  plate_number: string;

  @Column({ nullable: true })
  brand: string;

  @Column({ nullable: true })
  model: string;

  @Column({ nullable: true })
  year: number;

  @Column({ nullable: true })
  vehicle_type: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  max_weight_kg: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  max_volume_m3: number;

  @Column({ nullable: true })
  fuel_type: string;

  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true })
  fuel_efficiency: number;

  @Column({ type: 'date', nullable: true })
  insurance_expiry: Date;

  @Column({ type: 'date', nullable: true })
  technical_review_expiry: Date;

  @Column({ default: true })
  is_own_vehicle: boolean;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  lease_cost: number;

  @Column({ default: 'active' })
  status: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
