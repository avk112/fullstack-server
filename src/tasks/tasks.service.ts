import {BadRequestException, Injectable} from '@nestjs/common'
import {CreateTaskDto} from './dto/create-task.dto'
import {UpdateTaskDto} from './dto/update-task.dto'
import {Task} from './entities/task.entity'
import {InjectRepository} from '@nestjs/typeorm'
import {IsNull, Repository} from 'typeorm'
import {ChangeParentTaskDto} from './dto/change-parent-task.dto'
import {ChangeOrderTaskDto} from './dto/change-order-task.dto'

@Injectable()
export class TasksService {
  constructor(@InjectRepository(Task) private taskRepository: Repository<Task>) {}

  async create(task: CreateTaskDto, user_id: number) {
    const sameLevelTasks = await this.taskRepository.find({
      select: ['order'],
      where: {parent_id: task.parent_id, user: {id: user_id}},
    })
    console.log(sameLevelTasks)
    const maxOrder = sameLevelTasks.length
      ? Math.max(...sameLevelTasks.map((item) => item.order))
      : 0

    const newTask = await this.taskRepository.save({
      text: task.text,
      parent_id: task.parent_id,
      order: maxOrder + 1,
      user: {id: user_id},
    })

    return {message: 'success'}
  }

  async findAll(userId: number) {
    const user_id = isNaN(userId) ? 0 : userId
    const arr = await this.taskRepository.find({
      where: {
        user: {
          id: user_id,
        },
      },
    })

    function recursiveFind(arr: any[], parent_id: number = null) {
      const result = []
      for (let item of arr) {
        if (item.parent_id === parent_id) {
          const shortedArr = arr.filter((unit) => unit.id !== item.id)
          const children = recursiveFind(shortedArr, item.id)

          if (children.length) {
            item.children = children
          }

          result.push(item)
        }
      }
      return result
    }

    const recursiveSortData = (data: any[]) => {
      const result: any[] = []
      const sortedData = data.sort((a: any, b: any) => a.order - b.order)
      result.push(...sortedData)

      for (let i = 0; i < sortedData.length; i++) {
        if (sortedData[i].children) {
          const sortedChildren = recursiveSortData(sortedData[i].children)
          result[i].children = sortedChildren
        }
      }

      return result
    }

    const foundData = recursiveFind(arr)
    return recursiveSortData(foundData)
  }

  findOne(id: number) {
    const user = this.taskRepository.findOneBy({id: id})
    if (!user) throw new BadRequestException('No such task!')
    return user
  }

  async update(id: number, updateTaskDto: UpdateTaskDto, userId: number) {
    const user_id = isNaN(userId) ? 0 : userId
    const isExistTaskToUpdate = await this.taskRepository.findOneBy({id: id, user: {id: user_id}})
    if (!isExistTaskToUpdate) throw new BadRequestException('No such task!')
    return this.taskRepository.update(id, {text: updateTaskDto.text})
  }

