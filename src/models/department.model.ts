import { Table, Column, Model, DataType, HasMany, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { Employee } from './employee.model';
import { Client } from './client.model';
import { Project } from './project.model';
import { DepartmentGoal } from './department-goal.model';
import { Position } from './position.model';

@Table
export class Department extends Model {
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

    @ForeignKey(() => Employee)
    @Column({
        type: DataType.UUID,
        allowNull: true,
    })
    headId: string;

    @BelongsTo(() => Employee)
    head: Employee;

    @HasMany(() => Employee)
    employees: Employee[];

    @HasMany(() => Client)
    clients: Client[];

    @HasMany(() => Project)
    projects: Project[];

    @HasMany(() => DepartmentGoal)
    goals: DepartmentGoal[];

    @HasMany(() => Position)
    positions: Position[];
}
