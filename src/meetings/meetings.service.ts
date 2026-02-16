
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Meeting } from '../models/meeting.model';
import { MeetingParticipant } from '../models/meeting-participant.model';
import { Employee } from '../models/employee.model';
import { User } from '../models/user.model';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class MeetingsService {
    constructor(
        @InjectModel(Meeting)
        private meetingModel: typeof Meeting,
        @InjectModel(MeetingParticipant)
        private meetingParticipantModel: typeof MeetingParticipant,
        @InjectModel(Employee)
        private employeeModel: typeof Employee,
        private notificationsService: NotificationsService,
    ) { }

    async create(dto: any, userId: string) {
        const { participantIds, ...meetingData } = dto;
        const meeting = await this.meetingModel.create({
            ...meetingData,
            organizerId: userId,
        });

        if (participantIds?.length) {
            const rows = participantIds.map((employeeId: string) => ({
                meetingId: meeting.id,
                employeeId,
            }));
            await this.meetingParticipantModel.bulkCreate(rows);

            // Notify all participants
            const employees = await this.employeeModel.findAll({
                where: { id: participantIds },
                attributes: ['id', 'userId'],
            });
            const notifications = employees
                .filter(e => e.getDataValue('userId'))
                .map(e => ({
                    title: 'New Meeting Invitation',
                    body: `You have been invited to "${meetingData.title}"`,
                    type: 'meeting',
                    userId: e.getDataValue('userId'),
                }));
            if (notifications.length) {
                await this.notificationsService.createMany(notifications);
            }
        }

        return this.findOne(meeting.id);
    }

    async findAll(departmentId?: string) {
        const participantInclude: any = {
            model: Employee,
            as: 'participants',
            attributes: ['id', 'firstName', 'lastName', 'avatarUrl', 'departmentId'],
        };
        if (departmentId) {
            participantInclude.where = { departmentId };
            participantInclude.required = true;
        }
        return this.meetingModel.findAll({
            include: [
                { model: User, as: 'organizer', attributes: ['id', 'email'] },
                participantInclude,
            ],
            order: [['date', 'DESC'], ['startTime', 'DESC']],
        });
    }

    async findByUserId(userId: string) {
        const employee = await this.employeeModel.findOne({ where: { userId } });
        if (!employee) return [];
        const employeeId = employee.getDataValue('id');
        const participantRows = await this.meetingParticipantModel.findAll({
            where: { employeeId },
            attributes: ['meetingId'],
        });
        const meetingIds = participantRows.map(r => r.getDataValue('meetingId'));
        if (!meetingIds.length) return [];
        return this.meetingModel.findAll({
            where: { id: meetingIds },
            include: [
                { model: User, as: 'organizer', attributes: ['id', 'email'] },
                {
                    model: Employee,
                    as: 'participants',
                    attributes: ['id', 'firstName', 'lastName', 'avatarUrl', 'departmentId'],
                },
            ],
            order: [['date', 'DESC'], ['startTime', 'DESC']],
        });
    }

    async findOne(id: string) {
        return this.meetingModel.findByPk(id, {
            include: [
                { model: User, as: 'organizer', attributes: ['id', 'email'] },
                { model: Employee, as: 'participants', attributes: ['id', 'firstName', 'lastName', 'avatarUrl'] },
            ],
        });
    }

    async update(id: string, dto: any) {
        const { participantIds, ...meetingData } = dto;

        await this.meetingModel.update(meetingData, { where: { id } });

        if (participantIds !== undefined) {
            await this.meetingParticipantModel.destroy({ where: { meetingId: id } });
            if (participantIds.length) {
                const rows = participantIds.map((employeeId: string) => ({
                    meetingId: id,
                    employeeId,
                }));
                await this.meetingParticipantModel.bulkCreate(rows);
            }
        }

        return this.findOne(id);
    }

    async remove(id: string) {
        await this.meetingParticipantModel.destroy({ where: { meetingId: id } });
        await this.meetingModel.destroy({ where: { id } });
    }
}
