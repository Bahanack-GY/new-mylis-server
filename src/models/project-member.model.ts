import { Table, Column, Model, ForeignKey, DataType } from 'sequelize-typescript';
import { Project } from './project.model';
import { Employee } from './employee.model';

@Table
export class ProjectMember extends Model {
    @ForeignKey(() => Project)
    @Column(DataType.UUID)
    projectId: string;

    @ForeignKey(() => Employee)
    @Column(DataType.UUID)
    employeeId: string;
}
