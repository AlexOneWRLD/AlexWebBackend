import { Test, TestingModule } from '@nestjs/testing';
import type { Request, Response } from 'express';
import { AuthController } from '@/auth/auth.controller';
import { AuthService } from '@/auth/auth.service';

describe('AuthController', () => {
	let controller: AuthController;

	const authServiceMock = {
		register: jest.fn(),
		login: jest.fn(),
		refresh: jest.fn(),
		logout: jest.fn(),
		me: jest.fn()
	};

	beforeEach(async () => {
		jest.resetAllMocks();

		const module: TestingModule = await Test.createTestingModule({
			controllers: [AuthController],
			providers: [
				{
					provide: AuthService,
					useValue: authServiceMock
				}
			]
		}).compile();

		controller = module.get<AuthController>(AuthController);
	});

	describe('POST /auth/register', () => {
		it('Должен передать данные регистрации в сервис', async () => {
			const dto = {
				name: 'Alexander',
				login: 'alex',
				email: 'alex@example.com',
				password: 'Password123',
				passwordRepeat: 'Password123',
				age: 28,
				description: 'Developer'
			};

			const req = {} as Request;
			const res = {} as Response;

			const response = {
				accessToken: 'test-access-token'
			};

			authServiceMock.register.mockResolvedValueOnce(response);

			const result = await controller.register(req, res, dto);

			expect(result).toEqual(response);

			expect(authServiceMock.register).toHaveBeenCalledWith(req, res, dto);
		});
	});

	describe('POST /auth/login', () => {
		it('Должен вернуть все профили пользователей', async () => {
			const dto = {
				login: 'alex',
				password: 'Password123'
			};

			const req = {} as Request;
			const res = {} as Response;

			const response = {
				accessToken: 'test-access-token'
			};

			authServiceMock.login.mockResolvedValueOnce(response);

			const result = await controller.login(req, res, dto);

			expect(result).toEqual(response);

			expect(authServiceMock.login).toHaveBeenCalledWith(req, res, dto);
		});
	});

	describe('POST /auth/refresh', () => {
		it('Должен обновить access токен', async () => {
			const req = {} as Request;
			const res = {} as Response;

			const response = {
				accessToken: 'test-access-token'
			};

			authServiceMock.refresh.mockResolvedValueOnce(response);

			const result = await controller.refresh(req, res);

			expect(result).toEqual(response);

			expect(authServiceMock.refresh).toHaveBeenCalledWith(req, res);
		});
	});

	describe('POST /auth/logout', () => {
		it('Должен выйти из сессии пользователя и погасить токен', async () => {
			const req = {} as Request;
			const res = {} as Response;

			const response = {
				accessToken: 'Выход выполнен'
			};

			authServiceMock.logout.mockResolvedValueOnce(response);

			const result = await controller.logout(req, res);

			expect(result).toEqual(response);

			expect(authServiceMock.logout).toHaveBeenCalledWith(req, res);
		});
	});

	describe('GET /auth/@me', () => {
		it('Должен вернуть переданного пользователя', async () => {
			const user = {
				id: 'user-123',
				login: 'alex',
				email: 'alex@example.com'
			};

			const result = await controller.me(user);

			expect(result).toEqual(user);
		});
	});
});
