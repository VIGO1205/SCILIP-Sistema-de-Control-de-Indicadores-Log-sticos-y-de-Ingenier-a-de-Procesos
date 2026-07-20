import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Company } from './company.entity';
import { Branch } from './branch.entity';

@Entity('employees')
export class Employee {
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
  employee_code: string;

  @Column()
  full_name: string;

  @Column({ nullable: true })
  document_id: string;

  @Column({ nullable: true })
  position: string;

  @Column({ nullable: true })
  department: string;

  @Column({ type: 'date', nullable: true })
  hire_date: Date;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  salary: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  hourly_rate: number;

  @Column({ nullable: true })
  shift: string;

  @Column({ nullable: true })
  supervisor_id: string;

  @ManyToOne(() => Employee)
  @JoinColumn({ name: 'supervisor_id' })
  supervisor: Employee;

  @Column({ default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
