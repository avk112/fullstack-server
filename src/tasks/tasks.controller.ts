import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UsePipes,
  ValidationPipe,
  UseGuards,
  Req,
} from '@nestjs/common'
import {TasksService} from './tasks.service'
import {CreateTaskDto} from './dto/create-task.dto'
import {UpdateTaskDto} from './dto/update-task.dto'
import {ChangeParentTaskDto} from './dto/change-parent-task.dto'
import {ChangeOrderTaskDto} from './dto/change-order-task.dto'
import {JwtAuthGuard} from 'src/auth/guards/jwt-auth.guard'

@UseGuards(JwtAuthGuard)
@Controller('task')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @UsePipes(new ValidationPipe())
  create(@Body() createTaskDto: CreateTaskDto, @Req() req) {
    return this.tasksService.create(createTaskDto, req.user.id)
  }

  @Get()
  findAll(@Req() req) {
    return this.tasksService.findAll(req.user.id)
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tasksService.findOne(+id)
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTaskDto: UpdateTaskDto, @Req() req) {
    return this.tasksService.update(+id, updateTaskDto, req.user.id)
  }

  @Patch(':id/change-parent')
  changeParent(
    @Param('id') id: string,
    @Body() changeParentTaskDto: ChangeParentTaskDto,
    @Req() req
  ) {
    return this.tasksService.changeParent(+id, changeParentTaskDto, req.user.id)
  }

  @Patch(':id/change-order')
  changeOrder(@Param('id') id: string, @Body() changeOrderTaskDto: ChangeOrderTaskDto, @Req() req) {
    return this.tasksService.changeOrder(+id, changeOrderTaskDto, req.user.id)
  }

  @Delete(':id')
  delete(@Param('id') id: string, @Req() req) {
    return this.tasksService.delete(+id, req.user.id)
  }
}
