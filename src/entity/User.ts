import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, update: false })
  email: string;

  @Column({ nullable: true })
  phone?: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  googleId?: string;

  @Column({ nullable: true })
  password?: string;

  @Column({ nullable: true })
  resetToken?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
