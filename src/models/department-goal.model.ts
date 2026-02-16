import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { Department } from './department.model';

@Table({
    indexes: [
        {
            unique: true,
            fields: ['departmentId', 'year'],
        },
    ],
})
export class DepartmentGoal extends Model {
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
    })
    departmentId: string;

    @Column({
        type: DataType.INTEGER,
        allowNull: false,
    })
    year: number;

    @Column({
        type: DataType.DECIMAL(15, 2),
        allowNull: false,
    })
    targetRevenue: number;

    @Column({
        type: DataType.DECIMAL(15, 2),
        defaultValue: 0,
    })
    currentRevenue: number;

    @BelongsTo(() => Department)
    department: Department;
}
