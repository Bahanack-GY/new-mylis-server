
import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { User } from './user.model';

@Table
export class Notification extends Model {
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
    body: string;

    @Column({
        type: DataType.ENUM('system', 'task', 'project', 'meeting', 'document', 'ticket', 'sanction', 'chat', 'demand', 'message'),
        defaultValue: 'system',
    })
    type: string;

    @Column({
        type: DataType.BOOLEAN,
        defaultValue: false,
    })
    read: boolean;

    @ForeignKey(() => User)
    @Column({
        type: DataType.UUID,
        allowNull: false,
    })
    userId: string;

    @BelongsTo(() => User)
    user: User;
}
