import { Test, TestingModule } from '@nestjs/testing';
import { UniqueTokenAuthGuard } from '../unique-token-auth.guard';
import { GeneralGuard } from '@controllers';
import { ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ClsService } from 'nestjs-cls';
import { ClsData } from '@controllers';

describe('UniqueTokenAuthGuard', () => {
  let guard: UniqueTokenAuthGuard;
  let generalGuard: GeneralGuard;
  let clsService: ClsService<ClsData>;

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
        {
          provide: ClsService,
          useValue: {
            set: jest.fn(),
          },
        },
      ],
    }).compile();

    guard = module.get<UniqueTokenAuthGuard>(UniqueTokenAuthGuard);
    generalGuard = module.get<GeneralGuard>(GeneralGuard);
    clsService = module.get<ClsService<ClsData>>(ClsService);
  });

  describe('canActivate', () => {
    it('should allow access to public routes', async () => {
      const context = {
        switchToHttp: () => ({
          getRequest: jest.fn(),
        }),
        getHandler: jest.fn(),
        getClass: jest.fn(),
      } as unknown as ExecutionContext;

      jest.spyOn(generalGuard, 'canActivate').mockReturnValue(true);

      expect(await guard.canActivate(context)).toBe(true);
    });

    it('should call super.canActivate for non-public routes and set user in CLS', async () => {
      const context = {
        switchToHttp: () => ({
          getRequest: jest.fn().mockReturnValue({ user: { id: 'test-user' } }),
        }),
        getHandler: jest.fn(),
        getClass: jest.fn(),
      } as unknown as ExecutionContext;

      jest.spyOn(generalGuard, 'canActivate').mockReturnValue(null);

      const TokenAuthGuard = AuthGuard('token');
      const canActivateSpy = jest.spyOn(TokenAuthGuard.prototype, 'canActivate').mockResolvedValue(true);

      const result = await guard.canActivate(context);
      expect(result).toBe(true);
      expect(canActivateSpy).toHaveBeenCalledWith(context);
    });
  });
});
