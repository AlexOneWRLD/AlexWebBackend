import { createParamDecorator, type ExecutionContext, UnauthorizedException } from '@nestjs/common';
import type { User } from '@prisma/client';
import type { Request } from 'express';
import { AUTH_MESSAGES } from '@/auth/constants/auth.messages';

export type AuthorizedUser = Omit<User, 'password'>;

export type AuthorizedRequest = Request & {
	user?: AuthorizedUser;
};

export const Authorized = createParamDecorator<keyof AuthorizedUser | undefined>(
	(data: keyof AuthorizedUser | undefined, ctx: ExecutionContext) => {
		const request = ctx.switchToHttp().getRequest<AuthorizedRequest>();

		const user = request.user;

		if (!user) {
			throw new UnauthorizedException(AUTH_MESSAGES.NOT_AUTHENTICATED);
		}

		return data === undefined ? user : user[data];
	}
);
