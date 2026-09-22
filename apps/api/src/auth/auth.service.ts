import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto, RegisterDto } from './dto/auth.dto';

const ACCESS_TTL = process.env.JWT_ACCESS_TTL ?? '15m';
const REFRESH_TTL = process.env.JWT_REFRESH_TTL ?? '7d';
const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET ?? 'dev-access-secret-change-me';
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET ?? 'dev-refresh-secret-change-me';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  private publicUser(user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    emailVerified: boolean;
  }) {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      emailVerified: user.emailVerified,
    };
  }

  private async issueTokens(user: { id: string; email: string; role: string }) {
    const payload = { sub: user.id, email: user.email, role: user.role };
    const [accessToken, refreshToken] = await Promise.all([
      this.jwt.signAsync(payload, { secret: ACCESS_SECRET, expiresIn: ACCESS_TTL }),
      this.jwt.signAsync(payload, { secret: REFRESH_SECRET, expiresIn: REFRESH_TTL }),
    ]);

    await this.prisma.user.update({
      where: { id: user.id },
      data: { refreshTokenHash: await bcrypt.hash(refreshToken, 10) },
    });

    return { accessToken, refreshToken };
  }

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) {
      throw new BadRequestException('An account already uses this email. Log in instead.');
    }

    const verificationToken = randomBytes(24).toString('hex');
    const user = await this.prisma.user.create({
      data: {
        email: dto.email.toLowerCase(),
        passwordHash: await bcrypt.hash(dto.password, 10),
        firstName: dto.firstName,
        lastName: dto.lastName,
        verificationToken,
      },
    });

    // Sprint 3 has no mail provider yet — the link is logged so the flow stays testable.
    // eslint-disable-next-line no-console
    console.log(`[auth] verify ${user.email}: /api/auth/verify-email?token=${verificationToken}`);

    const tokens = await this.issueTokens(user);
    return { ...tokens, user: this.publicUser(user) };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email.toLowerCase() } });
    if (!user || !(await bcrypt.compare(dto.password, user.passwordHash))) {
      throw new UnauthorizedException('Email or password is incorrect.');
    }
    const tokens = await this.issueTokens(user);
    return { ...tokens, user: this.publicUser(user) };
  }

  async refresh(refreshToken: string) {
    let payload: { sub: string };
    try {
      payload = await this.jwt.verifyAsync(refreshToken, { secret: REFRESH_SECRET });
    } catch {
      throw new UnauthorizedException('This session has expired. Log in again.');
    }

    const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user?.refreshTokenHash || !(await bcrypt.compare(refreshToken, user.refreshTokenHash))) {
      throw new UnauthorizedException('This session has expired. Log in again.');
    }

    const tokens = await this.issueTokens(user);
    return { ...tokens, user: this.publicUser(user) };
  }

  async logout(userId: string) {
    await this.prisma.user.update({ where: { id: userId }, data: { refreshTokenHash: null } });
    return { success: true };
  }

  async me(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException();
    return this.publicUser(user);
  }

  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    // Always the same answer — never leak which emails exist.
    if (user) {
      const resetToken = randomBytes(24).toString('hex');
      await this.prisma.user.update({
        where: { id: user.id },
        data: { resetToken, resetTokenExpiry: new Date(Date.now() + 60 * 60 * 1000) },
      });
      // eslint-disable-next-line no-console
      console.log(`[auth] reset ${user.email}: /reset-password?token=${resetToken}`);
    }
    return { message: 'If that email has an account, a reset link is on its way.' };
  }

  async resetPassword(token: string, password: string) {
    const user = await this.prisma.user.findFirst({
      where: { resetToken: token, resetTokenExpiry: { gt: new Date() } },
    });
    if (!user) throw new BadRequestException('This reset link is invalid or has expired.');

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: await bcrypt.hash(password, 10),
        resetToken: null,
        resetTokenExpiry: null,
        refreshTokenHash: null,
      },
    });
    return { message: 'Password updated. You can log in now.' };
  }

  async verifyEmail(token: string) {
    const user = await this.prisma.user.findFirst({ where: { verificationToken: token } });
    if (!user) throw new BadRequestException('This verification link is invalid.');
    await this.prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: true, verificationToken: null },
    });
    return { message: 'Email verified.' };
  }
}
