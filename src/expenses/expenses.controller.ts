import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ExpensesService } from './expenses.service';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('expenses')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('MANAGER', 'HEAD_OF_DEPARTMENT')
export class ExpensesController {
    constructor(private readonly expensesService: ExpensesService) { }

    @Post()
    create(@Body() createExpenseDto: any) {
        return this.expensesService.create(createExpenseDto);
    }

    @Get()
    findAll() {
        return this.expensesService.findAll();
    }

    @Get('stats')
    getStats(@Query('year') year?: string) {
        return this.expensesService.getStats(year ? parseInt(year) : undefined);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.expensesService.findOne(id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateExpenseDto: any) {
        return this.expensesService.update(id, updateExpenseDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.expensesService.remove(id);
    }
}
