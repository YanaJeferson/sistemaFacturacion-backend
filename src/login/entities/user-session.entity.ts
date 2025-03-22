import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from '../../register/entities/user.entity';

@Entity('user_sessions')
export class UserSession {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User)
    user: User;

    @Column()
    refreshToken: string;

    @Column()
    deviceInfo: string;

    @Column()
    ipAddress: string;

    @Column({ default: true })
    isActive: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @Column()
    expiresAt: Date;
}