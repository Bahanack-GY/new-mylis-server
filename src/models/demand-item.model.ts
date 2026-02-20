
import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { Demand } from './demand.model';

@Table
export class DemandItem extends Model {
    @Column({
        type: DataType.UUID,
        defaultValue: DataType.UUIDV4,
        primaryKey: true,
    })
    declare id: string;

    @ForeignKey(() => Demand)
    @Column({
        type: DataType.UUID,
        allowNull: false,
    })
    declare demandId: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    name: string;

    @Column({
        type: DataType.INTEGER,
        allowNull: false,
        defaultValue: 1,
    })
    quantity: number;

    @Column({
        type: DataType.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0,
    })
    unitPrice: number;

    @Column(DataType.STRING)
    imageUrl: string;

    @BelongsTo(() => Demand)
    demand: Demand;
}
