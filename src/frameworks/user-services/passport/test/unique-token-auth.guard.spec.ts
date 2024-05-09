import { Test, TestingModule } from '@nestjs/testing';
import { UniqueTokenAuthGuard } from '../unique-token-auth.guard';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { ExecutionContext } from '@nestjs/common';

describe('UniqueTokenAuthGuard', () => {
  let guard: UniqueTokenAuthGuard;
  let reflector: Reflector;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UniqueTokenAuthGuard,
        {
          provide: Reflector,
          useValue: {
            getAllAndOverride: jest.fn(),
          },
        },
      ],
    }).compile();

    guard = module.get<UniqueTokenAuthGuard>(UniqueTokenAuthGuard);
    reflector = module.get<Reflector>(Reflector);
  });

  describe('canActivate', () => {
    it('should allow access to public routes', () => {
      const context = {
        getHandler: jest.fn(),
        getClass: jest.fn(),
      } as unknown as ExecutionContext;

      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(true);

      expect(guard.canActivate(context)).toBe(true);
    });

    it('should call super.canActivate for non-public routes', () => {
      const context = {
        getHandler: jest.fn(),
        getClass: jest.fn(),
      } as unknown as ExecutionContext;

      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);

      const TokenAuthGuard = AuthGuard('token');
      const canActivateSpy = jest.spyOn(TokenAuthGuard.prototype, 'canActivate').mockReturnValue(true);

      expect(guard.canActivate(context)).toBe(true);
      expect(canActivateSpy).toHaveBeenCalledWith(context);
    });
  });
});
