import { Module } from '@nestjs/common';
import { UserRepository } from '@/user/repository/user.repository';
import { UserController } from '@/user/user.controller';
import { UserService } from '@/user/user.service';

@Module({
	controllers: [UserController],
	providers: [UserService, UserRepository],
	exports: [UserService]
})
export class UserModule {}
