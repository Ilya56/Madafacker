import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { FirebaseAuthGuard } from '../firebase-auth.guard';
import { GeneralGuard, ClsData } from '@controllers';
import { ClsService } from 'nestjs-cls';

describe('FirebaseAuthGuard', () => {
  let guard: FirebaseAuthGuard;
  let generalGuard: jest.Mocked<GeneralGuard>;
  let cls: jest.Mocked<ClsService<ClsData>>;
  let reflector: jest.Mocked<Reflector>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FirebaseAuthGuard,
        {
          provide: GeneralGuard,
          useValue: { canActivate: jest.fn() },
        },
        {
          provide: ClsService,
          useValue: { set: jest.fn() },
        },
        {
          provide: Reflector,
          useValue: { getAllAndOverride: jest.fn() },
        },
      ],
    }).compile();

    guard = module.get<FirebaseAuthGuard>(FirebaseAuthGuard);
    generalGuard = module.get(GeneralGuard);
    cls = module.get(ClsService);
    reflector = module.get(Reflector);
  });

  afterEach(() => jest.resetAllMocks());

  const createContext = (user: any = null): ExecutionContext =>
    ({
      switchToHttp: () => ({
        getRequest: jest.fn().mockReturnValue(user ? { user } : {}),
      }),
      getHandler: jest.fn(),
      getClass: jest.fn(),
    } as unknown as ExecutionContext);

  describe('canActivate', () => {
    it('should pass public endpoints', async () => {
      generalGuard.canActivate.mockReturnValue(true);
      const ctx = createContext();

      const res = await guard.canActivate(ctx);

      expect(res).toBe(true);
      expect(generalGuard.canActivate).toHaveBeenCalledWith(ctx);
      expect(cls.set).not.toHaveBeenCalled();
    });

    it('should call super.canActivate and save user in CLS for private endpoints', async () => {
      generalGuard.canActivate.mockReturnValue(null);
      reflector.getAllAndOverride.mockReturnValue(undefined);

      const user = { id: 'user-123' };
      const ctx = createContext(user);

      // Подменяем canActivate базового AuthGuard('firebase-jwt')
      const BaseGuard = AuthGuard('firebase-jwt');
      const superSpy = jest.spyOn(BaseGuard.prototype, 'canActivate').mockResolvedValue(true);

      const result = await guard.canActivate(ctx);

      expect(result).toBe(true);
      expect(superSpy).toHaveBeenCalledWith(ctx);
      expect(cls.set).toHaveBeenCalledWith('user', user);
      // isRegistrationEndpoint не должен устанавливаться
      expect(cls.set).toHaveBeenCalledTimes(1);
    });

    it("should set isRegistrationEndpoint flag if it's registration endpoint", async () => {
      generalGuard.canActivate.mockReturnValue(null);
      reflector.getAllAndOverride.mockReturnValue(true);

      const user = { id: 'reg-user' };
      const ctx = createContext(user);

      const BaseGuard = AuthGuard('firebase-jwt');
      jest.spyOn(BaseGuard.prototype, 'canActivate').mockResolvedValue(true);

      await guard.canActivate(ctx);

      expect(cls.set).toHaveBeenNthCalledWith(1, 'isRegistrationEndpoint', true);
      expect(cls.set).toHaveBeenNthCalledWith(2, 'user', user);
      expect(cls.set).toHaveBeenCalledTimes(2);
    });
  });
});
