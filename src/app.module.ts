
import { Module } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { EmployeesModule } from './employees/employees.module';
import { TasksModule } from './tasks/tasks.module';
import { HrModule } from './hr/hr.module';
import { OrganizationModule } from './organization/organization.module';
import { LogsModule } from './logs/logs.module';
import { TicketsModule } from './tickets/tickets.module';
import { ClientsModule } from './clients/clients.module';
import { ProjectsModule } from './projects/projects.module';
import { MeetingsModule } from './meetings/meetings.module';
import { InvoicesModule } from './invoices/invoices.module';
import { NotificationsModule } from './notifications/notifications.module';
import { ChatModule } from './chat/chat.module';
import { RolesGuard } from './auth/roles.guard';
import { ActivityInterceptor } from './logs/activity.interceptor';

@Module({
  imports: [
    ConfigModule.forRoot(),
    SequelizeModule.forRoot({
      dialect: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_DATABASE || 'mylisapp_db',
      autoLoadModels: true,
      synchronize: true,
      logging: false,
      models: [__dirname + '/**/*.model.ts'],
    }),
    AuthModule,
    UsersModule,
    EmployeesModule,
    TasksModule,
    HrModule,
    OrganizationModule,
    LogsModule,
    TicketsModule,
    ClientsModule,
    ProjectsModule,
    MeetingsModule,
    InvoicesModule,
    NotificationsModule,
    ChatModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_INTERCEPTOR, useClass: ActivityInterceptor },
  ],
})
export class AppModule { }
