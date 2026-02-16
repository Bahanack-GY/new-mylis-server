
import { Table, Column, Model, DataType, ForeignKey, BelongsTo, HasMany } from 'sequelize-typescript';
import { User } from './user.model';
import { Department } from './department.model';
import { Position } from './position.model';
import { Team } from './team.model';
import { Task } from './task.model';
import { Document as HrDocument } from './document.model';
import { Formation } from './formation.model';
import { Entretien } from './entretien.model';
import { Sanction } from './sanction.model';
import { Project } from './project.model';
import { ProjectMember } from './project-member.model';
import { EmployeeBadge } from './employee-badge.model';
import { BelongsToMany } from 'sequelize-typescript';

@Table
export class Employee extends Model {
    @Column({
        type: DataType.UUID,
        defaultValue: DataType.UUIDV4,
        primaryKey: true,
    })
    declare id: string;

    @ForeignKey(() => User)
    @Column({
        type: DataType.UUID,
        allowNull: false,
    })
    userId: string;

    @BelongsTo(() => User)
    declare user: User;

    @Column(DataType.STRING)
    firstName: string;

    @Column(DataType.STRING)
    lastName: string;

    @ForeignKey(() => Department)
    @Column(DataType.UUID)
    departmentId: string;

    @BelongsTo(() => Department)
    declare department: Department;

    @ForeignKey(() => Position)
    @Column(DataType.UUID)
    positionId: string;

    @BelongsTo(() => Position)
    declare position: Position;

    @ForeignKey(() => Team)
    @Column(DataType.UUID)
    teamId: string;

    @BelongsTo(() => Team)
    declare team: Team;

    @Column({
        type: DataType.STRING,
        unique: true,
    })
    phoneNumber: string;

    @Column(DataType.TEXT)
    avatarUrl: string;

    @Column(DataType.DATE)
    hireDate: Date;

    @Column(DataType.STRING)
    address: string;

    @Column(DataType.DATE)
    birthDate: Date;

    @Column(DataType.FLOAT)
    salary: number;

    @Column({
        type: DataType.JSON,
        allowNull: true,
        defaultValue: [],
    })
    skills: string[];

    @Column({
        type: DataType.JSON,
        allowNull: true,
        defaultValue: [],
    })
    educationDocs: { name: string; type: string; filePath?: string }[];

    @Column({
        type: DataType.JSON,
        allowNull: true,
        defaultValue: [],
    })
    recruitmentDocs: { name: string; type: string; filePath?: string }[];

    @Column({
        type: DataType.BOOLEAN,
        defaultValue: false,
    })
    dismissed: boolean;

    @Column({
        type: DataType.DATE,
        allowNull: true,
    })
    dismissedAt: Date | null;

    @Column({
        type: DataType.INTEGER,
        defaultValue: 0,
    })
    points: number;

    @HasMany(() => Task)
    declare tasks: Task[];

    @HasMany(() => EmployeeBadge)
    declare badges: EmployeeBadge[];

    @HasMany(() => HrDocument)
    declare documents: HrDocument[];

    @HasMany(() => Formation)
    declare formations: Formation[];

    @HasMany(() => Entretien)
    declare entretiens: Entretien[];

    @HasMany(() => Sanction)
    declare sanctions: Sanction[];

    @BelongsToMany(() => Project, () => ProjectMember)
    declare projects: Project[];
}
