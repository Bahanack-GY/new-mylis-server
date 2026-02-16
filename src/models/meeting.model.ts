
import { Table, Column, Model, DataType, ForeignKey, BelongsTo, BelongsToMany } from 'sequelize-typescript';
import { User } from './user.model';
import { Employee } from './employee.model';
import { MeetingParticipant } from './meeting-participant.model';

@Table
export class Meeting extends Model {
    @Column({
        type: DataType.UUID,
        defaultValue: DataType.UUIDV4,
        primaryKey: true,
    })
    declare id: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    title: string;

    @Column(DataType.TEXT)
    description: string;

    @Column({
        type: DataType.ENUM('standup', 'review', 'planning', 'retrospective', 'client', 'onboarding'),
        defaultValue: 'standup',
    })
    type: string;

    @Column({
        type: DataType.ENUM('scheduled', 'in_progress', 'completed', 'cancelled'),
        defaultValue: 'scheduled',
    })
    status: string;

    @Column({
        type: DataType.DATEONLY,
        allowNull: false,
    })
    date: string;

    @Column(DataType.STRING)
    startTime: string;

    @Column(DataType.STRING)
    endTime: string;

    @Column(DataType.STRING)
    location: string;

    @ForeignKey(() => User)
    @Column(DataType.UUID)
    organizerId: string;

    @BelongsTo(() => User)
    organizer: User;

    @Column({
        type: DataType.JSON,
        allowNull: true,
    })
    report: {
        summary: string;
        decisions: string[];
        actionItems: { task: string; assignee: string }[];
    } | null;

    @BelongsToMany(() => Employee, () => MeetingParticipant)
    participants: Employee[];
}
