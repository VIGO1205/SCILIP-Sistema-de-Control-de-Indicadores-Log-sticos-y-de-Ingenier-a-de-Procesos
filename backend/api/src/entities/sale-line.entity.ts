import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Sale } from './sale.entity';
import { Product } from './product.entity';

@Entity('sale_lines')
export class SaleLine {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  sale_id: string;

  @ManyToOne(() => Sale, (sale) => sale.lines)
  @JoinColumn({ name: 'sale_id' })
  sale: Sale;

  @Column()
  product_id: string;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column()
  quantity: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  unit_price: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  unit_cost: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  discount: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  total_price: number;

  @CreateDateColumn()
  created_at: Date;
}
