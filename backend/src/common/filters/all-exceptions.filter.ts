import {
	ArgumentsHost,
	Catch,
	ExceptionFilter,
	HttpException,
	HttpStatus,
	Logger
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type { Request, Response } from 'express';
import { STATUS_CODES } from 'node:http';

type ErrorResponse = {
	statusCode: number;
	message: string | string[];
	error: string;
};

function isStringArray(value: unknown): value is string[] {
	return Array.isArray(value) && value.every((item: unknown) => typeof item === 'string');
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
	private readonly logger = new Logger(AllExceptionsFilter.name);

	public catch(exception: unknown, host: ArgumentsHost): void {
		const context = host.switchToHttp();

		const request = context.getRequest<Request>();
		const response = context.getResponse<Response>();

		if (response.headersSent) {
			return;
		}

		let body: ErrorResponse;

		if (exception instanceof HttpException) {
			body = this.handleHttpException(exception);

			if (body.statusCode >= Number(HttpStatus.INTERNAL_SERVER_ERROR)) {
				this.logUnexpectedError(exception, request);
			}
		} else if (exception instanceof Prisma.PrismaClientKnownRequestError) {
			body = this.handlePrismaException(exception, request);
		} else {
			body = {
				statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
				message: 'Внутренняя ошибка сервера',
				error: 'Internal Server Error'
			};

			this.logUnexpectedError(exception, request);
		}

		response.status(body.statusCode).json(body);
	}

	private handleHttpException(exception: HttpException): ErrorResponse {
		const statusCode = exception.getStatus();

		const exceptionResponse: unknown = exception.getResponse();

		const defaultError = STATUS_CODES[statusCode] ?? 'Error';

		let message: string | string[] = exception.message || defaultError;

		let error = defaultError;

		if (typeof exceptionResponse === 'string') {
			message = exceptionResponse;
		} else if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
			if ('message' in exceptionResponse) {
				const rawMessage: unknown = exceptionResponse.message;

				if (typeof rawMessage === 'string' || isStringArray(rawMessage)) {
					message = rawMessage;
				}
			}

			if ('error' in exceptionResponse && typeof exceptionResponse.error === 'string') {
				error = exceptionResponse.error;
			}
		}

		return {
			statusCode,
			message,
			error
		};
	}

	private handlePrismaException(
		exception: Prisma.PrismaClientKnownRequestError,
		request: Request
	): ErrorResponse {
		switch (exception.code) {
			case 'P2002':
				this.logger.warn(`Prisma P2002: ${request.method} ${request.path}`);

				return {
					statusCode: HttpStatus.CONFLICT,
					message: 'Запись с такими данными уже существует',
					error: 'Conflict'
				};

			case 'P2025':
				this.logger.warn(`Prisma P2025: ${request.method} ${request.path}`);

				return {
					statusCode: HttpStatus.NOT_FOUND,
					message: 'Запись не найдена',
					error: 'Not Found'
				};

			default:
				this.logUnexpectedError(exception, request);

				return {
					statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
					message: 'Внутренняя ошибка сервера',
					error: 'Internal Server Error'
				};
		}
	}

	private logUnexpectedError(exception: unknown, request: Request): void {
		const context = `${request.method} ${request.path}`;

		if (exception instanceof Error) {
			this.logger.error(`Unhandled exception: ${context}`, exception.stack);
		} else {
			this.logger.error(`Unhandled non-Error exception: ${context}`);
		}
	}
}
