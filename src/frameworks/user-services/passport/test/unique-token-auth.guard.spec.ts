import { Test, TestingModule } from '@nestjs/testing';
import { UniqueTokenAuthGuard } from '../unique-token-auth.guard';
import { GeneralGuard } from '@controllers';
import { ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

describe('UniqueTokenAuthGuard', () => {
  let guard: UniqueTokenAuthGuard;
  let generalGuard: GeneralGuard;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UniqueTokenAuthGuard,
        {
          provide: GeneralGuard,
          useValue: {
            canActivate: jest.fn(),
          },
        },
      ],
    }).compile();

    guard = module.get<UniqueTokenAuthGuard>(UniqueTokenAuthGuard);
    generalGuard = module.get<GeneralGuard>(GeneralGuard);
  });

  describe('canActivate', () => {
    it('should allow access to public routes', () => {
      const context = {
        switchToHttp: () => ({
          getRequest: jest.fn(),
        }),
        getHandler: jest.fn(),
        getClass: jest.fn(),
      } as unknown as ExecutionContext;

      jest.spyOn(generalGuard, 'canActivate').mockReturnValue(true);

      expect(guard.canActivate(context)).toBe(true);
    });

    it('should call super.canActivate for non-public routes', async () => {
      const context = {
        switchToHttp: () => ({
          getRequest: jest.fn(),
        }),
        getHandler: jest.fn(),
        getClass: jest.fn(),
      } as unknown as ExecutionContext;

      jest.spyOn(generalGuard, 'canActivate').mockReturnValue(null);

      const TokenAuthGuard = AuthGuard('token');
      const canActivateSpy = jest.spyOn(TokenAuthGuard.prototype, 'canActivate').mockReturnValue(true);

      const result = await guard.canActivate(context);
      expect(result).toBe(true);
      expect(canActivateSpy).toHaveBeenCalledWith(context);
    });
  });
});
