import {PartialType} from '@nestjs/mapped-types'
import {CreateTaskDto} from './create-task.dto'

export class ChangeParentTaskDto extends PartialType(CreateTaskDto) {
  future_parent_id: number | null
}
