import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Company } from './company.entity';
import { Sale } from './sale.entity';
import { Warehouse } from './warehouse.entity';
import { Vehicle } from './vehicle.entity';
import { Driver } from './driver.entity';
import { User } from './user.entity';
import { DispatchLine } from './dispatch-line.entity';

@Entity('dispatches')
export class Dispatch {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  company_id: string;

  @ManyToOne(() => Company)
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @Column()
  dispatch_number: string;

  @Column({ nullable: true })
  sale_id: string;

  @ManyToOne(() => Sale)
  @JoinColumn({ name: 'sale_id' })
  sale: Sale;

  @Column()
  warehouse_id: string;

  @ManyToOne(() => Warehouse)
  @JoinColumn({ name: 'warehouse_id' })
  warehouse: Warehouse;

  @Column({ nullable: true })
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
  dispatch_date: Date;

  @Column({ type: 'time', nullable: true })
  scheduled_time: string;

  @Column({ type: 'time', nullable: true })
  actual_departure_time: string;

  @Column({ type: 'time', nullable: true })
  actual_delivery_time: string;

  @Column({ default: 'pending' })
  dispatch_status: string;

  @Column({ nullable: true })
  delivered_on_time: boolean;

  @Column({ nullable: true })
  delivered_complete: boolean;

  @Column({ nullable: true })
  documentation_ok: boolean;

  @Column({ nullable: true })
  perfect_delivery: boolean;

  @Column({ type: 'text', nullable: true })
  delivery_address: string;

  @Column({ nullable: true })
  receiver_name: string;

  @Column({ nullable: true })
  receiver_signature_url: string;

  @Column({ type: 'text', nullable: true })
  delivery_notes: string;

  @Column({ nullable: true })
  created_by: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by' })
  creator: User;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(() => DispatchLine, (line) => line.dispatch)
  lines: DispatchLine[];
}
