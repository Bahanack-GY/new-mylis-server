
import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Demand } from '../models/demand.model';
import { DemandItem } from '../models/demand-item.model';
import { Employee } from '../models/employee.model';
import { Department } from '../models/department.model';
import { DemandsService } from './demands.service';
import { DemandsController } from './demands.controller';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
    imports: [SequelizeModule.forFeature([Demand, DemandItem, Employee, Department]), NotificationsModule],
    controllers: [DemandsController],
    providers: [DemandsService],
    exports: [DemandsService],
})
export class DemandsModule { }
