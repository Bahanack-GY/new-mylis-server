
import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { User } from './user.model';
import { Employee } from './employee.model';

@Table
export class Document extends Model {
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

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    filePath: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    fileType: string;

    @Column({
        type: DataType.ENUM('CONTRACT', 'ID', 'DIPLOMA', 'OTHER'),
        defaultValue: 'OTHER',
    })
    category: string;

    @ForeignKey(() => User)
    @Column(DataType.UUID)
    uploadedById: string;

    @BelongsTo(() => User)
    uploadedBy: User;

    @ForeignKey(() => Employee)
    @Column(DataType.UUID)
    employeeId: string;

    @BelongsTo(() => Employee)
    employee: Employee;
}
