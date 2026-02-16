
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Document } from '../models/document.model';
import { User } from '../models/user.model';
import { Employee } from '../models/employee.model';
import { join } from 'path';
import { readdirSync, statSync } from 'fs';
import { Op } from 'sequelize';

@Injectable()
export class DocumentsService {
    constructor(
        @InjectModel(Document)
        private documentModel: typeof Document,
        @InjectModel(Employee)
        private employeeModel: typeof Employee,
    ) { }

    getStorageInfo() {
        const uploadsDir = join(process.cwd(), 'uploads');
        let totalBytes = 0;
        let fileCount = 0;
        const getDirSize = (dir: string) => {
            try {
                const entries = readdirSync(dir, { withFileTypes: true });
                for (const entry of entries) {
                    const fullPath = join(dir, entry.name);
                    if (entry.isDirectory()) {
                        getDirSize(fullPath);
                    } else {
                        totalBytes += statSync(fullPath).size;
                        fileCount++;
                    }
                }
            } catch { /* directory may not exist yet */ }
        };
        getDirSize(uploadsDir);
        return { totalBytes, fileCount };
    }

    async create(createDocumentDto: any) {
        if (!createDocumentDto.employeeId && createDocumentDto.uploadedById) {
            const employee = await this.employeeModel.findOne({
                where: { userId: createDocumentDto.uploadedById },
                attributes: ['id'],
            });
            if (employee) {
                createDocumentDto.employeeId = employee.getDataValue('id');
            }
        }
        return this.documentModel.create(createDocumentDto);
    }

    findAll() {
        return this.documentModel.findAll({
            include: [
                { model: User, as: 'uploadedBy', attributes: ['id', 'email'] },
                { model: Employee, as: 'employee', attributes: ['id', 'firstName', 'lastName'] },
            ],
            order: [['createdAt', 'DESC']],
        });
    }

    findOne(id: string) {
        return this.documentModel.findByPk(id, {
            include: [
                { model: User, as: 'uploadedBy', attributes: ['id', 'email'] },
                { model: Employee, as: 'employee', attributes: ['id', 'firstName', 'lastName'] },
            ],
        });
    }

    findByUser(userId: string) {
        return this.documentModel.findAll({
            where: { uploadedById: userId },
            include: [
                { model: User, as: 'uploadedBy', attributes: ['id', 'email'] },
                { model: Employee, as: 'employee', attributes: ['id', 'firstName', 'lastName'] },
            ],
            order: [['createdAt', 'DESC']],
        });
    }

    async findByDepartment(departmentId: string) {
        const employees = await this.employeeModel.findAll({
            where: { departmentId },
            attributes: ['userId'],
        });
        const userIds = employees.map(e => e.getDataValue('userId'));
        if (userIds.length === 0) return [];

        return this.documentModel.findAll({
            where: { uploadedById: { [Op.in]: userIds } },
            include: [
                { model: User, as: 'uploadedBy', attributes: ['id', 'email'] },
                { model: Employee, as: 'employee', attributes: ['id', 'firstName', 'lastName'] },
            ],
            order: [['createdAt', 'DESC']],
        });
    }
}
