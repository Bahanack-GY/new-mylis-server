
import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, Request } from '@nestjs/common';
import { EmployeesService } from './employees.service';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../auth/roles.decorator';

import { RolesGuard } from '../auth/roles.guard';

@Roles('MANAGER', 'HEAD_OF_DEPARTMENT')
@Controller('employees')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class EmployeesController {
    constructor(private readonly employeesService: EmployeesService) { }

    @Post()
    create(@Body() createEmployeeDto: any) {
        return this.employeesService.create(createEmployeeDto);
    }

    @Get()
    findAll(@Query('departmentId') departmentId: string, @Request() req) {
        const deptId = req.user.role === 'HEAD_OF_DEPARTMENT' ? req.user.departmentId : departmentId;
        return this.employeesService.findAll(deptId);
    }

    @Roles('MANAGER', 'HEAD_OF_DEPARTMENT', 'EMPLOYEE')
    @Get('leaderboard')
    getLeaderboard(@Query('limit') limit?: string) {
        return this.employeesService.getLeaderboard(limit ? parseInt(limit, 10) : 5);
    }

    @Get(':id/stats')
    getStats(@Param('id') id: string) {
        return this.employeesService.getEmployeeStats(id);
    }

    @Get(':id/badges')
    getBadges(@Param('id') id: string) {
        return this.employeesService.getEmployeeBadges(id);
    }

    @Patch(':id/dismiss')
    dismiss(@Param('id') id: string) {
        return this.employeesService.dismiss(id);
    }

    @Patch(':id/reinstate')
    reinstate(@Param('id') id: string) {
        return this.employeesService.reinstate(id);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.employeesService.findOne(id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateEmployeeDto: any) {
        return this.employeesService.update(id, updateEmployeeDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.employeesService.remove(id);
    }
}
