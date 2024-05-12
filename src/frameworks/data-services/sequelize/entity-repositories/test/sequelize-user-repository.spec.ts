import { Test, TestingModule } from '@nestjs/testing';
import { SequelizeUserRepository } from '../sequelize-user-repository';
import { UserModel } from '@frameworks/data-services/sequelize';
import { User } from '@core';

describe('SequelizeUserRepository', () => {
  let userRepository: SequelizeUserRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SequelizeUserRepository,
        {
          provide: UserModel,
          useValue: {
            update: jest.fn(),
          },
        },
      ],
    }).compile();

    userRepository = module.get<SequelizeUserRepository>(SequelizeUserRepository);
  });

  describe('updateByName', () => {
    it('should update a user by name and return the updated user', async () => {
      const name = 'John Doe';

      const userUpdateInfo = new User();
      userUpdateInfo.name = 'Test';

      const updatedUser = { name: 'Test' };

      jest.spyOn(UserModel, 'update').mockResolvedValue([1, [updatedUser]] as never as [number]);

      const result = await userRepository.updateByName(name, userUpdateInfo);

      expect(result).toEqual(updatedUser);
      expect(UserModel.update).toHaveBeenCalledWith(userUpdateInfo, {
        where: { name },
        returning: true,
      });
    });

    it('should return null if no user is updated', async () => {
      const name = 'Nonexistent User';
      const userUpdateInfo = new User();
      userUpdateInfo.name = 'Test';

      // Mock the update method to simulate Sequelize behavior
      jest.spyOn(UserModel, 'update').mockResolvedValue([0, []] as never as [number]);

      const result = await userRepository.updateByName(name, userUpdateInfo);

      expect(result).toBeUndefined();
      expect(UserModel.update).toHaveBeenCalledWith(userUpdateInfo, {
        where: { name },
        returning: true,
      });
    });
  });
});
