import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { KpiDefinition } from './kpi-definition.entity';

@Entity('kpi_categories')
export class KpiCategory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  code: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ nullable: true })
  icon: string;

  @Column({ nullable: true })
  color: string;

  @Column({ default: 0 })
  display_order: number;

  @Column({ default: true })
  is_active: boolean;

  @OneToMany(() => KpiDefinition, (kpi) => kpi.category)
  definitions: KpiDefinition[];
}
