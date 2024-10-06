import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { TestDataService } from './utils/TestDataService'; // Import the TestDataService
import { MessageMode } from '@core';

describe('Reply Endpoints (e2e)', () => {
  let app: INestApplication;
  let testDataService: TestDataService;
  let createdUser: any;
  let parentMessage: any;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    // Initialize the TestDataService
    testDataService = new TestDataService();

    await testDataService.cleanupAll();
  });

  beforeEach(async () => {
    // Create user and parent message for each test
    createdUser = await testDataService.createUser('token', 10);
    parentMessage = await testDataService.createMessage({ authorId: createdUser.id, body: 'Parent message' });
  });

  afterEach(async () => {
    // Cleanup all created data after each test
    await testDataService.cleanupAll();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Create Reply', () => {
    it('should create a reply successfully', async () => {
      const replyData = {
        body: 'Nice message',
        public: false,
        parentId: parentMessage.id,
      };

      const response = await request(app.getHttpServer())
        .post('/api/reply')
        .set('token', createdUser.id)
        .send(replyData);

      // console.log(response);

      expect(response.body).toHaveProperty('id');
      expect(response.body.body).toBe(replyData.body);
      expect(response.body.public).toBe(replyData.public);
      expect(response.body.parentId).toBe(replyData.parentId);
      expect(response.body).toHaveProperty('createdAt');
      expect(response.body).toHaveProperty('updatedAt');

      const createdReply = await testDataService.findMessage({ id: response.body.id });
      expect(createdReply).toBeDefined();

      testDataService.addCreatedMessage(createdReply);
    });

    it('should return 404 if the parent message does not exist', async () => {
      const replyData = {
        body: 'Nice message',
        public: false,
        parentId: testDataService.getNonExistentId(), // Simulate non-existent parent message
      };

      const response = await request(app.getHttpServer())
        .post('/api/reply')
        .set('token', createdUser.id)
        .send(replyData)
        .expect(404);

      expect(response.body.message).toContain('Message with id');
    });

    it('should return 400 if the parentId is not a valid UUID', async () => {
      const replyData = {
        body: 'Nice message',
        public: false,
        parentId: 'invalid_uuid', // Invalid UUID
      };

      const response = await request(app.getHttpServer())
        .post('/api/reply')
        .set('token', createdUser.id)
        .send(replyData)
        .expect(400);

      expect(response.body.message).toContain('parentId must be a UUID');
    });

    it('should return 400 if user has no enough coins to reply', async () => {
      // Simulate the user having not enough coins
      await testDataService.updateUserCoins(createdUser.id, 1);

      const replyData = {
        body: 'Nice message',
        public: false,
        parentId: parentMessage.id,
      };

      const response = await request(app.getHttpServer())
        .post('/api/reply')
        .set('token', createdUser.id)
        .send(replyData)
        .expect(400);

      expect(response.body.message).toContain(`User with id ${createdUser.id} has not enough coins to create reply`);
    });
  });

  describe('Update Reply', () => {
    let createdReply: any;

    beforeEach(async () => {
      // Create a reply for each update test
      createdReply = await testDataService.createMessage({
        authorId: createdUser.id,
        body: 'Initial message',
        parentId: parentMessage.id,
      });
    });

    it('should update a reply successfully', async () => {
      const updateData = {
        id: createdReply.id,
        public: true,
      };

      const response = await request(app.getHttpServer())
        .patch('/api/reply')
        .set('token', createdUser.id)
        .send(updateData)
        .expect(200);

      expect(response.body).toHaveProperty('id');
      expect(response.body.public).toBe(true);
      expect(response.body.updatedAt).not.toBe(response.body.createdAt);
    });

    it('should return 404 if the reply does not exist', async () => {
      const updateData = {
        id: testDataService.getNonExistentId(), // Non-existent UUID
        public: true,
      };

      const response = await request(app.getHttpServer())
        .patch('/api/reply')
        .set('token', createdUser.id)
        .send(updateData)
        .expect(404);

      expect(response.body.message).toContain('Reply with such id was not found');
    });

    it('should return 400 if the reply id is not a valid UUID', async () => {
      const updateData = {
        id: 'invalid_uuid', // Invalid UUID
        public: true,
      };

      const response = await request(app.getHttpServer())
        .patch('/api/reply')
        .set('token', createdUser.id)
        .send(updateData)
        .expect(400);

      expect(response.body.message).toContain('id must be a UUID');
    });
  });

  describe('Get Reply by ID', () => {
    let createdReply: any;

    beforeEach(async () => {
      // Create a reply for each get test
      createdReply = await testDataService.createMessage({
        authorId: createdUser.id,
        body: 'Initial message',
        parentId: parentMessage.id,
      });
    });

    it('should retrieve a reply by ID successfully', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/reply/${createdReply.id}`)
        .set('token', createdUser.id)
        .expect(200);

      expect(response.body).toHaveProperty('id');
      expect(response.body.id).toBe(createdReply.id);
      expect(response.body.body).toBe(createdReply.body);
    });

    it('should return 404 if the reply does not exist', async () => {
      const nonExistentReplyId = testDataService.getNonExistentId(); // Non-existent UUID

      const response = await request(app.getHttpServer())
        .get(`/api/reply/${nonExistentReplyId}`)
        .set('token', createdUser.id)
        .expect(404);

      expect(response.body.message).toContain(`Reply with id ${nonExistentReplyId} was not found`);
    });

    it('should return 400 if the reply id is not a valid UUID', async () => {
      const invalidReplyId = 'invalid_uuid'; // Invalid UUID

      const response = await request(app.getHttpServer())
        .get(`/api/reply/${invalidReplyId}`)
        .set('token', createdUser.id)
        .expect(400);

      expect(response.body.message).toContain('Validation failed (uuid is expected)');
    });
  });
});
