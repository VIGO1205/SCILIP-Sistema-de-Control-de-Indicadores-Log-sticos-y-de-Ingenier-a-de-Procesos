import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Company } from './company.entity';
import { Vehicle } from './vehicle.entity';
import { Driver } from './driver.entity';

@Entity('transport_costs')
export class TransportCost {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  company_id: string;

  @ManyToOne(() => Company)
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @Column()
  vehicle_id: string;

  @ManyToOne(() => Vehicle)
  @JoinColumn({ name: 'vehicle_id' })
  vehicle: Vehicle;

  @Column({ nullable: true })
  driver_id: string;

  @ManyToOne(() => Driver)
  @JoinColumn({ name: 'driver_id' })
  driver: Driver;

  @Column({ type: 'date' })
  cost_date: Date;

  @Column()
  cost_type: string;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  amount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  quantity_liters: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  price_per_liter: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  distance_km: number;

  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true })
  hours_driven: number;

  @Column({ nullable: true })
  invoice_number: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  created_at: Date;
}
