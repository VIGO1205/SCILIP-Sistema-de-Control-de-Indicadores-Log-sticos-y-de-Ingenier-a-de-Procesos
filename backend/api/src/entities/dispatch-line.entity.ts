import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Dispatch } from './dispatch.entity';
import { Product } from './product.entity';

@Entity('dispatch_lines')
export class DispatchLine {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  dispatch_id: string;

  @ManyToOne(() => Dispatch, (d) => d.lines)
  @JoinColumn({ name: 'dispatch_id' })
  dispatch: Dispatch;

  @Column()
  product_id: string;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column()
  quantity_requested: number;

  @Column()
  quantity_dispatched: number;

  @Column({ default: 0 })
  quantity_damaged: number;

  @CreateDateColumn()
  created_at: Date;
}
