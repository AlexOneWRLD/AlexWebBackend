import { ConflictException, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { USER_MESSAGES } from '@/user/constants/user.messages';

export type PrismaErrorCode = 'P2002' | 'P2025';

export function prismaErrorUtil(
	error: unknown,
	code: PrismaErrorCode
): error is Prisma.PrismaClientKnownRequestError {
	return error instanceof Prisma.PrismaClientKnownRequestError && error.code === code;
}

export function throwPrismaError(error: unknown): never {
	if (prismaErrorUtil(error, 'P2002')) {
		const target: unknown = error.meta?.target;

		const targets = Array.isArray(target)
			? target.filter((value): value is string => typeof value === 'string')
			: typeof target === 'string'
				? [target]
				: [];

		if (targets.includes('login') || targets.includes('users_active_login_unique')) {
			throw new ConflictException(USER_MESSAGES.LOGIN_TAKEN);
		}

		if (targets.includes('email') || targets.includes('users_active_email_unique')) {
			throw new ConflictException(USER_MESSAGES.EMAIL_TAKEN);
		}

		throw new ConflictException(USER_MESSAGES.UNIQUE_CONFLICT);
	}

	if (prismaErrorUtil(error, 'P2025')) {
		throw new NotFoundException('Пользователь или ресурс не найден');
	}

	throw error;
}
