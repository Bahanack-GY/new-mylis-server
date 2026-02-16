
import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { Employee } from './employee.model';
import { User } from './user.model';

@Table
export class Entretien extends Model {
    @Column({
        type: DataType.UUID,
        defaultValue: DataType.UUIDV4,
        primaryKey: true,
    })
    declare id: string;

    @Column({
        type: DataType.ENUM('ANNUEL', 'PROFESSIONNEL', 'EVALUATION', 'DISCIPLINAIRE'),
        allowNull: false,
    })
    type: string;

    @Column(DataType.STRING)
    title: string;

    @Column(DataType.DATE)
    date: Date;

    @Column({
        type: DataType.ENUM('SCHEDULED', 'COMPLETED', 'CANCELLED'),
        defaultValue: 'SCHEDULED',
    })
    status: string;

    @Column(DataType.TEXT)
    notes: string;

    @ForeignKey(() => Employee)
    @Column(DataType.UUID)
    employeeId: string;

    @BelongsTo(() => Employee)
    employee: Employee;

    @ForeignKey(() => User)
    @Column(DataType.UUID)
    conductedByUserId: string;

    @BelongsTo(() => User)
    conductedBy: User;
}
