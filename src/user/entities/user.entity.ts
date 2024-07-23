import {Category} from 'src/categories/entities/category.entity'
import {Task} from 'src/tasks/entities/task.entity'
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  email: string

  @Column()
  password: string

  @OneToMany(() => Category, (category) => category.user, {onDelete: 'CASCADE'})
  categories: Category[]

  @OneToMany(() => Task, (task) => task.user, {onDelete: 'CASCADE'})
  tasks: Task[]

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
