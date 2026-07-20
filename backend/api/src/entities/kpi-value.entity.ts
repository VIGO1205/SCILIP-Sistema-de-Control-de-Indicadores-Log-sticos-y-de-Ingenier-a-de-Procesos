import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { KpiDefinition } from './kpi-definition.entity';
import { Company } from './company.entity';
import { Branch } from './branch.entity';
import { User } from './user.entity';

@Entity('kpi_values')
export class KpiValue {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  kpi_id: number;

  @ManyToOne(() => KpiDefinition, (def) => def.values)
  @JoinColumn({ name: 'kpi_id' })
  definition: KpiDefinition;

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

  @Column({ type: 'date' })
  period_date: Date;

  @Column({ type: 'decimal', precision: 12, scale: 4, nullable: true })
  actual_value: number;

  @Column({ type: 'decimal', precision: 12, scale: 4, nullable: true })
  target_value: number;

  @Column({ type: 'decimal', precision: 12, scale: 4, nullable: true })
  previous_value: number;

  @Column({ type: 'decimal', precision: 12, scale: 4 })
  variance_absolute: number;

  @Column({ type: 'decimal', precision: 12, scale: 4, nullable: true })
  variance_percentage: number;

  @Column({ nullable: true })
  status: string;

  @Column({ type: 'jsonb', nullable: true })
  data_source_metadata: any;

  @Column({ nullable: true })
  calculated_by: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'calculated_by' })
  calculator: User;

  @CreateDateColumn()
  calculated_at: Date;

  @Column({ type: 'text', nullable: true })
  notes: string;
}
