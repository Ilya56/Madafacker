import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { TestDataService } from './utils/TestDataService';

describe('User Endpoints (e2e)', () => {
  let app: INestApplication;
  let testDataService: TestDataService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
    await app.init();

    // Initialize the TestDataService
    testDataService = new TestDataService();
  });

  afterEach(async () => {
    await testDataService.cleanupAll();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Create User', () => {
    it('should create a user successfully', async () => {
      const name = testDataService.getUserName();
      const registrationToken = 'token';

      const response = await request(app.getHttpServer())
        .post('/api/user')
        .send({ name, registrationToken: 'token' })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe(name);
      expect(response.body.registrationToken).toBe(registrationToken);
      expect(response.body).toHaveProperty('createdAt');
      expect(response.body).toHaveProperty('updatedAt');

      const createdUser = await testDataService.findUser({ name: name });
      expect(createdUser).toBeDefined();
      expect(createdUser?.registrationToken).toBe(registrationToken);
      testDataService.addCreatedUser(createdUser);
    });

    it('should return 400 for duplicated user', async () => {
      const user = await testDataService.createUser();

      const response = await request(app.getHttpServer())
        .post('/api/user')
        .send({ name: user.name, registrationToken: 'token' })
        .expect(400);

      expect(response.body.message).toContain('Duplicated value is not allowed');
    });

    it('should return 400 for invalid data (empty body)', async () => {
      const response = await request(app.getHttpServer()).post('/api/user').send({}).expect(400);

      expect(response.body.message).toContain('name should not be empty');
      expect(response.body.message).toContain('registrationToken should not be empty');
    });

    it('should return 400 for invalid registration token format', async () => {
      const user = await testDataService.createUser();
      const registrationToken = 'invalid-token';

      const response = await request(app.getHttpServer())
        .post('/api/user')
        .send({ name: user.name, registrationToken })
        .expect(400);

      expect(response.body.message).toContain('Invalid notify service token');
    });

    it('should return 400 for too long name or registration token', async () => {
      const name = 'a'.repeat(256); // exceeds 255 characters
      const registrationToken = 'b'.repeat(1001); // exceeds 1000 characters

      const response = await request(app.getHttpServer())
        .post('/api/user')
        .send({ name, registrationToken })
        .expect(400);

      expect(response.body.message).toContain('name must be shorter than or equal to 255 characters');
      expect(response.body.message).toContain('registrationToken must be shorter than or equal to 1000 characters');
    });
  });

  describe('Get Current User', () => {
    it('should return the current user', async () => {
      const user = await testDataService.createUser();

      const response = await request(app.getHttpServer()).get('/api/user/current').set('token', user.id).expect(200);

      expect(response.body.name).toBe(user.name);
      expect(response.body.registrationToken).toBe(user.registrationToken);
    });

    it('should return 401 if no token provided', async () => {
      const response = await request(app.getHttpServer()).get('/api/user/current').expect(401);

      expect(response.body.message).toBe('Unauthorized');
    });

    it('should return 404 if no user is found', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/user/current')
        .set('token', 'random-id')
        .expect(404);

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
      const user = await testDataService.createUser();
      const updatedName = `updated_user_${user.name}`;

      const response = await request(app.getHttpServer())
        .patch('/api/user/current')
        .send({ name: updatedName })
        .set('token', user.id)
        .expect(200);

      expect(response.body.name).toBe(updatedName);

      const updatedUser = await testDataService.findUser({ id: user.id });
      expect(updatedUser).not.toBeNull();
      expect(updatedUser?.name).toBe(updatedName);
    });

    it('should not allow updating registration token of the current user', async () => {
      const user = await testDataService.createUser();

      const response = await request(app.getHttpServer())
        .patch('/api/user/current')
        .send({ name: user.name, registrationToken: 'new_token' })
        .set('token', user.id)
        .expect(400);

      expect(response.body.message).toContain('property registrationToken should not exist');
    });

    it('should return 401 if the user is not found', async () => {
      const response = await request(app.getHttpServer())
        .patch('/api/user/current')
        .send({ name: 'some_name' })
        .expect(401);

      expect(response.body.message).toBe('Unauthorized');
    });

    it('should return 400 for too long name or registration token', async () => {
      const name = 'a'.repeat(256); // exceeds 255 characters

      const response = await request(app.getHttpServer()).post('/api/user').send({ name }).expect(400);

      expect(response.body.message).toContain('name must be shorter than or equal to 255 characters');
    });
  });

  describe('Check Username Availability', () => {
    it('should return true if the username is available', async () => {
      const availableName = testDataService.getUserName();

      const response = await request(app.getHttpServer())
        .get('/api/user/check-name-availability')
        .query({ name: availableName })
        .expect(200);

      expect(response.body).toHaveProperty('nameIsAvailable', true);
    });

    it('should return false if the username is already taken', async () => {
      const user = await testDataService.createUser();

      const response = await request(app.getHttpServer())
        .get('/api/user/check-name-availability')
        .query({ name: user.name })
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
