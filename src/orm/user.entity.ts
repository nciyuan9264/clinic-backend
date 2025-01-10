import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('users') // 对应数据库中的 users 表
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  email: string;

  @Column()
  age: number;
}
