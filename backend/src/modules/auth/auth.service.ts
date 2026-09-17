import { ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../database/prisma.service.js';
import { CreateUserDto, LoginDto, UserResponseDto } from './dto/auth.dto.js';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    if (createUserDto.role === 'system_admin') {
      throw new ForbiddenException('系统管理员账号不可通过注册接口创建');
    }

    // 检查用户名是否已存在
    const existingUser = await this.prisma.user.findUnique({
      where: { username: createUserDto.username },
    });

    if (existingUser) {
      throw new UnauthorizedException('用户名已存在');
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    // 创建用户
    const user = await this.prisma.user.create({
      data: {
        username: createUserDto.username,
        passwordHash: hashedPassword,
        role: createUserDto.role,
        tenantId: createUserDto.tenantId,
        permissions: createUserDto.permissions || {},
      },
    });

    return this.sanitizeUser(user);
  }

  async login(loginDto: LoginDto) {
    // 查找用户
    const user = await this.prisma.user.findUnique({
      where: { username: loginDto.username },
      include: { tenant: { select: { isActive: true } } },
    });

    if (!user) {
      throw new UnauthorizedException('用户名或密码错误');
    }

    if (!user.isActive || (user.tenantId && !user.tenant?.isActive)) {
      throw new UnauthorizedException('账号或所属商户已停用');
    }

    // 验证密码
    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('用户名或密码错误');
    }

    // 生成 JWT Token
    const payload = {
      sub: user.id,
      username: user.username,
      role: user.role,
      tenantId: user.tenantId,
    };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '30d' });

    return {
      accessToken,
      refreshToken,
      user: this.sanitizeUser(user),
    };
  }

  async validateUser(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { tenant: { select: { isActive: true } } },
    });

    if (!user) {
      throw new UnauthorizedException('用户不存在');
    }

    if (!user.isActive || (user.tenantId && !user.tenant?.isActive)) {
      throw new UnauthorizedException('账号或所属商户已停用');
    }

    return this.sanitizeUser(user);
  }

  private sanitizeUser(user: any): UserResponseDto {
    const { passwordHash, tenant, ...result } = user;
    return result;
  }
}
