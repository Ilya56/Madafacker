import { Test, TestingModule } from '@nestjs/testing';
import { GeneralGuard } from '@controllers';
import { Reflector } from '@nestjs/core';
import { ExecutionContext } from '@nestjs/common';

describe('GeneralGuard', () => {
  let guard: GeneralGuard;
  let reflector: Reflector;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GeneralGuard,
        {
          provide: Reflector,
          useValue: {
            getAllAndOverride: jest.fn(),
          },
        },
      ],
    }).compile();

    guard = module.get<GeneralGuard>(GeneralGuard);
    reflector = module.get<Reflector>(Reflector);
  });

  describe('canActivate', () => {
    it('should return true for public routes', () => {
      const context = {
        getHandler: jest.fn(),
        getClass: jest.fn(),
      } as unknown as ExecutionContext;

      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(true);

      expect(guard.canActivate(context)).toBe(true);
    });

    it('should return null for non-public routes', () => {
      const context = {
        getHandler: jest.fn(),
        getClass: jest.fn(),
      } as unknown as ExecutionContext;

      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);

      expect(guard.canActivate(context)).toBeNull();
    });
  });
});
