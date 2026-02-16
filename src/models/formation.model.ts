
import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { Employee } from './employee.model';

@Table
export class Formation extends Model {
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

    @Column(DataType.STRING)
    organization: string;

    @Column(DataType.DATE)
    startDate: Date;

    @Column(DataType.DATE)
    endDate: Date;

    @Column(DataType.STRING)
    certificateDetails: string;

    @ForeignKey(() => Employee)
    @Column(DataType.UUID)
    employeeId: string;

    @BelongsTo(() => Employee)
    employee: Employee;
}
