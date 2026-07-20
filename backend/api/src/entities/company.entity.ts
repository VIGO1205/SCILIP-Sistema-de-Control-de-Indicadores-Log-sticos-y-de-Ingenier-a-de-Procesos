import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Branch } from './branch.entity';
import { Supplier } from './supplier.entity';
import { Product } from './product.entity';
import { Warehouse } from './warehouse.entity';

@Entity('companies')
export class Company {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  tax_id: string;

  @Column()
  legal_name: string;

  @Column({ nullable: true })
  trade_name: string;

  @Column({ nullable: true })
  logo_url: string;

  @Column({ nullable: true })
  logo_dark_url: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ type: 'text', nullable: true })
  address: string;

  @Column({ nullable: true })
  city: string;

  @Column({ nullable: true })
  country: string;

  @Column({ nullable: true })
  website: string;

  @Column({ type: 'jsonb', default: {} })
  settings: any;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(() => Branch, (branch) => branch.company)
  branches: Branch[];

  @OneToMany(() => Supplier, (supplier) => supplier.company)
  suppliers: Supplier[];

  @OneToMany(() => Product, (product) => product.company)
  products: Product[];

  @OneToMany(() => Warehouse, (warehouse) => warehouse.company)
  warehouses: Warehouse[];
}
