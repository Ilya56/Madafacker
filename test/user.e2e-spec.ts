import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { IncomeUserMessagesModel, MessageModel, UserModel } from '@frameworks/data-services/sequelize/models';
import { v4 as uuidv4 } from 'uuid';

describe('User Endpoints (e2e)', () => {
  let app: INestApplication;
  let createdUsers: UserModel[] = [];

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  afterEach(async () => {
    // Delete only the users created during the tests
    for (const user of createdUsers) {
      await IncomeUserMessagesModel.destroy({ where: { userId: user.id } });
      await MessageModel.destroy({ where: { authorId: user.id } });
      await UserModel.destroy({ where: { id: user.id } });
    }
    createdUsers = [];
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Create User', () => {
    it('should create a user successfully', async () => {
      const name = `user_${uuidv4()}`;
      const response = await request(app.getHttpServer()).post('/api/user').send({ name }).expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe(name);
      expect(response.body).toHaveProperty('createdAt');
      expect(response.body).toHaveProperty('updatedAt');

      const createdUser = await UserModel.findOne({ where: { name } });
      expect(createdUser).toBeDefined();

      createdUsers.push(createdUser as UserModel);
    });

    it('should return 400 for duplicated user', async () => {
      const name = `user_${uuidv4()}`;
      const existingUser = await UserModel.create({ name });
      createdUsers.push(existingUser);

      const response = await request(app.getHttpServer()).post('/api/user').send({ name }).expect(400);

      expect(response.body.message).toContain('Duplicated value is not allowed');
    });

    it('should return 400 for invalid data', async () => {
      const response = await request(app.getHttpServer()).post('/api/user').send({}).expect(400);

      expect(response.body.message).toContain('name should not be empty');
    });
  });

  describe('Get Current User', () => {
    it('should return the current user', async () => {
      const name = `user_${uuidv4()}`;
      const user = await UserModel.create({ name });
      createdUsers.push(user);

      const response = await request(app.getHttpServer()).get('/api/user/current').set('token', user.id).expect(200);

      expect(response.body.name).toBe(user.name);
    });

    it('should return 401 if no token provided', async () => {
      const response = await request(app.getHttpServer()).get('/api/user/current').expect(401);

      expect(response.body.message).toBe('Unauthorized');
    });

    it('should return 404 if no user is found', async () => {
      const response = await request(app.getHttpServer()).get('/api/user/current').set('token', uuidv4()).expect(404);

      expect(response.body.message).toBe('User not found');
    });

    it('should return 404 if invalid id provided', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/user/current')
        .set('token', 'Random string')
        .expect(404);

      expect(response.body.message).toBe('User not found');
    });
  });

  describe('Update Current User', () => {
    it('should update the current user successfully', async () => {
      const uuid = uuidv4();
      const name = `user_${uuid}`;
      const updatedName = `updated_user_${uuid}`;
      const user = await UserModel.create({ name });
      createdUsers.push(user);

      const response = await request(app.getHttpServer())
        .patch('/api/user/current')
        .send({ name: updatedName })
        .set('token', user.id)
        .expect(200);

      expect(response.body.name).toBe(updatedName);

      const updatedUser = await UserModel.findOne({ where: { id: user.id } });
      expect(updatedUser).not.toBeNull();
      expect(updatedUser?.name).toBe(updatedName);
    });

    it('should return 401 if the user is not found', async () => {
      const name = `user_${uuidv4()}`;
      const response = await request(app.getHttpServer()).patch('/api/user/current').send({ name }).expect(401);

      expect(response.body.message).toBe('Unauthorized');
    });
  });

  describe('Check Username Availability', () => {
    it('should return true if the username is available', async () => {
      const availableName = `user_${uuidv4()}`;

      const response = await request(app.getHttpServer())
        .get('/api/user/check-name-availability')
        .query({ name: availableName })
        .expect(200);

      expect(response.body).toHaveProperty('nameIsAvailable', true);
    });

    it('should return false if the username is already taken', async () => {
      const takenName = `user_${uuidv4()}`;
      const existingUser = await UserModel.create({ name: takenName });
      createdUsers.push(existingUser);

      const response = await request(app.getHttpServer())
        .get('/api/user/check-name-availability')
        .query({ name: takenName })
        .expect(200);

      expect(response.body).toHaveProperty('nameIsAvailable', false);
    });

    it('should return 400 if no name is provided', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/user/check-name-availability')
        .query({})
        .expect(400);

      expect(response.body.message).toContain('name must be a string');
    });
  });
});
