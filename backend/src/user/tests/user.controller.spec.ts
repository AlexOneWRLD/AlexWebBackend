import { Test, TestingModule } from '@nestjs/testing';
import type { ChangePasswordDto } from '@/user/dto/change-password.dto';
import type { UserUpdateDto } from '@/user/dto/user-update.dto';
import { UserController } from '@/user/user.controller';
import { UserService } from '@/user/user.service';

describe('UserController', () => {
	let controller: UserController;

	const userServiceMock = {
		findById: jest.fn(),
		getUsers: jest.fn(),
		updateUser: jest.fn(),
		updatePassword: jest.fn(),
		deleteUser: jest.fn()
	};

	beforeEach(async () => {
		jest.resetAllMocks();

		const module: TestingModule = await Test.createTestingModule({
			controllers: [UserController],
			providers: [
				{
					provide: UserService,
					useValue: userServiceMock
				}
			]
		}).compile();

		controller = module.get<UserController>(UserController);
	});

	describe('GET /users/me', () => {
		it('Должен вернуть профиль пользователя', async () => {
			const userId = '123-dasd';

			const mockUser = {
				id: userId,
				login: 'AlexOneWRLD',
				name: 'John Doe'
			};

			userServiceMock.findById.mockResolvedValueOnce(mockUser);

			const result = await controller.getMe(userId);

			expect(result).toEqual(mockUser);

			expect(userServiceMock.findById).toHaveBeenCalledWith(userId);

			expect(userServiceMock.findById).toHaveBeenCalledTimes(1);
		});
	});

	describe('GET /users', () => {
		it('Должен передать параметры пагинации в UserService', async () => {
			const query = {
				page: 2,
				limit: 5,
				search: 'alex'
			};

			const mockResult = {
				users: [{ id: '1', login: 'alex123' }],
				total: 6,
				page: 2,
				limit: 5,
				totalPages: 2
			};

			userServiceMock.getUsers.mockResolvedValueOnce(mockResult);

			const result = await controller.getUsers(query);

			expect(result).toEqual(mockResult);

			expect(userServiceMock.getUsers).toHaveBeenCalledWith(query);

			expect(userServiceMock.getUsers).toHaveBeenCalledTimes(1);
		});
	});

	describe('PATCH /users/me', () => {
		it('Должен обновить данные пользователя', async () => {
			const userId = 'user-123';

			const dto: UserUpdateDto = {
				name: 'John Doe',
				login: 'AlexOneWRLD',
				email: '1231@mail.ru',
				age: 24,
				description: 'Backend Developer'
			};

			const updatedUser = {
				id: userId,
				name: 'John Doe',
				login: 'AlexOneWRLD',
				email: '1231@mail.ru',
				age: 24,
				description: 'Backend Developer'
			};

			userServiceMock.updateUser.mockResolvedValueOnce(updatedUser);

			const result = await controller.updateMe(userId, dto);

			expect(result).toEqual(updatedUser);

			expect(userServiceMock.updateUser).toHaveBeenCalledWith(userId, dto);
		});
	});

	describe('PATCH /users/me/password', () => {
		it('Должен обновить пароль пользователя', async () => {
			const userId = 'user-123';

			const dto: ChangePasswordDto = {
				currentPassword: '123456',
				newPassword: '12345678',
				newPasswordRepeat: '12345678'
			};

			const updatedUser = {
				currentPassword: '123456',
				newPassword: '12345678',
				newPasswordRepeat: '12345678'
			};

			userServiceMock.updatePassword.mockResolvedValueOnce(updatedUser);

			const result = await controller.updatePassword(userId, dto);

			expect(result).toEqual(updatedUser);

			expect(userServiceMock.updatePassword).toHaveBeenCalledWith(userId, dto);
		});
	});

	describe('DELETE /users/me', () => {
		it('Должен удалить пользователя', async () => {
			const userId = 'user-123';

			const response = {
				message: 'Пользователь удален'
			};

			userServiceMock.deleteUser.mockResolvedValueOnce(response);

			const result = await controller.deleteMe(userId);

			expect(result).toEqual(response);

			expect(userServiceMock.deleteUser).toHaveBeenCalledWith(userId);
		});
	});
});
