import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { User } from 'src/user/entitie/user.entities';

@Entity('companies')
export class Companies {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.company, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user_id: User;

  @Column({ name: 'company_name' })
  company_name: string;

  @Column({ length: 11 })
  ruc: string;

  @Column({ nullable: true })
  address: string;

  @Column({ default: 'activo' })
  status: string;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at', nullable: true })
  updated_at: Date;
}
