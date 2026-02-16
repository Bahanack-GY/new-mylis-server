
import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table
export class Log extends Model {
    @Column({
        type: DataType.UUID,
        defaultValue: DataType.UUIDV4,
        primaryKey: true,
    })
    declare id: string;

    @Column(DataType.STRING)
    action: string;

    @Column(DataType.STRING)
    userId: string;

    @Column(DataType.JSON)
    details: any;

    @Column(DataType.DATE)
    timestamp: Date;
}
