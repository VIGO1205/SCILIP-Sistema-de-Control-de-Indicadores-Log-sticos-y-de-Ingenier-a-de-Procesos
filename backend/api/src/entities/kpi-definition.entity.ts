import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { KpiCategory } from './kpi-category.entity';
import { KpiValue } from './kpi-value.entity';

@Entity('kpi_definitions')
export class KpiDefinition {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  code: string;

  @Column()
  category_id: number;

  @ManyToOne(() => KpiCategory, (cat) => cat.definitions)
  @JoinColumn({ name: 'category_id' })
  category: KpiCategory;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'text', nullable: true })
  objective: string;

  @Column({ type: 'text' })
  formula: string;

  @Column({ nullable: true })
  unit: string;

  @Column({ nullable: true })
  unit_type: string;

  @Column({ default: 'down' })
  direction: string;

  @Column({ type: 'decimal', precision: 12, scale: 4, nullable: true })
  target_value: number;

  @Column({ type: 'decimal', precision: 12, scale: 4, nullable: true })
  min_value: number;

  @Column({ type: 'decimal', precision: 12, scale: 4, nullable: true })
  max_value: number;

  @Column({ default: 'monthly' })
  periodicity: string;

  @Column({ nullable: true })
  responsible_role: string;

  @Column({ nullable: true })
  data_source: string;

  @Column({ type: 'text', nullable: true })
  calculation_query: string;

  @Column({ default: false })
  is_custom: boolean;

  @Column({ default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(() => KpiValue, (val) => val.definition)
  values: KpiValue[];
}
