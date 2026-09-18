import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../../shared/entities/user.entity';
import { UserRole } from '../../../shared/entities/user-role.entity';
import { Role } from '../../../shared/entities/role.entity';

export interface JwtPayload {
  sub: string;
  email: string;
  /** Token version - bump on password change / force-logout to invalidate old tokens */
  tv?: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(UserRole) private userRoleRepo: Repository<UserRole>,
    @InjectRepository(Role) private roleRepo: Repository<Role>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: any) {
    const user = await this.userRepo.findOne({
      where: { id: payload.sub },
      relations: ['branch'],
    });
    if (!user || user.status !== 'active') {
      throw new UnauthorizedException('User inactive or not found');
    }

    // Optional token invalidation: requires a `token_version` column on User
    // and the login service embedding `tv: user.token_version` in the JWT.
    // if (payload.tv !== undefined && payload.tv !== (user as any).token_version) {
    //   throw new UnauthorizedException('Token has been revoked');
    // }

    const userRoles = await this.userRoleRepo.find({
      where: { user_id: user.id },
      relations: { role: { permissions: true } },
    });

    const roles = [...new Set(userRoles.map((ur) => ur.role.slug))];
    const permissions = [
      ...new Set(
        userRoles.flatMap((ur) =>
          ur.role.permissions.map((p) => `${p.module}:${p.action}`),
        ),
      ),
    ];

    return {
    userId: payload.sub,
    email: payload.email,
    roles: payload.roles || [payload.role], // تأكد أن هذه المصفوفة موجودة ومُعبأة
    permissions: payload.permissions || [],
    branchId: payload.branchId,
  };
}
}