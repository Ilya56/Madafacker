import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-firebase-jwt';
import { DataServiceAbstract, User } from '@core';
import { Inject, Logger, NotFoundException } from '@nestjs/common';
import { ClsService } from 'nestjs-cls';
import { ClsData } from '@controllers';
import { FIREBASE_AUTH } from '@frameworks/firebase-module';
import * as firebase from 'firebase-admin';
import Auth = firebase.auth.Auth;

/**
 * Implementation of the password firebase jwt strategy
 */
export class FirebasePassportStrategy extends PassportStrategy(Strategy) {
  private readonly logger: Logger;

  constructor(
    private dataService: DataServiceAbstract,
    private readonly cls: ClsService<ClsData>,
    @Inject(FIREBASE_AUTH) private auth: Auth,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    });
    this.logger = new Logger(FirebasePassportStrategy.name);
  }

  /**
   * Validates that user is available. If no - throw 403 error. If yes - return user object
   * Is useful for an auth guard
   * @param token Firebase JWT token from Firebase
   */
  async validate(token: string): Promise<User | null> {
    try {
      const decodedIdToken = await this.auth.verifyIdToken(token, true);

      const isRegistration = this.cls.get('isRegistrationEndpoint');

      if (isRegistration) {
        return { authProviderId: decodedIdToken.uid } as User;
      }

      const user = await this.dataService.users.getByAuthProviderId(decodedIdToken.uid);

      if (!user) {
        throw new NotFoundException('User not found');
      }

      return user;
    } catch (e) {
      this.logger.warn(e, e.errorInfo);

      // Found only such a way to identify firebase errors
      if (e.errorInfo) {
        return null;
      }
      throw e;
    }
  }
}
