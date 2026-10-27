import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { hash } from 'argon2';
import { RegisterDto } from '@/auth/dto/register.dto';
import { UserUpdateDto } from '@/user/dto/user-update.dto';
import { UsersQueryDto } from '@/user/dto/users-query.dto';
import { UserRepository } from '@/user/repository/user.repository';

@Injectable()
export class UserService {
	public constructor(private readonly userRepository: UserRepository) {}

	public async getUsers(query: UsersQueryDto) {
		const { page = 1, limit = 12, search = '' } = query;

		const { users, total } = await this.userRepository.findAll(page, limit, search);

		return {
			users,
			total,
			page,
			limit,
			totalPages: Math.ceil(total / limit)
		};
	}

	public async findById(id: string) {
		const user = await this.userRepository.findById(id);

		if (!user) {
			throw new NotFoundException('Пользователь не найден, проверьте введенные данные');
		}

		return user;
	}

	public findByEmail(email: string) {
		return this.userRepository.findByEmail(email);
	}

	public findByLogin(login: string) {
		return this.userRepository.findByLogin(login);
	}

	//Баланс и картинку доработать
	public async createUser(dto: RegisterDto) {
		try {
			return await this.userRepository.create({
				name: dto.name,
				email: dto.email,
				login: dto.login,
				password: await hash(dto.password),
				age: dto.age,
				description: dto.description,
				picture: '',
				balance: 0
			});
		} catch (error) {
			if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
				throw new ConflictException(
					'Пользователь с таким логином или email уже существует'
				);
			}

			throw error;
		}
	}

	//Баланс и картинку доработать
	public async updateUser(id: string, dto: UserUpdateDto) {
		return await this.userRepository.update(id, {
			name: dto.name,
			email: dto.email,
			login: dto.login,
			password: dto.password ? await hash(dto.password) : dto.password,
			age: dto.age,
			description: dto.description,
			picture: '',
			balance: 0
		});
	}

	public async deleteUser(id: string) {
		const deleteUser = await this.userRepository.softDelete(id);

		if (deleteUser.count === 0) {
			throw new NotFoundException('Пользователь не найден или уже удалён');
		}

		return { message: 'Пользователь удален' };
	}
}
