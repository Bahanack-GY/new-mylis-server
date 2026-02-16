
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User } from '../models/user.model';
import { Employee } from '../models/employee.model';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
    constructor(
        @InjectModel(User)
        private userModel: typeof User,
    ) { }

    async findOne(email: string): Promise<User | null> {
        return this.userModel.findOne({ where: { email } });
    }

    async findOneWithEmployee(email: string): Promise<User | null> {
        return this.userModel.findOne({
            where: { email },
            include: [{ model: Employee, attributes: ['id', 'departmentId', 'dismissed'] }],
        });
    }

    async findOneById(id: string): Promise<User | null> {
        return this.userModel.findByPk(id);
    }

    async create(userData: { email: string; password: string; role?: string; firstName?: string; lastName?: string }): Promise<User> {
        const salt = await bcrypt.genSalt();
        const passwordHash = await bcrypt.hash(userData.password, salt);
        return this.userModel.create({
            email: userData.email,
            passwordHash,
            role: userData.role || 'EMPLOYEE',
        });
    }
}
