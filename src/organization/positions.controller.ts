
import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { PositionsService } from './positions.service';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../auth/roles.decorator';

import { RolesGuard } from '../auth/roles.guard';

@Roles('MANAGER')
@Controller('organization/positions')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class PositionsController {
    constructor(private readonly positionsService: PositionsService) { }

    @Post()
    create(@Body() createPositionDto: any) {
        return this.positionsService.create(createPositionDto);
    }

    @Get()
    findAll() {
        return this.positionsService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.positionsService.findOne(id);
    }
}
