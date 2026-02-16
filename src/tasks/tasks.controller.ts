
import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../auth/roles.decorator';

import { RolesGuard } from '../auth/roles.guard';

@Roles('MANAGER', 'HEAD_OF_DEPARTMENT')
@Controller('tasks')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class TasksController {
    constructor(private readonly tasksService: TasksService) { }

    @Post()
    create(@Body() createTaskDto: any) {
        return this.tasksService.create(createTaskDto);
    }

    @Get()
    findAll(@Query('departmentId') departmentId: string, @Query('from') from: string, @Query('to') to: string, @Request() req) {
        const deptId = req.user.role === 'HEAD_OF_DEPARTMENT' ? req.user.departmentId : departmentId;
        return this.tasksService.findAll(deptId, from, to);
    }

    @Roles('MANAGER', 'HEAD_OF_DEPARTMENT', 'EMPLOYEE')
    @Get('my-tasks')
    findMyTasks(@Request() req) {
        return this.tasksService.findByUserId(req.user.userId);
    }

    @Get('project/:projectId')
    findByProject(@Param('projectId') projectId: string) {
        return this.tasksService.findByProject(projectId);
    }

    @Get('employee/:employeeId')
    findByEmployee(@Param('employeeId') employeeId: string) {
        return this.tasksService.findByEmployee(employeeId);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.tasksService.findOne(id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateTaskDto: any) {
        return this.tasksService.update(id, updateTaskDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.tasksService.remove(id);
    }
}
