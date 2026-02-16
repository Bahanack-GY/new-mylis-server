
import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { Employee } from './employee.model';
import { Team } from './team.model';
import { Project } from './project.model';

@Table
export class Task extends Model {
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
        type: DataType.ENUM('CREATED', 'ASSIGNED', 'IN_PROGRESS', 'BLOCKED', 'COMPLETED', 'REVIEWED'),
        defaultValue: 'CREATED',
    })
    state: string;

    @Column({
        type: DataType.ENUM('EASY', 'MEDIUM', 'HARD'),
        defaultValue: 'MEDIUM',
    })
    difficulty: string;

    @Column(DataType.DATE)
    startDate: Date;

    @Column(DataType.DATE)
    endDate: Date;

    @Column(DataType.DATE)
    dueDate: Date;

    @Column(DataType.TIME)
    startTime: string;

    @Column(DataType.TIME)
    endTime: string;

    @Column(DataType.TEXT)
    blockReason: string;

    @ForeignKey(() => Employee)
    @Column(DataType.UUID)
    assignedToId: string;

    @BelongsTo(() => Employee, 'assignedToId')
    assignedTo: Employee;

    @ForeignKey(() => Team)
    @Column(DataType.UUID)
    assignedToTeamId: string;

    @BelongsTo(() => Team)
    assignedToTeam: Team;

    @ForeignKey(() => Project)
    @Column(DataType.UUID)
    projectId: string;

    @BelongsTo(() => Project)
    project: Project;

    @Column({ type: DataType.UUID, allowNull: true })
    ticketId: string;
}
