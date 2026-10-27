import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from '@/user/user.controller';
import { UserService } from '@/user/user.service';

describe('UserController', () => {
	let controller: UserController;

	const userServiceMock = {
		findById: jest.fn(),
		getUsers: jest.fn(),
		updateUser: jest.fn(),
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
		it('должен вернуть профиль пользователя', async () => {
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
		it('должен вернуть все профили пользователей', async () => {
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

			const dto = {
				name: 'John Doe',
				login: 'AlexOneWRLD',
				email: '1231@wasdas',
				password: '123456',
				age: 24,
				description: 'Backend Developer'
			};

			const updatedUser = {
				id: userId,
				name: 'John Doe',
				login: 'AlexOneWRLD',
				email: '1231@wasdas',
				password: '123456',
				age: 24,
				description: 'Backend Developer'
			};

			userServiceMock.updateUser.mockResolvedValueOnce(updatedUser);

			const result = await controller.updateMe(userId, dto);

			expect(result).toEqual(updatedUser);

			expect(userServiceMock.updateUser).toHaveBeenCalledWith(userId, dto);
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
