import {PartialType} from '@nestjs/mapped-types'
import {CreateTaskDto} from './create-task.dto'

export class ChangeOrderTaskDto extends PartialType(CreateTaskDto) {
  up_in_list: boolean
}
