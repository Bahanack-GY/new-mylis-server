import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Invoice } from '../models/invoice.model';
import { InvoiceItem } from '../models/invoice-item.model';
import { Project } from '../models/project.model';
import { Department } from '../models/department.model';
import { Client } from '../models/client.model';
import { User } from '../models/user.model';
import { DepartmentGoalsService } from '../organization/department-goals.service';
import { Op } from 'sequelize';

@Injectable()
export class InvoicesService {
    constructor(
        @InjectModel(Invoice)
        private invoiceModel: typeof Invoice,
        @InjectModel(InvoiceItem)
        private invoiceItemModel: typeof InvoiceItem,
        private departmentGoalsService: DepartmentGoalsService,
    ) { }

    private async generateInvoiceNumber(): Promise<string> {
        const year = new Date().getFullYear();
        const prefix = `INV-${year}-`;
        const lastInvoice = await this.invoiceModel.findOne({
            where: { invoiceNumber: { [Op.like]: `${prefix}%` } },
            order: [['invoiceNumber', 'DESC']],
        });
        const nextNum = lastInvoice
            ? parseInt(lastInvoice.invoiceNumber.replace(prefix, ''), 10) + 1
            : 1;
        return `${prefix}${String(nextNum).padStart(4, '0')}`;
    }

    async create(dto: any, userId: string): Promise<Invoice> {
        const invoiceNumber = await this.generateInvoiceNumber();

        const items = dto.items || [];
        const subtotal = items.reduce((sum: number, item: any) => {
            return sum + (Number(item.quantity) * Number(item.unitPrice));
        }, 0);
        const taxRate = Number(dto.taxRate) || 0;
        const taxAmount = Math.round(subtotal * taxRate) / 100;
        const total = subtotal + taxAmount;

        const invoice = await this.invoiceModel.create({
            invoiceNumber,
            status: 'CREATED',
            projectId: dto.projectId,
            departmentId: dto.departmentId,
            clientId: dto.clientId,
            createdById: userId,
            issueDate: dto.issueDate || new Date(),
            dueDate: dto.dueDate,
            subtotal,
            taxRate,
            taxAmount,
            total,
            notes: dto.notes,
        });

        if (items.length > 0) {
            await this.invoiceItemModel.bulkCreate(
                items.map((item: any) => ({
                    invoiceId: invoice.id,
                    description: item.description,
                    quantity: Number(item.quantity),
                    unitPrice: Number(item.unitPrice),
                    amount: Number(item.quantity) * Number(item.unitPrice),
                })),
            );
        }

        return this.findOne(invoice.id);
    }

    async findAll(departmentId?: string): Promise<Invoice[]> {
        const where: any = {};
        if (departmentId) where.departmentId = departmentId;
        return this.invoiceModel.findAll({
            where,
            include: [Project, Department, Client, { model: User, as: 'createdBy' }, InvoiceItem],
            order: [['createdAt', 'DESC']],
        });
    }

    async findOne(id: string): Promise<Invoice> {
        const invoice = await this.invoiceModel.findByPk(id, {
            include: [Project, Department, Client, { model: User, as: 'createdBy' }, InvoiceItem],
        });
        if (!invoice) throw new NotFoundException('Invoice not found');
        return invoice;
    }

    async update(id: string, dto: any): Promise<Invoice> {
        const invoice = await this.findOne(id);
        if (invoice.status !== 'CREATED') {
            throw new BadRequestException('Can only edit invoices with CREATED status');
        }

        // Recompute items if provided
        if (dto.items) {
            await this.invoiceItemModel.destroy({ where: { invoiceId: id } });
            const items = dto.items;
            const subtotal = items.reduce((sum: number, item: any) => {
                return sum + (Number(item.quantity) * Number(item.unitPrice));
            }, 0);
            const taxRate = dto.taxRate !== undefined ? Number(dto.taxRate) : Number(invoice.taxRate);
            const taxAmount = Math.round(subtotal * taxRate) / 100;
            const total = subtotal + taxAmount;

            await this.invoiceItemModel.bulkCreate(
                items.map((item: any) => ({
                    invoiceId: id,
                    description: item.description,
                    quantity: Number(item.quantity),
                    unitPrice: Number(item.unitPrice),
                    amount: Number(item.quantity) * Number(item.unitPrice),
                })),
            );

            dto.subtotal = subtotal;
            dto.taxRate = taxRate;
            dto.taxAmount = taxAmount;
            dto.total = total;
            delete dto.items;
        }

        await invoice.update(dto);
        return this.findOne(id);
    }

    async send(id: string): Promise<Invoice> {
        const invoice = await this.findOne(id);
        if (invoice.status !== 'CREATED') {
            throw new BadRequestException('Can only send invoices with CREATED status');
        }
        await invoice.update({ status: 'SENT', sentAt: new Date() });
        return this.findOne(id);
    }

    async markPaid(id: string): Promise<Invoice> {
        const invoice = await this.findOne(id);
        if (invoice.status !== 'SENT') {
            throw new BadRequestException('Can only mark SENT invoices as paid');
        }
        await invoice.update({ status: 'PAID', paidAt: new Date() });

        // Increment department revenue
        if (invoice.departmentId) {
            const year = new Date().getFullYear();
            let goal = await this.departmentGoalsService.findByDepartmentAndYear(invoice.departmentId, year);
            if (!goal) {
                goal = await this.departmentGoalsService.create({
                    departmentId: invoice.departmentId,
                    year,
                    targetRevenue: 0,
                    currentRevenue: 0,
                });
            }
            const newRevenue = Number(goal.currentRevenue) + Number(invoice.total);
            await this.departmentGoalsService.update(goal.id, { currentRevenue: newRevenue });
        }

        return this.findOne(id);
    }

    async reject(id: string): Promise<Invoice> {
        const invoice = await this.findOne(id);
        if (invoice.status !== 'SENT') {
            throw new BadRequestException('Can only reject SENT invoices');
        }
        await invoice.update({ status: 'REJECTED' });
        return this.findOne(id);
    }

    async remove(id: string): Promise<void> {
        const invoice = await this.findOne(id);
        if (invoice.status !== 'CREATED') {
            throw new BadRequestException('Can only delete invoices with CREATED status');
        }
        await this.invoiceItemModel.destroy({ where: { invoiceId: id } });
        await invoice.destroy();
    }

    async getStats(departmentId?: string, from?: string, to?: string) {
        const where: any = {};
        if (departmentId) where.departmentId = departmentId;
        if (from || to) {
            where.issueDate = {};
            if (from) where.issueDate[Op.gte] = new Date(from);
            if (to) where.issueDate[Op.lte] = new Date(to);
        }

        const invoices = await this.invoiceModel.findAll({ where });

        const totalRevenue = invoices
            .filter(i => i.status === 'PAID')
            .reduce((sum, i) => sum + Number(i.total), 0);

        const totalPending = invoices
            .filter(i => i.status !== 'PAID' && i.status !== 'REJECTED')
            .reduce((sum, i) => sum + Number(i.total), 0);

        const countByStatus = {
            CREATED: invoices.filter(i => i.status === 'CREATED').length,
            SENT: invoices.filter(i => i.status === 'SENT').length,
            PAID: invoices.filter(i => i.status === 'PAID').length,
            REJECTED: invoices.filter(i => i.status === 'REJECTED').length,
        };

        const overdue = invoices.filter(
            i => i.status === 'SENT' && i.dueDate && new Date(i.dueDate) < new Date(),
        ).length;

        return {
            total: invoices.length,
            totalRevenue,
            totalPending,
            overdue,
            countByStatus,
        };
    }
}
