import {User} from 'src/user/entities/user.entity'
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Relation,
  UpdateDateColumn,
} from 'typeorm'

@Entity()
export class Task {
  @PrimaryGeneratedColumn()
  id: number

  @ManyToOne(() => User, (user) => user.tasks)
  @JoinColumn({name: 'user_id'})
  user: User

  @Column()
  text: string

  @Column({nullable: true})
  order: number

  @Column({nullable: true, default: 0})
  parent_id: number

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
