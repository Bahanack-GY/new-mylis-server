import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { Department } from './department.model';

@Table
export class InvoiceTemplate extends Model {
    @Column({
        type: DataType.UUID,
        defaultValue: DataType.UUIDV4,
        primaryKey: true,
    })
    declare id: string;

    @ForeignKey(() => Department)
    @Column({
        type: DataType.UUID,
        allowNull: false,
        unique: true,
    })
    departmentId: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    companyName: string;

    @Column(DataType.STRING)
    logoUrl: string;

    @Column(DataType.TEXT)
    address: string;

    @Column(DataType.STRING)
    phone: string;

    @Column(DataType.STRING)
    email: string;

    @Column(DataType.TEXT)
    paymentTerms: string;

    @Column(DataType.TEXT)
    footerText: string;

    @Column(DataType.TEXT)
    bankInfo: string;

    @BelongsTo(() => Department)
    department: Department;
}
