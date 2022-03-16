import { Controller, Request } from '@nestjs/common';

import { MessagePattern, Payload } from '@nestjs/microservices';
import { AuthService } from '../services';
import { CreateUserDto } from '../dtos/auth-request.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @MessagePattern({ cmd: 'register' })
  async register(@Payload() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }

  @MessagePattern({ cmd: 'login' })
  async login(@Request() req) {
    return this.authService.login(req.user);
  }

  @MessagePattern({ cmd: 'profile' })
  getProfile(@Request() req) {
    return req.user;
  }

  @MessagePattern({ cmd: 'refresh' })
  refreshToken(@Request() request) {
    return this.authService.refresh(request.user);
  }
}
