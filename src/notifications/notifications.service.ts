
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Notification } from '../models/notification.model';

type PushCallback = (userId: string, payload: { title: string; body: string; type: string }) => void;

@Injectable()
export class NotificationsService {
    private pushCallback: PushCallback | null = null;

    constructor(
        @InjectModel(Notification)
        private notificationModel: typeof Notification,
    ) { }

    /** Called by ChatGateway to register socket push */
    setPushCallback(cb: PushCallback) {
        this.pushCallback = cb;
    }

    async create(data: { title: string; body: string; type: string; userId: string }) {
        const notif = await this.notificationModel.create(data);
        this.pushCallback?.(data.userId, { title: data.title, body: data.body, type: data.type });
        return notif;
    }

    async createMany(notifications: { title: string; body: string; type: string; userId: string }[]) {
        const result = await this.notificationModel.bulkCreate(notifications);
        for (const n of notifications) {
            this.pushCallback?.(n.userId, { title: n.title, body: n.body, type: n.type });
        }
        return result;
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
