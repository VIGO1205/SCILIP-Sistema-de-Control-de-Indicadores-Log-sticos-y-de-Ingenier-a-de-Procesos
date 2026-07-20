import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { KpiDefinition } from './kpi-definition.entity';

@Entity('kpi_alerts')
export class KpiAlert {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  kpi_id: number;

  @ManyToOne(() => KpiDefinition)
  @JoinColumn({ name: 'kpi_id' })
  definition: KpiDefinition;

  @Column()
  threshold_type: string;

  @Column({ type: 'decimal', precision: 12, scale: 4 })
  threshold_value: number;

  @Column()
  comparison_operator: string;

  @Column()
  severity: string;

  @Column({ default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;
}
