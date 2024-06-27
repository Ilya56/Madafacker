import { ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { IS_PUBLIC_KEY } from '@controllers';
import { Reflector } from '@nestjs/core';
import { ApiKeyData, IS_API_KEY } from './api-key.guard';
import { ConfigService } from '@nestjs/config';

/**
 * This guard is created to store all common guard logic that is not depend on the implementation
 */
@Injectable()
export class GeneralGuard {
  private logger: Logger;

  constructor(private reflector: Reflector, private configService: ConfigService) {
    this.logger = new Logger(GeneralGuard.name);
  }

  /**
   * This function returns true or false based on the general rules.
   * Also, it can return null as a result if framework guard should be used.
   * Because of it, this class cannot implement CanActivate interface
   * @param context Current execution context
   */
  canActivate(context: ExecutionContext): boolean | null {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const apiKeyData = this.reflector.getAllAndOverride<ApiKeyData>(IS_API_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (apiKeyData) {
      const request = context.switchToHttp().getRequest();
      const externalApiKey = request.headers['x-api-key'];

      const apiKey = apiKeyData.apiKeyValue || this.configService.get<string>('apiKey');

      if (!apiKey) {
        this.logger.error('Api key is not defined in the configurations, please define it. Request rejected');
        return false;
      }

      return apiKey === externalApiKey;
    }

    return null;
  }
}
