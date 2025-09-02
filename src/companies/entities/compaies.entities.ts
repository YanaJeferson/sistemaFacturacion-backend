import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from "typeorm";
import { User } from 'src/user/entitie/user.entities';
@Entity("companies")
export class Companies {
  @PrimaryGeneratedColumn()
  id: number;


  @ManyToOne(() => User, (user) => user.company, { onDelete: 'CASCADE' })
  user: User;

  @Column()
  company_name: string;

  @Column()
  tax_id: string;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  certificate: string;

  @Column()
  status: boolean;

  @Column()
  created_at: Date;

}