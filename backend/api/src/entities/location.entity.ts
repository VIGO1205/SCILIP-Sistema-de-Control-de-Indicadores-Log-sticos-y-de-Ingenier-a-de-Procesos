import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Warehouse } from './warehouse.entity';

@Entity('locations')
export class Location {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  warehouse_id: string;

  @ManyToOne(() => Warehouse)
  @JoinColumn({ name: 'warehouse_id' })
  warehouse: Warehouse;

  @Column({ nullable: true })
  zone: string;

  @Column({ nullable: true })
  aisle: string;

  @Column({ nullable: true })
  rack: string;

  @Column({ nullable: true })
  level: string;

  @Column({ nullable: true })
  position: string;

  @Column()
  location_code: string;

  @Column({ nullable: true })
  location_type: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  max_weight_kg: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  max_volume_m3: number;

  @Column({ default: false })
  is_occupied: boolean;

  @CreateDateColumn()
  created_at: Date;
}
