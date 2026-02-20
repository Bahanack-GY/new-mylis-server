
import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { LogsService } from './logs.service';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

@Roles('MANAGER', 'HEAD_OF_DEPARTMENT')
@Controller('logs')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class LogsController {
    constructor(private readonly logsService: LogsService) { }

    @Get()
    findAll(@Query('action') action?: string, @Query('from') from?: string, @Query('to') to?: string) {
        return this.logsService.findAll(action, from, to);
    }
}
