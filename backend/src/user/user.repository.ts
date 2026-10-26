import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@/prisma/prisma.service';

const publicUserSelect = {
	id: true,
	name: true,
	email: true,
	age: true,
	description: true,
	picture: true,
	role: true,
	createdAt: true,
	updatedAt: true
} satisfies Prisma.UserSelect;

@Injectable()
export class UserRepository {
	constructor(private readonly prismaService: PrismaService) {}

	public async findAll(page: number, limit: number, search: string) {
		const where: Prisma.UserWhereInput = {
			deletedAt: null,
			...(search.trim() && {
				name: {
					contains: search.trim()
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
		return await this.prismaService.user.findUnique({
			where: {
				email
			}
		});
	}

	public async findById(id: string) {
		return await this.prismaService.user.findUnique({
			where: {
				id,
				deletedAt: null
			}
		});
	}

	public async findByLogin(login: string) {
		return await this.prismaService.user.findUnique({
			where: {
				login
			}
		});
	}

	public create(data: Prisma.UserCreateInput) {
		return this.prismaService.user.create({
			data
		});
	}

	public update(id: string, data: Prisma.UserUpdateInput) {
		return this.prismaService.user.update({
			where: { id },
			data
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
