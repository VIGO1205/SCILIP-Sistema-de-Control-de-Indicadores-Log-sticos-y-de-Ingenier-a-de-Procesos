import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Company } from './company.entity';
import { Product } from './product.entity';
import { Warehouse } from './warehouse.entity';
import { Location } from './location.entity';
import { User } from './user.entity';

@Entity('inventory_movements')
export class InventoryMovement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  company_id: string;

  @ManyToOne(() => Company)
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @Column()
  product_id: string;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column()
  warehouse_id: string;

  @ManyToOne(() => Warehouse)
  @JoinColumn({ name: 'warehouse_id' })
  warehouse: Warehouse;

  @Column({ nullable: true })
  location_id: string;

  @ManyToOne(() => Location)
  @JoinColumn({ name: 'location_id' })
  location: Location;

  @Column()
  movement_type: string;

  @Column()
  quantity: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  unit_cost: number;

  @Column({ nullable: true })
  reference_type: string;

  @Column({ nullable: true })
  reference_id: string;

  @Column({ type: 'date' })
  movement_date: Date;

  @Column({ nullable: true })
  created_by: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by' })
  creator: User;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  created_at: Date;
}
