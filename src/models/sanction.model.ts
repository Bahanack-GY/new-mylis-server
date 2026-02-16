
import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { Employee } from './employee.model';
import { User } from './user.model';

@Table
export class Sanction extends Model {
    @Column({
        type: DataType.UUID,
        defaultValue: DataType.UUIDV4,
        primaryKey: true,
    })
    declare id: string;

    @Column({
        type: DataType.ENUM('AVERTISSEMENT', 'BLAME', 'MISE_A_PIED', 'LICENCIEMENT'),
        allowNull: false,
    })
    type: string;

    @Column(DataType.STRING)
    title: string;

    @Column(DataType.TEXT)
    reason: string;

    @Column({
        type: DataType.ENUM('LEGER', 'MOYEN', 'GRAVE'),
        defaultValue: 'LEGER',
    })
    severity: string;

    @Column(DataType.DATE)
    date: Date;

    @ForeignKey(() => Employee)
    @Column(DataType.UUID)
    employeeId: string;

    @BelongsTo(() => Employee)
    employee: Employee;

    @ForeignKey(() => User)
    @Column(DataType.UUID)
    issuedByUserId: string;

    @BelongsTo(() => User)
    issuedBy: User;
}
