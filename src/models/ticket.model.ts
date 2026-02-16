
import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { User } from './user.model';
import { Department } from './department.model';
import { Employee } from './employee.model';

@Table
export class Ticket extends Model {
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
        type: DataType.ENUM('OPEN', 'ACCEPTED', 'IN_PROGRESS', 'COMPLETED', 'CLOSED'),
        defaultValue: 'OPEN',
    })
    status: string;

    @Column({
        type: DataType.ENUM('LOW', 'MEDIUM', 'HIGH', 'URGENT'),
        defaultValue: 'MEDIUM',
    })
    priority: string;

    @ForeignKey(() => User)
    @Column(DataType.UUID)
    createdById: string;

    @BelongsTo(() => User)
    createdBy: User;

    @ForeignKey(() => Department)
    @Column(DataType.UUID)
    targetDepartmentId: string;

    @BelongsTo(() => Department)
    targetDepartment: Department;

    @ForeignKey(() => Employee)
    @Column(DataType.UUID)
    assignedToId: string;

    @BelongsTo(() => Employee)
    assignedTo: Employee;

    @Column(DataType.DATE)
    dueDate: Date;

    @Column(DataType.DATE)
    closedAt: Date;
}
