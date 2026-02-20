
import { Table, Column, Model, DataType, ForeignKey, BelongsTo, HasMany } from 'sequelize-typescript';
import { Employee } from './employee.model';
import { Department } from './department.model';
import { DemandItem } from './demand-item.model';

@Table
export class Demand extends Model {
    @Column({
        type: DataType.UUID,
        defaultValue: DataType.UUIDV4,
        primaryKey: true,
    })
    declare id: string;

    @Column({
        type: DataType.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0,
    })
    totalPrice: number;

    @Column(DataType.STRING)
    proformaUrl: string;

    @Column({
        type: DataType.ENUM('BARELY', 'IMPORTANT', 'VERY_IMPORTANT', 'URGENT'),
        defaultValue: 'IMPORTANT',
    })
    importance: string;

    @Column({
        type: DataType.ENUM('PENDING', 'VALIDATED', 'REJECTED'),
        defaultValue: 'PENDING',
    })
    status: string;

    @Column(DataType.TEXT)
    rejectionReason: string;

    @Column(DataType.DATE)
    validatedAt: Date;

    @ForeignKey(() => Employee)
    @Column(DataType.UUID)
    employeeId: string;

    @BelongsTo(() => Employee)
    employee: Employee;

    @ForeignKey(() => Department)
    @Column(DataType.UUID)
    departmentId: string;

    @BelongsTo(() => Department)
    department: Department;

    @HasMany(() => DemandItem)
    items: DemandItem[];
}
