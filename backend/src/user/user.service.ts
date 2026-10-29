import {
	BadRequestException,
	ConflictException,
	Injectable,
	NotFoundException
} from '@nestjs/common';
import { hash, verify } from 'argon2';
import { RegisterDto } from '@/auth/dto/register.dto';
import { throwPrismaError } from '@/common/utils/prisma-error.util';
import { USER_MESSAGES } from '@/user/constants/user.messages';
import { ChangePasswordDto } from '@/user/dto/change-password.dto';
import { UserUpdateDto } from '@/user/dto/user-update.dto';
import { UsersQueryDto } from '@/user/dto/users-query.dto';
import { UserRepository } from '@/user/repository/user.repository';

@Injectable()
export class UserService {
	public constructor(private readonly userRepository: UserRepository) {}

	public async getUsers(query: UsersQueryDto) {
		const { page, limit, search } = query;

		const { users, total } = await this.userRepository.findAll(page, limit, search ?? '');

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
			throw new NotFoundException(USER_MESSAGES.NOT_FOUND_OR_DELETED);
		}

		return user;
	}

	public findByEmail(email: string) {
		return this.userRepository.findByEmail(email);
	}

	public findByLogin(login: string) {
		return this.userRepository.findByLogin(login);
	}

	//TODO: доработать работу с картинкой и балансом
	public async createUser(dto: RegisterDto) {
		try {
			return await this.userRepository.create({
				name: dto.name,
				email: dto.email,
				login: dto.login,
				password: await hash(dto.password),
				age: dto.age,
				description: dto.description
			});
		} catch (error) {
			throwPrismaError(error);
		}
	}

	//TODO: доработать работу с картинкой и балансом
	public async updateUser(id: string, dto: UserUpdateDto) {
		try {
			return await this.userRepository.update(id, {
				name: dto.name,
				email: dto.email,
				login: dto.login,
				age: dto.age,
				description: dto.description
			});
		} catch (error) {
			throwPrismaError(error);
		}
	}

	public async updatePassword(id: string, dto: ChangePasswordDto) {
		const { currentPassword, newPassword, newPasswordRepeat } = dto;

		if (newPassword !== newPasswordRepeat) {
			throw new BadRequestException(USER_MESSAGES.PASSWORD_MISMATCH);
		}

		if (currentPassword == newPassword) {
			throw new BadRequestException(USER_MESSAGES.PASSWORD_REUSED);
		}

		const user = await this.userRepository.findPasswordById(id);

		if (!user) {
			throw new NotFoundException(USER_MESSAGES.NOT_FOUND);
		}

		const isCurrentPasswordValid = await verify(user.password, currentPassword);

		if (!isCurrentPasswordValid) {
			throw new BadRequestException(USER_MESSAGES.INVALID_CURRENT_PASSWORD);
		}

		const result = await this.userRepository.updatePassword(
			id,
			user.password,
			await hash(newPassword)
		);

		if (result.count === 0) {
			throw new ConflictException(USER_MESSAGES.PASSWORD_CHANGE_CONFLICT);
		}

		return { message: USER_MESSAGES.PASSWORD_CHANGED };
	}

	public async deleteUser(id: string) {
		const deleteUser = await this.userRepository.softDelete(id);

		if (deleteUser.count === 0) {
			throw new NotFoundException(USER_MESSAGES.NOT_FOUND_OR_DELETED);
		}

		return { message: USER_MESSAGES.DELETED };
	}
}
