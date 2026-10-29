import { ConflictException, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

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

		const fields = Array.isArray(target)
			? target.filter((field: unknown): field is string => typeof field === 'string')
			: [];

		if (fields.includes('login')) {
			throw new ConflictException('Этот логин уже занят');
		}

		if (fields.includes('email')) {
			throw new ConflictException('Этот email уже зарегистрирован');
		}

		throw new ConflictException('Нарушено ограничение уникальности');
	}

	if (prismaErrorUtil(error, 'P2025')) {
		throw new NotFoundException('Пользователь или ресурс не найден');
	}

	throw error;
}
