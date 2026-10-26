import { Injectable, NotFoundException } from '@nestjs/common';
import { hash } from 'argon2';
import { RegisterDto } from '@/auth/dto/register.dto';
import { UsersQueryDto } from '@/user/dto/users-query.dto';
import { UserRepository } from '@/user/user.repository';

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
			throw new NotFoundException('Прользователь не найден, проверьте введенные данные');
		}

		return user;
	}

	public async findByEmail(email: string) {
		return await this.userRepository.findByEmail(email);
	}

	//Баланс и картинку доработать
	public async createUser(dto: RegisterDto) {
		return await this.userRepository.create({
			name: dto.name,
			email: dto.email,
			password: dto.password ? await hash(dto.password) : '',
			age: dto.age,
			description: dto.description,
			picture: '',
			balance: 0
		});
	}

	//Баланс и картинку доработать
	public async updateUser(id: string, dto: RegisterDto) {
		return await this.userRepository.update(id, {
			name: dto.name,
			email: dto.email,
			password: dto.password ? await hash(dto.password) : dto.password,
			age: dto.age,
			description: dto.description,
			picture: '',
			balance: 0
		});
	}

	public async deleteUser(id: string) {
		return await this.userRepository.softDelete(id);
	}
}
