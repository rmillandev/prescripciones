import { HttpException, Injectable, UnauthorizedException, HttpStatus, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { Tokens } from './tokens.type';
import { CreateUserDto } from 'src/users/dto/create-user.dto';

@Injectable()
export class AuthService {

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService
  ) {}

    async register(createUserDto: CreateUserDto) {
      
      const emailExists = await this.prisma.user.findUnique({
        where: {
          email: createUserDto.email
        }
      });
  
      if (emailExists) throw new BadRequestException('This email already exists'); 
  
      const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
      const user = await this.prisma.user.create({
        data: {
          ...createUserDto,
          password: hashedPassword,
        },
      }); 
      
      const { accessToken, refreshToken } = await this.generateTokens(user);

      return {
        accessToken,
        refreshToken,
        user: this.removePassword(user),
        status: HttpStatus.CREATED,
        message: 'User registered successfully'
      } 
    }

  async login(loginDto: LoginDto) {

    const user = await this.prisma.user.findUnique({
      where: { email: loginDto.email }
    });

    if (!user) throw new UnauthorizedException('Invalid credentials');
    
    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);

    if (!isPasswordValid) throw new UnauthorizedException('Invalid credentials');

    const payload = { 
      id: user.id, 
      email: user.email, 
      role: user.role,
    };
    const { accessToken, refreshToken } = await this.generateTokens(payload);

    const successResponse = { 
      status: HttpStatus.OK,
      accessToken,
      refreshToken,
      user: this.removePassword(user),
      message: 'Login successful'
    };

    return successResponse;

  }
  
  async refreshToken(type: string, tokenRefresh: string) {
    try {
      if (type !== 'Bearer' || !tokenRefresh) throw new UnauthorizedException('Invalid refresh token');
      
      const user = this.jwtService.verify(tokenRefresh, { secret: process.env.JWT_REFRESH_SECRET });
      const payload = { 
      id: user.id, 
      email: user.email, 
      role: user.role,
    };
      const { accessToken, refreshToken} = await this.generateTokens(payload);
      
      return {
        accessToken,
        refreshToken,
        status: HttpStatus.OK,
        message: 'Token refreshed successfully'
      }
    } catch (error) { 
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  private async generateTokens(user): Promise<Tokens> {
    const payload = { 
      id: user.id, 
      email: user.email, 
      role: user.role,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
      payload,
      {
        secret: process.env.JWT_SECRET,
        expiresIn: process.env.JWT_EXPIRES_IN as any,
      }),
      this.jwtService.signAsync(
      payload,
      {
        secret: process.env.JWT_REFRESH_SECRET,
        expiresIn: process.env.JWT_REFRESH_EXPIRES_IN as any,
      })
    ])

    return {
      accessToken,
      refreshToken
    }
  }

  private removePassword(user) { 
    const { password, ...result } = user;
    return result;
  }

}
