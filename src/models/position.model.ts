
import { Table, Column, Model, DataType, HasMany, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { Employee } from './employee.model';
import { Department } from './department.model';

@Table
export class Position extends Model {
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
        type: DataType.JSON,
        defaultValue: [],
    })
    missions: string[];

    @ForeignKey(() => Department)
    @Column({
        type: DataType.UUID,
        allowNull: true,
    })
    departmentId: string;

    @BelongsTo(() => Department)
    department: Department;

    @HasMany(() => Employee)
    employees: Employee[];
}
