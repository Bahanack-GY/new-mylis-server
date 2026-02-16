
import { Table, Column, Model, DataType, HasMany, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { Employee } from './employee.model';

@Table
export class Team extends Model {
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

    @ForeignKey(() => Employee)
    @Column(DataType.UUID)
    leadId: string;

    @BelongsTo(() => Employee, 'leadId')
    lead: Employee;

    @HasMany(() => Employee, 'teamId')
    members: Employee[];
}
