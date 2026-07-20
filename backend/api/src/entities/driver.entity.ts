import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn, ManyToOne } from 'typeorm';
import { Employee } from './employee.entity';
import { Vehicle } from './vehicle.entity';

@Entity('drivers')
export class Driver {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  employee_id: string;

  @OneToOne(() => Employee)
  @JoinColumn({ name: 'employee_id' })
  employee: Employee;

  @Column({ nullable: true })
  license_number: string;

  @Column({ nullable: true })
  license_type: string;

  @Column({ type: 'date', nullable: true })
  license_expiry: Date;

  @Column({ nullable: true })
  assigned_vehicle_id: string;

  @ManyToOne(() => Vehicle)
  @JoinColumn({ name: 'assigned_vehicle_id' })
  vehicle: Vehicle;

  @Column({ type: 'text', array: true, nullable: true })
  routes_assigned: string[];

  @Column({ default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
