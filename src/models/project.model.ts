import { Table, Column, Model, DataType, BelongsTo, ForeignKey, BelongsToMany, HasMany } from 'sequelize-typescript';
import { Client } from './client.model';
import { Department } from './department.model';
import { Employee } from './employee.model';
import { ProjectMember } from './project-member.model';
import { Task } from './task.model';

@Table
export class Project extends Model {
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
    name: string;

    @Column(DataType.TEXT)
    description: string;

    @Column(DataType.FLOAT)
    budget: number;

    @Column(DataType.DATE)
    startDate: Date;

    @Column(DataType.DATE)
    endDate: Date;

    @ForeignKey(() => Client)
    @Column(DataType.UUID)
    clientId: string;

    @BelongsTo(() => Client)
    client: Client;

    @ForeignKey(() => Department)
    @Column(DataType.UUID)
    departmentId: string;

    @BelongsTo(() => Department)
    department: Department;

    @BelongsToMany(() => Employee, () => ProjectMember)
    members: Employee[];

    @HasMany(() => Task)
    tasks: Task[];
}
