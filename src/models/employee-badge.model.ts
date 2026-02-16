
import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { Employee } from './employee.model';

@Table
export class EmployeeBadge extends Model {
    @Column({
        type: DataType.UUID,
        defaultValue: DataType.UUIDV4,
        primaryKey: true,
    })
    declare id: string;

    @ForeignKey(() => Employee)
    @Column({
        type: DataType.UUID,
        allowNull: false,
    })
    employeeId: string;

    @BelongsTo(() => Employee)
    declare employee: Employee;

    @Column({
        type: DataType.INTEGER,
        allowNull: false,
    })
    badgeNumber: number;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    title: string;

    @Column({
        type: DataType.INTEGER,
        allowNull: false,
    })
    milestone: number;

    @Column({
        type: DataType.DATE,
        defaultValue: DataType.NOW,
    })
    earnedAt: Date;
}
