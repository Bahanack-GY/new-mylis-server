
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Notification } from '../models/notification.model';

@Injectable()
export class NotificationsService {
    constructor(
        @InjectModel(Notification)
        private notificationModel: typeof Notification,
    ) { }

    async create(data: { title: string; body: string; type: string; userId: string }) {
        return this.notificationModel.create(data);
    }

    async createMany(notifications: { title: string; body: string; type: string; userId: string }[]) {
        return this.notificationModel.bulkCreate(notifications);
    }

    async findForUser(userId: string) {
        return this.notificationModel.findAll({
            where: { userId },
            order: [['createdAt', 'DESC']],
        });
    }

    async markAsRead(id: string, userId: string) {
        return this.notificationModel.update(
            { read: true },
            { where: { id, userId } },
        );
    }

    async markAllAsRead(userId: string) {
        return this.notificationModel.update(
            { read: true },
            { where: { userId, read: false } },
        );
    }
}
