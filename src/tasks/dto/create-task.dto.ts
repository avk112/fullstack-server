import {IsEmpty, IsNotEmpty} from 'class-validator'

export class CreateTaskDto {
  @IsNotEmpty()
  text: string

  parent_id?: number
}
