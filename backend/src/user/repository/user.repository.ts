import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@/prisma/prisma.service';

// Поля, доступные в списке пользователей
const publicUserSelect = {
	id: true,
	login: true,
	name: true,
	age: true,
	description: true,
	picture: true,
	role: true,
	createdAt: true,
	updatedAt: true
} satisfies Prisma.UserSelect;

// Дополнительные поля собственного профиля
const profileUserSelect = {
	...publicUserSelect,
	email: true,
	balance: true,
	deletedAt: true
} satisfies Prisma.UserSelect;

@Injectable()
export class UserRepository {
	constructor(private readonly prismaService: PrismaService) {}

	public async findAll(page: number, limit: number, search: string) {
		const where: Prisma.UserWhereInput = {
			deletedAt: null,
			...(search.trim() && {
				login: {
					contains: search.trim(),
					mode: 'insensitive'
				}
			})
		};

		const [users, total] = await Promise.all([
			this.prismaService.user.findMany({
				where,
				skip: (page - 1) * limit,
				take: limit,
				orderBy: [{ createdAt: 'desc' }, { id: 'asc' }],
				select: publicUserSelect
			}),

			this.prismaService.user.count({
				where
			})
		]);

		return { users, total };
	}

	public async findByEmail(email: string) {
		return await this.prismaService.user.findFirst({
			where: {
				email: {
					equals: email.trim(),
					mode: 'insensitive'
				},
				deletedAt: null
			}
		});
	}

	public async findById(id: string) {
		return await this.prismaService.user.findUnique({
			where: {
				id,
				deletedAt: null
			},
			select: profileUserSelect
		});
	}

	public async findByLogin(login: string) {
		return this.prismaService.user.findFirst({
			where: {
				login: {
					equals: login,
					mode: 'insensitive'
				},
				deletedAt: null
			}
		});
	}

	public async findPasswordById(id: string) {
		return await this.prismaService.user.findUnique({
			where: {
				id,
				deletedAt: null
			},
			select: {
				password: true
			}
		});
	}

	public create(data: Prisma.UserCreateInput) {
		return this.prismaService.user.create({
			data,
			select: { id: true }
		});
	}

	public update(id: string, data: Prisma.UserUpdateInput) {
		return this.prismaService.user.update({
			where: {
				id,
				deletedAt: null
			},
			data,
			select: profileUserSelect
		});
	}

	public updatePassword(id: string, currentPassword: string, newPassword: string) {
		return this.prismaService.user.updateMany({
			where: {
				id,
				deletedAt: null,
				password: currentPassword
			},
			data: {
				password: newPassword
			}
		});
	}

	public softDelete(id: string) {
		return this.prismaService.user.updateMany({
			where: {
				id,
				deletedAt: null
			},
			data: {
				deletedAt: new Date()
			}
		});
	}
}
