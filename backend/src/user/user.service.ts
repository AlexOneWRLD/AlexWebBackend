import { Injectable, NotFoundException } from '@nestjs/common';
import { User } from '@prisma/client';
import { hash } from 'argon2';
import { PrismaService } from '@/prisma/prisma.service';







@Injectable()
export class UserService {
	public constructor(private readonly prismaService: PrismaService) {}

	//тут добить пагинацию + фильтр
	public  async getUsers(): Promise<User[]> {
		return await this.prismaService.user.findMany({
			take: 12,
			skip: 12
		});

	}

	public async findById(id: string) {
		const user = await this.prismaService.user.findUnique({
			where: {
				id
			}
		});

		if (!user) {
			throw new NotFoundException(
				'Прользователь не найден, проверьте введенные данные'
			);
		}

		return user;
	}

	public async findByEmail(email: string) {
		return await this.prismaService.user.findUnique({
			where: {
				email
			},
		});
	}

	public async create(
		email: string,
		password: string,
		name: string,
		age: number,
		description: string,
		picture: string,
		balance: number
	) {
		return await this.prismaService.user.create({
			data: {
				email,
				password: password ? await hash(password) : '',
				name,
				age,
				description,
				picture,
				balance
			},
		});
	}

	//тут доработать момент с обновлением записи
	public async update(
		id: string,
		email: string,
		password: string,
		name: string,
		age: number,
		description: string,
		picture: string,
		balance: number
	) {
		return await this.prismaService.user.update({
			where: {id},
			data: {
				email,
				password: password ? await hash(password) : '',
				name,
				age,
				description,
				picture,
				balance
			}
		});
	}
}
