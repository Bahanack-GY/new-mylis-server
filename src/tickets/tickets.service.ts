
import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Ticket } from '../models/ticket.model';
import { User } from '../models/user.model';
import { Department } from '../models/department.model';
import { Employee } from '../models/employee.model';
import { TasksService } from '../tasks/tasks.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class TicketsService {
    constructor(
        @InjectModel(Ticket)
        private ticketModel: typeof Ticket,
        @InjectModel(Employee)
        private employeeModel: typeof Employee,
        @InjectModel(Department)
        private departmentModel: typeof Department,
        private tasksService: TasksService,
        private notificationsService: NotificationsService,
    ) { }

    async create(createTicketDto: any, userId: string) {
        return this.ticketModel.create({
            ...createTicketDto,
            createdById: userId,
            status: 'OPEN',
        });
    }

    async findAll() {
        return this.ticketModel.findAll({
            include: [
                { model: User, as: 'createdBy' },
                { model: Department, as: 'targetDepartment' },
                { model: Employee, as: 'assignedTo' },
            ],
            order: [['createdAt', 'DESC']],
        });
    }

    async findOne(id: string) {
        return this.ticketModel.findByPk(id, {
            include: [
                { model: User, as: 'createdBy' },
                { model: Department, as: 'targetDepartment' },
                { model: Employee, as: 'assignedTo' },
            ],
        });
    }

    async findByDepartment(departmentId: string) {
        return this.ticketModel.findAll({
            where: { targetDepartmentId: departmentId },
            include: [
                { model: User, as: 'createdBy' },
                { model: Employee, as: 'assignedTo' },
            ],
        });
    }

    async findByCreator(userId: string) {
        return this.ticketModel.findAll({
            where: { createdById: userId },
            include: [{ model: Department, as: 'targetDepartment' }],
        });
    }

    async assign(id: string, employeeId: string) {
        const ticket = await this.ticketModel.findByPk(id);
        if (!ticket) return null;

        const ticketTitle = ticket.getDataValue('title');

        await this.ticketModel.update(
            { assignedToId: employeeId, status: 'ACCEPTED' },
            { where: { id } },
        );

        await this.tasksService.create({
            title: `[Ticket] ${ticketTitle}`,
            description: ticket.getDataValue('description') || '',
            state: 'ASSIGNED',
            difficulty: 'MEDIUM',
            assignedToId: employeeId,
            startDate: new Date(),
            ticketId: id,
        });

        // Get employee name for notification
        const employee = await this.employeeModel.findByPk(employeeId);
        const empName = employee
            ? `${employee.getDataValue('firstName')} ${employee.getDataValue('lastName')}`
            : 'An employee';

        await this.notifyTicketStakeholders(ticket, 'ACCEPTED', empName);

        return this.findOne(id);
    }

    async notifyTicketStakeholders(ticket: any, status: string, employeeName: string) {
        const ticketTitle = ticket.getDataValue('title');
        const creatorId = ticket.getDataValue('createdById');
        const deptId = ticket.getDataValue('targetDepartmentId');

        const STATUS_LABELS: Record<string, string> = {
            ACCEPTED: 'accepted',
            IN_PROGRESS: 'started working on',
            COMPLETED: 'completed',
        };
        const action = STATUS_LABELS[status] || status.toLowerCase();

        const notifications: { title: string; body: string; type: string; userId: string }[] = [];

        // Notify ticket creator
        if (creatorId) {
            notifications.push({
                title: `Ticket ${status.toLowerCase()}: ${ticketTitle}`,
                body: `${employeeName} has ${action} your ticket "${ticketTitle}".`,
                type: 'ticket',
                userId: creatorId,
            });
        }

        // Notify HOD of the target department
        if (deptId) {
            const dept = await this.departmentModel.findByPk(deptId, {
                include: [{ model: Employee, as: 'head' }],
            });
            const head = dept?.getDataValue('head');
            const hodUserId = head?.getDataValue('userId');
            if (hodUserId && hodUserId !== creatorId) {
                notifications.push({
                    title: `Ticket ${status.toLowerCase()}: ${ticketTitle}`,
                    body: `${employeeName} has ${action} the ticket "${ticketTitle}".`,
                    type: 'ticket',
                    userId: hodUserId,
                });
            }
        }

        if (notifications.length > 0) {
            await this.notificationsService.createMany(notifications);
        }
    }

    async updateStatus(id: string, status: string) {
        return this.ticketModel.update(
            { status },
            { where: { id } },
        );
    }

    async acceptForUser(ticketId: string, userId: string) {
        const employee = await this.employeeModel.findOne({ where: { userId } });
        if (!employee) throw new NotFoundException('Employee not found');

        const ticket = await this.ticketModel.findByPk(ticketId);
        if (!ticket) throw new NotFoundException('Ticket not found');

        if (ticket.getDataValue('status') !== 'OPEN') {
            throw new BadRequestException('Ticket is not open');
        }

        const employeeDeptId = employee.getDataValue('departmentId');
        const ticketDeptId = ticket.getDataValue('targetDepartmentId');
        if (!employeeDeptId || employeeDeptId !== ticketDeptId) {
            throw new ForbiddenException('This ticket is not for your department');
        }

        return this.assign(ticketId, employee.getDataValue('id'));
    }

    async findByDepartmentAll(departmentId: string) {
        return this.ticketModel.findAll({
            where: { targetDepartmentId: departmentId },
            include: [
                { model: User, as: 'createdBy' },
                { model: Department, as: 'targetDepartment' },
                { model: Employee, as: 'assignedTo' },
            ],
            order: [['createdAt', 'DESC']],
        });
    }

    async close(id: string) {
        return this.ticketModel.update(
            { status: 'CLOSED', closedAt: new Date() },
            { where: { id }, returning: true },
        );
    }
}
