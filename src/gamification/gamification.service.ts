
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Employee } from '../models/employee.model';
import { EmployeeBadge } from '../models/employee-badge.model';
import { Task } from '../models/task.model';
import {
    POINTS_BY_DIFFICULTY,
    ON_TIME_BONUS,
    EARLY_BONUS,
    BADGE_DEFINITIONS,
} from './gamification.constants';

export interface GamificationResult {
    pointsEarned: number;
    totalPoints: number;
    newBadge?: {
        badgeNumber: number;
        title: string;
        milestone: number;
    };
}

@Injectable()
export class GamificationService {
    constructor(
        @InjectModel(Employee)
        private employeeModel: typeof Employee,
        @InjectModel(EmployeeBadge)
        private employeeBadgeModel: typeof EmployeeBadge,
        @InjectModel(Task)
        private taskModel: typeof Task,
    ) { }

    async processTaskCompletion(employeeId: string, task: Task): Promise<GamificationResult> {
        // 1. Calculate points based on difficulty
        const difficulty = task.getDataValue('difficulty') || 'MEDIUM';
        let pointsEarned = POINTS_BY_DIFFICULTY[difficulty] || 20;

        // 2. Time bonuses
        const dueDate = task.getDataValue('dueDate');
        if (dueDate) {
            const now = new Date();
            const due = new Date(dueDate);
            const diffDays = Math.floor((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

            if (diffDays >= 3) {
                pointsEarned += EARLY_BONUS;
            } else if (diffDays >= 0) {
                pointsEarned += ON_TIME_BONUS;
            }
        }

        // 3. Update employee points
        const employee = await this.employeeModel.findByPk(employeeId);
        const currentPoints = employee?.getDataValue('points') || 0;
        const newTotal = currentPoints + pointsEarned;
        await employee?.update({ points: newTotal });

        // 4. Check for badge milestone
        const completedCount = await this.taskModel.count({
            where: { assignedToId: employeeId, state: 'COMPLETED' },
        });

        let newBadge: GamificationResult['newBadge'] = undefined;

        const badgeDef = BADGE_DEFINITIONS.find(b => b.milestone === completedCount);
        if (badgeDef) {
            const existing = await this.employeeBadgeModel.findOne({
                where: { employeeId, badgeNumber: badgeDef.badgeNumber },
            });
            if (!existing) {
                await this.employeeBadgeModel.create({
                    employeeId,
                    badgeNumber: badgeDef.badgeNumber,
                    title: badgeDef.title,
                    milestone: badgeDef.milestone,
                });
                newBadge = {
                    badgeNumber: badgeDef.badgeNumber,
                    title: badgeDef.title,
                    milestone: badgeDef.milestone,
                };
            }
        }

        return { pointsEarned, totalPoints: newTotal, newBadge };
    }

    async getEmployeeBadges(employeeId: string): Promise<EmployeeBadge[]> {
        return this.employeeBadgeModel.findAll({
            where: { employeeId },
            order: [['badgeNumber', 'ASC']],
        });
    }
}