  async changeParent(id: number, changeParentTaskDto: ChangeParentTaskDto, user_id: number) {
    if (changeParentTaskDto.future_parent_id !== id) {
      const targetTasktId = changeParentTaskDto.future_parent_id
      const isExistTaskToUpdate = await this.taskRepository.findOneBy({id: id, user: {id: user_id}})
      if (!isExistTaskToUpdate) throw new BadRequestException('No such task!')

      if (targetTasktId !== null) {
        const isExistTargetTask = await this.taskRepository.findOneBy({
          id: targetTasktId,
          user: {id: user_id},
        })
        if (!isExistTargetTask) throw new BadRequestException('No such task!')

        const recursiveFindParents = async (newParentId: number) => {
          const result = []
          const newParent = await this.taskRepository.findOneBy({
            id: newParentId,
            user: {id: user_id},
          })
          if (newParent) {
            if (newParent.parent_id !== null) {
              const grandParent = await recursiveFindParents(newParent.parent_id)
              grandParent && result.push(grandParent)
            }
            result.push(newParent.id)
          }
          return result.flat()
        }

        const arr = await recursiveFindParents(isExistTargetTask.id)
        //writing parent_id to target if current task has NULL (prime level) parent_id
        // also changing order for target to next in the list where current task was
        if (arr.includes(isExistTaskToUpdate.id)) {
          const sameLevelTasks = await this.taskRepository.find({
            select: ['order', 'id'],
            where: {
              parent_id:
                isExistTaskToUpdate.parent_id === null ? IsNull() : isExistTaskToUpdate.parent_id,
              user: {id: user_id},
            },
            order: {order: 'ASC'},
          })
          const maxOrder = sameLevelTasks.length
            ? Math.max(...sameLevelTasks.map((item) => item.order))
            : 0
          const allChildrenTasks = await this.taskRepository.find({
            select: ['id'],
            where: {
              parent_id: id,
              user: {id: user_id},
            },
            order: {order: 'ASC'},
          })
          for (let i = 1; i <= allChildrenTasks.length; i++) {
            await this.taskRepository
              .createQueryBuilder()
              .update(Task)
              .set({parent_id: isExistTaskToUpdate.parent_id, order: maxOrder + i})
              .where({id: allChildrenTasks[i - 1].id, user: {id: user_id}})
              .execute()
          }
        }
      }
      // changing parent_id for current task only
      // also changing order for current task to next in the new list
      const sameLevelTasks = await this.taskRepository.find({
        select: ['order'],
        where: {
          parent_id: targetTasktId === null ? IsNull() : targetTasktId,
          user: {id: user_id},
        },
      })
      const maxOrder = sameLevelTasks.length
        ? Math.max(...sameLevelTasks.map((item) => item.order))
        : 0

      return this.taskRepository.update(isExistTaskToUpdate.id, {
        parent_id: targetTasktId,
        order: maxOrder + 1,
      })
    }
  }

  async changeOrder(id: number, changeOrderTaskDto: ChangeOrderTaskDto, userId: number) {
    const user_id = isNaN(userId) ? 0 : userId
    const isUp = changeOrderTaskDto.up_in_list

    const isExistTaskToUpdate = await this.taskRepository.findOneBy({id: id, user: {id: user_id}})
    if (!isExistTaskToUpdate) throw new BadRequestException('No such task to change order!')
    const currentOrder = isExistTaskToUpdate.order

    const sameLevelTasks = await this.taskRepository.find({
      select: ['order', 'id'],
      where: {
        parent_id:
          isExistTaskToUpdate.parent_id === null ? IsNull() : isExistTaskToUpdate.parent_id,
        user: {id: user_id},
      },
      order: {order: 'ASC'},
    })

    if (sameLevelTasks.length > 1) {
      let taskToExchange
      for (let i = 0; i < sameLevelTasks.length; i++) {
        if (sameLevelTasks[i].id === id) {
          const prevOrNext = isUp ? i - 1 : i + 1
          if (sameLevelTasks[prevOrNext]) {
            taskToExchange = {
              id: sameLevelTasks[prevOrNext].id,
              order: sameLevelTasks[prevOrNext].order,
              user: {id: user_id},
            }
          }
          break
        }
      }

      if (taskToExchange) {
        // return {taskToExchange}
        await this.taskRepository
          .createQueryBuilder()
          .update(Task)
          .set({order: taskToExchange.order})
          .where({id: id, user: {id: user_id}})
          .execute()

        return await this.taskRepository
          .createQueryBuilder()
          .update(Task)
          .set({order: currentOrder})
          .where({id: taskToExchange.id, user: {id: user_id}})
          .execute()
      }
    }
    return {message: 'Your task is a single in a list'}
  }

  async delete(idToDel: number, userId: number) {
    const user_id = isNaN(userId) ? 0 : userId
    const recursiveFindChildren = async (id: number) => {
      const result = []
      const parent = await this.taskRepository.findOneBy({id: id, user: {id: user_id}})
      if (parent) {
        const children = await this.taskRepository.find({
          where: {parent_id: id, user: {id: user_id}},
        })
        if (children.length) {
          for (let item of children) {
            const child = await recursiveFindChildren(item.id)
            result.push(child)
          }
        }
        result.push(parent)
      }
      return result.flat()
    }

    const tasksToDel = await recursiveFindChildren(idToDel)
    let query = ''

    for (let item of tasksToDel) {
      const stringToAdd =
        tasksToDel.indexOf(item) === tasksToDel.length - 1 ? `id= ${item.id}` : `id= ${item.id} OR `
      query = query + stringToAdd
    }

    if (!query) throw new BadRequestException("This task doesn't exist!")
    return this.taskRepository.createQueryBuilder().delete().from(Task).where(query).execute()
  }
}
