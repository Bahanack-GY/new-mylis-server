
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Log } from '../models/log.model';
import { Op } from 'sequelize';

@Injectable()
export class LogsService {
    constructor(
        @InjectModel(Log)
        private logModel: typeof Log,
    ) { }

    create(action: string, userId: string, details: any = {}) {
        return this.logModel.create({
            action,
            userId,
            details,
            timestamp: new Date(),
        });
    }

    async findAll(action?: string, from?: string, to?: string) {
        const where: any = {};
        if (action) where.action = action;
        if (from || to) {
            where.timestamp = {};
            if (from) where.timestamp[Op.gte] = new Date(from);
            if (to) where.timestamp[Op.lte] = new Date(to);
        }

        const logs = await this.logModel.findAll({
            where,
            order: [['timestamp', 'DESC']],
            limit: 500,
        });

        if (logs.length === 0) return [];

        // Try to enrich with user names from Employee table
        const userIds = [...new Set(logs.map(l => l.userId).filter(Boolean))];
        let userMap = new Map<string, any>();

        if (userIds.length > 0) {
            try {
                const [users] = await this.logModel.sequelize!.query(`
                    SELECT u.id::text AS id, u.email, u.role,
                           e."firstName", e."lastName", e."avatarUrl"
                    FROM "Users" u
                    LEFT JOIN "Employees" e ON u.id = e."userId"
                    WHERE u.id::text IN (:userIds)
                `, { replacements: { userIds } });

                userMap = new Map((users as any[]).map(u => [u.id, {
                    id: u.id,
                    email: u.email,
                    role: u.role,
                    employee: u.firstName
                        ? { firstName: u.firstName, lastName: u.lastName, avatarUrl: u.avatarUrl }
                        : null,
                }]));
            } catch {
                // If the query fails, we still have details.userEmail/userRole as fallback
            }
        }

        return logs.map(log => {
            const json = log.toJSON() as any;
            const details = json.details || {};

            // Use enriched user data if available, otherwise build from details
            json.user = userMap.get(log.userId) || {
                id: log.userId,
                email: details.userEmail || null,
                role: details.userRole || null,
                employee: null,
            };

            return json;
        });
    }
}
