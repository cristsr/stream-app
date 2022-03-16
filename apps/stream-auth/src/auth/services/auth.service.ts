import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../repositories';
import { compare, hash } from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private config: ConfigService,
    private userService: UserService,
    private jwtService: JwtService
  ) {}

  /**
   * validate if user exist and given password is correct
   * called by passport local strategy
   * @param username
   * @param pass
   */
  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.userService.findByEmail(username);

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const isMatch = await compare(pass, user.password).catch((err) => {
      throw new InternalServerErrorException(err.message);
    });

    if (!isMatch) {
      throw new BadRequestException('Contraseña incorrecta');
    }

    return {
      name: user.name,
      email: user.email,
    };
  }

  /**
   * create jwt after user validation
   * @param user model created in jwt strategy
   */
  async login(user) {
    const payload = {
      _id: user._id,
      username: user.name,
      email: user.email,
    };

    const jwtResponse = {
      accessToken: this.jwtService.sign(payload),
      tokenType: 'Bearer',
      expiresIn: this.config.get('JWT_EXPIRATION_TIME'),
      refreshToken: this.jwtService.sign(payload, {
        secret: this.config.get('REFRESH_SECRET_KEY'),
      }),
    };

    return {
      credentials: jwtResponse,
      user: payload,
    };
  }

  /**
   * Register new user
   * @param user
   */
  async register(user) {
    if (await this.userService.findByEmail(user.email)) {
      throw new BadRequestException(
        'El correo electronico ya se encuentra registrado'
      );
    }

    user.password = await hash(
      user.password,
      +this.config.get('BCRYPT_SALT_OR_ROUNDS')
    );

    await this.userService.create(user);

    return {
      success: true,
    };
  }

  /**
   * Refresh token
   * @param user
   */
  async refresh(user) {
    const payload = {
      _id: user._id,
      username: user.name,
      email: user.email,
    };

    return {
      accessToken: this.jwtService.sign(payload),
      tokenType: 'Bearer',
      expiresIn: this.config.get('JWT_EXPIRATION_TIME'),
    };
  }
}
