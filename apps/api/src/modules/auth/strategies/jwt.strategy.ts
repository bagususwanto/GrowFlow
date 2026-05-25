import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { env } from '../../../config/env.schema';
import { AuthUser } from '@growflow/types';

interface JwtPayload {
  sub: string;
  name: string;
  email: string;
  role: string;
  isActive?: boolean;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: env.JWT_ACCESS_SECRET,
    });
  }

  validate(payload: JwtPayload): AuthUser {
    return {
      id: payload.sub,
      name: payload.name,
      email: payload.email,
      role: payload.role as AuthUser['role'],
      isActive: payload.isActive ?? true,
    };
  }
}
