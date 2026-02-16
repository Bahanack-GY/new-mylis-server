import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Project } from '../models/project.model';
import { ProjectMember } from '../models/project-member.model';
import { Client } from '../models/client.model';
import { Department } from '../models/department.model';
import { Employee } from '../models/employee.model';
import { Task } from '../models/task.model';

@Injectable()
export class ProjectsService {
    constructor(
        @InjectModel(Project)
        private projectModel: typeof Project,
        @InjectModel(ProjectMember)
        private projectMemberModel: typeof ProjectMember,
    ) { }

    async findAll(): Promise<Project[]> {
        return this.projectModel.findAll({
            include: [
                Client,
                Department,
                { model: Task, attributes: ['id', 'state'] },
            ],
        });
    }

    async findOne(id: string): Promise<Project | null> {
        return this.projectModel.findByPk(id, {
            include: [
                Client,
                Department,
                { model: Employee, through: { attributes: [] }, attributes: ['id', 'firstName', 'lastName', 'avatarUrl'] },
                {
                    model: Task,
                    include: [{ model: Employee, as: 'assignedTo', attributes: ['id', 'firstName', 'lastName', 'avatarUrl'] }],
                },
            ],
        });
    }

    async create(createProjectDto: any): Promise<Project> {
        return this.projectModel.create(createProjectDto);
    }

    async update(id: string, updateProjectDto: any): Promise<[number, Project[]]> {
        return this.projectModel.update(updateProjectDto, { where: { id }, returning: true });
    }

    async remove(id: string): Promise<void> {
        const project = await this.findOne(id);
        if (project) {
            await project.destroy();
        }
    }

    async findByClient(clientId: string): Promise<Project[]> {
        return this.projectModel.findAll({
            where: { clientId },
            include: [Client, Department, { model: Task, attributes: ['id', 'state'] }],
        });
    }

    async findByDepartment(departmentId: string): Promise<Project[]> {
        return this.projectModel.findAll({
            where: { departmentId },
            include: [Client, Department, { model: Task, attributes: ['id', 'state'] }],
        });
    }

    async findByDepartmentForEmployee(departmentId: string) {
        return this.projectModel.findAll({
            where: { departmentId },
            attributes: { exclude: ['budget', 'clientId'] },
            include: [
                { model: Department, attributes: ['id', 'name'] },
                { model: Employee, through: { attributes: [] }, attributes: ['id', 'firstName', 'lastName', 'avatarUrl'] },
                { model: Task, attributes: ['id', 'state'] },
            ],
        });
    }

    async findOneForEmployee(id: string) {
        return this.projectModel.findByPk(id, {
            attributes: { exclude: ['budget', 'clientId'] },
            include: [
                { model: Department, attributes: ['id', 'name'] },
                { model: Employee, through: { attributes: [] }, attributes: ['id', 'firstName', 'lastName', 'avatarUrl'] },
                {
                    model: Task,
                    include: [{ model: Employee, as: 'assignedTo', attributes: ['id', 'firstName', 'lastName', 'avatarUrl'] }],
                },
            ],
        });
    }
}
