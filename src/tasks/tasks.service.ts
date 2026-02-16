
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Task } from '../models/task.model';
import { Employee } from '../models/employee.model';
import { Ticket } from '../models/ticket.model';
import { Department } from '../models/department.model';
import { Team } from '../models/team.model';
import { Project } from '../models/project.model';
import { NotificationsService } from '../notifications/notifications.service';
import { GamificationService, type GamificationResult } from '../gamification/gamification.service';
import { Op } from 'sequelize';

const TASK_TO_TICKET_STATUS: Record<string, string> = {
    IN_PROGRESS: 'IN_PROGRESS',
    COMPLETED: 'COMPLETED',
};

@Injectable()
export class TasksService {
    constructor(
        @InjectModel(Task)
        private taskModel: typeof Task,
        @InjectModel(Employee)
        private employeeModel: typeof Employee,
        @InjectModel(Ticket)
        private ticketModel: typeof Ticket,
        @InjectModel(Department)
        private departmentModel: typeof Department,
        private notificationsService: NotificationsService,
        private gamificationService: GamificationService,
    ) { }

    async create(createTaskDto: any): Promise<Task> {
        return this.taskModel.create(createTaskDto);
    }

    async findAll(departmentId?: string, from?: string, to?: string): Promise<Task[]> {
        const where: any = {};
        if (from || to) {
            where.createdAt = {};
            if (from) where.createdAt[Op.gte] = new Date(from);
            if (to) where.createdAt[Op.lte] = new Date(to);
        }
        const include: any[] = departmentId
            ? [{ model: Employee, as: 'assignedTo', where: { departmentId }, required: true }, { model: Team, as: 'assignedToTeam' }, Project]
            : [{ model: Employee, as: 'assignedTo' }, { model: Team, as: 'assignedToTeam' }, Project];
        return this.taskModel.findAll({ where, include });
    }

    async findOne(id: string): Promise<Task | null> {
        return this.taskModel.findByPk(id, {
            include: [
                { model: Employee, as: 'assignedTo' },
                { model: Team, as: 'assignedToTeam' },
                Project,
            ],
        });
    }

    async update(id: string, updateTaskDto: any): Promise<[number, Task[]]> {
        return this.taskModel.update(updateTaskDto, {
            where: { id },
            returning: true,
        });
    }

    async remove(id: string): Promise<void> {
        const task = await this.findOne(id);
        if (task) {
            await task.destroy();
        }
    }

    async findByProject(projectId: string): Promise<Task[]> {
        return this.taskModel.findAll({
            where: { projectId },
            include: [
                { model: Employee, as: 'assignedTo' },
                { model: Team, as: 'assignedToTeam' },
                { model: Project },
            ],
        });
    }

    async findByUserId(userId: string): Promise<Task[]> {
        const employee = await this.employeeModel.findOne({ where: { userId } });
        if (!employee) return [];
        return this.findByEmployee(employee.id);
    }

    async updateStateForUser(taskId: string, userId: string, state: string, blockReason?: string): Promise<{ task: Task; gamification?: GamificationResult }> {
        const employee = await this.employeeModel.findOne({ where: { userId } });
        if (!employee) throw new NotFoundException('Employee not found');

        const task = await this.taskModel.findByPk(taskId);
        if (!task) throw new NotFoundException('Task not found');
        if (task.getDataValue('assignedToId') !== employee.id) throw new ForbiddenException('Not your task');

        task.set('state', state);
        if (state === 'BLOCKED' && blockReason) {
            task.set('blockReason', blockReason);
        } else if (state !== 'BLOCKED') {
            task.set('blockReason', null);
        }
        await task.save();

        // Award points and check badges on task completion
        let gamification: GamificationResult | undefined;
        if (state === 'COMPLETED') {
            gamification = await this.gamificationService.processTaskCompletion(employee.id, task);
        }

        // Sync linked ticket status + notify stakeholders
        const ticketId = task.getDataValue('ticketId');
        if (ticketId && TASK_TO_TICKET_STATUS[state]) {
            const ticketStatus = TASK_TO_TICKET_STATUS[state];
            await this.ticketModel.update(
                { status: ticketStatus },
                { where: { id: ticketId } },
            );

            // Send notifications to ticket creator + HOD
            const ticket = await this.ticketModel.findByPk(ticketId);
            if (ticket) {
                const empName = `${employee.getDataValue('firstName')} ${employee.getDataValue('lastName')}`;
                const ticketTitle = ticket.getDataValue('title');
                const creatorId = ticket.getDataValue('createdById');
                const deptId = ticket.getDataValue('targetDepartmentId');

                const STATUS_LABELS: Record<string, string> = {
                    IN_PROGRESS: 'started working on',
                    COMPLETED: 'completed',
                };
                const action = STATUS_LABELS[ticketStatus] || ticketStatus.toLowerCase();

                const notifications: { title: string; body: string; type: string; userId: string }[] = [];

                if (creatorId) {
                    notifications.push({
                        title: `Ticket ${ticketStatus.toLowerCase()}: ${ticketTitle}`,
                        body: `${empName} has ${action} your ticket "${ticketTitle}".`,
                        type: 'ticket',
                        userId: creatorId,
                    });
                }

                if (deptId) {
                    const dept = await this.departmentModel.findByPk(deptId, {
                        include: [{ model: Employee, as: 'head' }],
                    });
                    const head = dept?.getDataValue('head');
                    const hodUserId = head?.getDataValue('userId');
                    if (hodUserId && hodUserId !== creatorId) {
                        notifications.push({
                            title: `Ticket ${ticketStatus.toLowerCase()}: ${ticketTitle}`,
                            body: `${empName} has ${action} the ticket "${ticketTitle}".`,
                            type: 'ticket',
                            userId: hodUserId,
                        });
                    }
                }

                if (notifications.length > 0) {
                    await this.notificationsService.createMany(notifications);
                }
            }
        }

        const updatedTask = await task.reload({
            include: [
                { model: Employee, as: 'assignedTo' },
                { model: Team, as: 'assignedToTeam' },
                { model: Project },
            ],
        });

        return { task: updatedTask, gamification };
    }

    async findByEmployee(employeeId: string): Promise<Task[]> {
        return this.taskModel.findAll({
            where: { assignedToId: employeeId },
            include: [
                { model: Employee, as: 'assignedTo' },
                { model: Team, as: 'assignedToTeam' },
                { model: Project },
            ],
        });
    }
}
