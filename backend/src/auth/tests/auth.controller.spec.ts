import { Test, type TestingModule } from '@nestjs/testing';
import type { Response } from 'express';
import { AuthController } from '@/auth/auth.controller';
import { AuthService } from '@/auth/auth.service';
import type { AuthResult } from '@/auth/auth.service';
import { AUTH_MESSAGES } from '@/auth/constants/auth.messages';
import type { AuthSessionContext } from '@/auth/decorators/auth-session.decorator';
import { hashRefreshToken } from '@/common/utils/refresh-token.util';
import { REFRESH_COOKIE } from '@/config/cookie.config';
import { jwtConfig } from '@/config/jwt.config';
import { sessionConfig } from '@/config/session.config';

describe('AuthController', () => {
	let controller: AuthController;

	const authServiceMock = {
		register: jest.fn(),
		login: jest.fn(),
		refresh: jest.fn()
	};

	const sessionSettingsMock = {
		name: 'session',
		secret: 'test-session-secret',
		maxAge: '7d',
		httpOnly: true,
		secure: false,
		folder: 'session:',
		domain: undefined
	};

	const jwtSettingsMock = {
		secret: 'test-jwt-secret',
		accessTtl: '2h',
		refreshTtl: '7d',
		algorithm: 'HS256'
	};

	const authResult: AuthResult = {
		userId: 'user-123',
		accessToken: 'test-access-token',
		refreshToken: 'test-refresh-token'
	};

	// Создаём mock сессии без Express Request
	function createSessionMock(overrides: Partial<AuthSessionContext> = {}): AuthSessionContext {
		return {
			userId: undefined,
			refreshToken: undefined,
			refreshTokenHash: undefined,

			regenerate: jest.fn(() => Promise.resolve()),
			authenticate: jest.fn(),
			setRefreshTokenHash: jest.fn(),
			save: jest.fn(() => Promise.resolve()),
			destroy: jest.fn(() => Promise.resolve()),

			...overrides
		};
	}

	// Мокаем только нужные методы Response
	function createResponseMock() {
		const cookie = jest.fn();
		const clearCookie = jest.fn();

		const response = {
			cookie,
			clearCookie
		} as unknown as Response;

		return {
			response,
			cookie,
			clearCookie
		};
	}

	beforeEach(async () => {
		jest.resetAllMocks();

		const module: TestingModule = await Test.createTestingModule({
			controllers: [AuthController],

			providers: [
				{
					provide: AuthService,
					useValue: authServiceMock
				},
				{
					provide: sessionConfig.KEY,
					useValue: sessionSettingsMock
				},
				{
					provide: jwtConfig.KEY,
					useValue: jwtSettingsMock
				}
			]
		}).compile();

		controller = module.get<AuthController>(AuthController);
	});

	describe('POST /auth/register', () => {
		it('Регистрирует пользователя и создаёт сессию', async () => {
			const dto = {
				name: 'Alexander',
				login: 'alex',
				email: 'alex@example.com',
				password: 'Password123!',
				passwordRepeat: 'Password123!',
				age: 28,
				description: 'Developer'
			};

			const session = createSessionMock();
			const { response, cookie } = createResponseMock();

			authServiceMock.register.mockResolvedValueOnce(authResult);

			const result = await controller.register(dto, session, response);

			expect(authServiceMock.register).toHaveBeenCalledWith(dto);

			expect(session.regenerate).toHaveBeenCalledTimes(1);

			expect(session.authenticate).toHaveBeenCalledWith(
				authResult.userId,
				hashRefreshToken(authResult.refreshToken)
			);

			expect(session.save).toHaveBeenCalledTimes(1);

			expect(cookie).toHaveBeenCalledWith(
				REFRESH_COOKIE,
				authResult.refreshToken,
				expect.objectContaining({
					httpOnly: true,
					secure: false,
					sameSite: 'lax',
					path: '/',
					maxAge: 604800000
				})
			);

			expect(result).toEqual({
				accessToken: authResult.accessToken
			});
		});

		it('Не создаёт сессию при ошибке регистрации', async () => {
			const dto = {
				name: 'Alexander',
				login: 'alex',
				email: 'alex@example.com',
				password: 'Password123!',
				passwordRepeat: 'Password123!',
				age: 28,
				description: 'Developer'
			};

			const session = createSessionMock();
			const { response, cookie } = createResponseMock();

			authServiceMock.register.mockRejectedValueOnce(new Error('Ошибка регистрации'));

			await expect(controller.register(dto, session, response)).rejects.toThrow(
				'Ошибка регистрации'
			);

			expect(session.regenerate).not.toHaveBeenCalled();
			expect(session.save).not.toHaveBeenCalled();
			expect(cookie).not.toHaveBeenCalled();
		});
	});

	describe('POST /auth/login', () => {
		it('Авторизует пользователя и сохраняет сессию', async () => {
			const dto = {
				login: 'alex',
				password: 'Password123!'
			};

			const session = createSessionMock();
			const { response, cookie } = createResponseMock();

			authServiceMock.login.mockResolvedValueOnce(authResult);

			const result = await controller.login(dto, session, response);

			expect(authServiceMock.login).toHaveBeenCalledWith(dto);

			expect(session.regenerate).toHaveBeenCalledTimes(1);

			expect(session.authenticate).toHaveBeenCalledWith(
				authResult.userId,
				hashRefreshToken(authResult.refreshToken)
			);

			expect(session.save).toHaveBeenCalledTimes(1);

			expect(cookie).toHaveBeenCalledWith(
				REFRESH_COOKIE,
				authResult.refreshToken,
				expect.any(Object)
			);

			expect(result).toEqual({
				accessToken: authResult.accessToken
			});
		});

		it('Не устанавливает cookie при ошибке сохранения сессии', async () => {
			const dto = {
				login: 'alex',
				password: 'Password123!'
			};

			const session = createSessionMock({
				save: jest.fn(() => Promise.reject(new Error('Redis unavailable')))
			});

			const { response, cookie } = createResponseMock();

			authServiceMock.login.mockResolvedValueOnce(authResult);

			await expect(controller.login(dto, session, response)).rejects.toThrow(
				'Redis unavailable'
			);

			expect(cookie).not.toHaveBeenCalled();
		});
	});

	describe('POST /auth/refresh', () => {
		it('Обновляет refresh JWT и сохраняет новый хэш', async () => {
			const oldRefreshToken = 'old-refresh-token';
			const oldHash = hashRefreshToken(oldRefreshToken);

			const session = createSessionMock({
				userId: 'user-123',
				refreshToken: oldRefreshToken,
				refreshTokenHash: oldHash
			});

			const { response, cookie } = createResponseMock();

			authServiceMock.refresh.mockResolvedValueOnce(authResult);

			const result = await controller.refresh(session, response);

			expect(authServiceMock.refresh).toHaveBeenCalledWith({
				sessionUserId: 'user-123',
				refreshToken: oldRefreshToken,
				storedHash: oldHash
			});

			expect(session.setRefreshTokenHash).toHaveBeenCalledWith(
				hashRefreshToken(authResult.refreshToken)
			);

			expect(session.save).toHaveBeenCalledTimes(1);

			expect(cookie).toHaveBeenCalledWith(
				REFRESH_COOKIE,
				authResult.refreshToken,
				expect.any(Object)
			);

			expect(result).toEqual({
				accessToken: authResult.accessToken
			});
		});

		it('Не обновляет сессию при ошибке проверки refresh JWT', async () => {
			const session = createSessionMock({
				userId: 'user-123',
				refreshToken: 'invalid-token',
				refreshTokenHash: 'stored-hash'
			});

			const { response, cookie } = createResponseMock();

			authServiceMock.refresh.mockRejectedValueOnce(new Error('Invalid refresh token'));

			await expect(controller.refresh(session, response)).rejects.toThrow(
				'Invalid refresh token'
			);

			expect(session.setRefreshTokenHash).not.toHaveBeenCalled();

			expect(session.save).not.toHaveBeenCalled();
			expect(cookie).not.toHaveBeenCalled();
		});
	});

	describe('POST /auth/logout', () => {
		it('Уничтожает сессию и очищает cookies', async () => {
			const session = createSessionMock();

			const { response, clearCookie } = createResponseMock();

			const result = await controller.logout(session, response);

			expect(session.destroy).toHaveBeenCalledTimes(1);

			expect(clearCookie).toHaveBeenCalledTimes(2);

			expect(clearCookie).toHaveBeenCalledWith(
				REFRESH_COOKIE,
				expect.objectContaining({
					httpOnly: true,
					path: '/'
				})
			);

			expect(clearCookie).toHaveBeenCalledWith(
				sessionSettingsMock.name,
				expect.objectContaining({
					httpOnly: true,
					path: '/'
				})
			);

			expect(result).toEqual({
				message: AUTH_MESSAGES.LOGOUT_SUCCESS
			});
		});

		it('Не очищает cookies при ошибке удаления сессии', async () => {
			const session = createSessionMock({
				destroy: jest.fn(() => Promise.reject(new Error('Session destroy failed')))
			});

			const { response, clearCookie } = createResponseMock();

			await expect(controller.logout(session, response)).rejects.toThrow(
				'Session destroy failed'
			);

			expect(clearCookie).not.toHaveBeenCalled();
		});
	});
});
