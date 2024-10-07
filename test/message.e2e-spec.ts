import { INestApplication, Logger, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { v4 as uuidv4 } from 'uuid';
import { MessageModel } from '@frameworks/data-services/sequelize/models';
import { TestDataService } from './utils/TestDataService';
import { delay } from './utils/delay';

describe('Message Endpoints (e2e)', () => {
  let app: INestApplication;
  let testDataService: TestDataService;
  let createdUser: any;
  let anotherUser: any;

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

  beforeEach(async () => {
    // Create users before each test
    createdUser = await testDataService.createUser('token');
    anotherUser = await testDataService.createUser('token2');
  });

  afterEach(async () => {
    // Cleanup all created data after each test
    await testDataService.cleanupAll();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Create Message', () => {
    it('should create a message successfully and send it to selected users', async () => {
      const messageData = {
        body: 'Test message',
        mode: 'dark',
      };

      const response = await request(app.getHttpServer())
        .post('/api/message')
        .set('token', createdUser.id)
        .send(messageData)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.body).toBe(messageData.body);
      expect(response.body.mode).toBe(messageData.mode);
      expect(response.body).toHaveProperty('createdAt');
      expect(response.body).toHaveProperty('updatedAt');

      const createdMessage = await testDataService.findMessage({ id: response.body.id });
      expect(createdMessage).toBeDefined();

      // Check that the message was marked as sent
      const updatedMessage = await MessageModel.findOne({ where: { id: response.body.id, wasSent: false } });
      expect(updatedMessage).toBeDefined();

      await delay(100);

      // Check that the message was sent to users (i.e., entries exist in IncomeUserMessagesModel)
      const incomeUserMessage = await testDataService.getInboxMessageById(response.body.id);
      expect(incomeUserMessage).toBeDefined();

      testDataService.addCreatedMessage(createdMessage);
    });

    it('should return 400 for missing message body', async () => {
      const messageData = {
        mode: 'dark',
      };

      const response = await request(app.getHttpServer())
        .post('/api/message')
        .set('token', createdUser.id)
        .send(messageData)
        .expect(400);

      expect(response.body.message).toContain('body should not be empty');
    });

    it('should return 400 for too long message body', async () => {
      const messageData = {
        mode: 'dark',
        body: 'A'.repeat(1001),
      };

      const response = await request(app.getHttpServer())
        .post('/api/message')
        .set('token', createdUser.id)
        .send(messageData)
        .expect(400);

      expect(response.body.message).toContain('body must be shorter than or equal to 1000 characters');
    });

    it('should return 400 for missing message mode', async () => {
      const messageData = {
        body: 'Test message',
      };

      const response = await request(app.getHttpServer())
        .post('/api/message')
        .set('token', createdUser.id)
        .send(messageData)
        .expect(400);

      expect(response.body.message[0]).toContain('mode must be one of the following values');
    });

    it('should return 400 for invalid mode value', async () => {
      const messageData = {
        body: 'Test message',
        mode: 'invalid_mode',
      };

      const response = await request(app.getHttpServer())
        .post('/api/message')
        .set('token', createdUser.id)
        .send(messageData)
        .expect(400);

      expect(response.body.message).toContain('mode must be one of the following values: light, dark');
    });

    describe('FCM check', () => {
      let loggerSpy: jest.SpyInstance;

      const messageData = {
        body: 'Test message',
        mode: 'dark',
      };

      beforeAll(async () => {
        // remove created users and create new users with required token
        await testDataService.cleanupUsers();
      });

      beforeEach(() => {
        loggerSpy = jest.spyOn(Logger.prototype, 'error');
      });

      afterEach(() => {
        loggerSpy.mockRestore();
      });

      it('should create a message successfully and handle fcm invalid token error', async () => {
        await testDataService.createMultipleUsers(10, 'invalid-token');

        const response = await request(app.getHttpServer())
          .post('/api/message')
          .set('token', testDataService.getFirstCreatedUser().id)
          .send(messageData)
          .expect(201);

        await delay(500);

        console.log(loggerSpy.mock.calls);
        expect(loggerSpy.mock.calls[0][0]).toContain('Invalid user registration token');

        const createdMessage = await testDataService.findMessage({ id: response.body.id });
        testDataService.addCreatedMessage(createdMessage);
      });

      it('should create a message successfully and handle fcm unknown error', async () => {
        // remove created users and create new users with required token
        await testDataService.createMultipleUsers(10, 'error');

        const response = await request(app.getHttpServer())
          .post('/api/message')
          .set('token', testDataService.getFirstCreatedUser().id)
          .send(messageData)
          .expect(201);

        await delay(500);

        console.log(loggerSpy.mock.calls);
        expect(loggerSpy.mock.calls[0][0]).toContain('Error while notify users about message');

        const createdMessage = await testDataService.findMessage({ id: response.body.id });
        testDataService.addCreatedMessage(createdMessage);
      });
    });
  });

  // Test cases for Rate Message
  describe('Rate Message', () => {
    let message: MessageModel;

    beforeEach(async () => {
      message = await testDataService.createMessage({
        authorId: anotherUser.id,
        body: 'Test message for rating',
      });
      await testDataService.addMessageToUserInbox(createdUser.id, message.id);
    });

    it('should rate a message successfully', async () => {
      const rateData = {
        rating: 'like',
      };

      const response = await request(app.getHttpServer())
        .patch(`/api/message/${message.id}/rate`)
        .set('token', createdUser.id)
        .send(rateData)
        .expect(200);

      expect(response.body).toBeDefined();
    });

    it('should return 400 when trying to rate the message again', async () => {
      const rateData = { rating: 'like' };

      // First rate (success)
      await request(app.getHttpServer())
        .patch(`/api/message/${message.id}/rate`)
        .set('token', createdUser.id)
        .send(rateData)
        .expect(200);

      // Second rate (error)
      const response = await request(app.getHttpServer())
        .patch(`/api/message/${message.id}/rate`)
        .set('token', createdUser.id)
        .send(rateData)
        .expect(400);

      expect(response.body.message).toBe('Operation not allowed: Rating can only be set once and cannot be changed');
    });

    it('should return 400 when trying to rate own message', async () => {
      const message = await testDataService.createMessage({
        authorId: createdUser.id,
        body: 'Test message to self-rate',
      });

      const rateData = { rating: 'like' };

      const response = await request(app.getHttpServer())
        .patch(`/api/message/${message.id}/rate`)
        .set('token', createdUser.id)
        .send(rateData)
        .expect(400);

      expect(response.body.message).toBe('Operation not allowed: Cannot rate own message');
    });

    it('should return 404 when trying to rate a message not received by the user', async () => {
      const message = await testDataService.createMessage({
        authorId: anotherUser.id,
        body: 'Test message for rating',
      });

      const rateData = { rating: 'like' };

      const response = await request(app.getHttpServer())
        .patch(`/api/message/${message.id}/rate`)
        .set('token', createdUser.id)
        .send(rateData)
        .expect(404);

      expect(response.body.message).toBe(
        `Cannot rate because message with id ${message.id} not found for current user ${createdUser.id}`,
      );
    });

    it('should return 400 for missing rating', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/api/message/${message.id}/rate`)
        .set('token', createdUser.id)
        .send({})
        .expect(400);

      expect(response.body.message).toContain('rating should not be empty');
    });

    it('should return 400 for invalid rating value', async () => {
      const rateData = {
        rating: 'invalid_rating',
      };

      const response = await request(app.getHttpServer())
        .patch(`/api/message/${message.id}/rate`)
        .set('token', createdUser.id)
        .send(rateData)
        .expect(400);

      expect(response.body.message[0]).toContain('rating must be one of the following values:');
    });

    it('should return 404 for rating a non-existent message', async () => {
      const rateData = {
        rating: 'like',
      };

      const nonExistentMessageId = testDataService.getNonExistentId();

      const response = await request(app.getHttpServer())
        .patch(`/api/message/${nonExistentMessageId}/rate`)
        .set('token', createdUser.id)
        .send(rateData)
        .expect(404);

      expect(response.body.message).toBe(`Message with id ${nonExistentMessageId} was not found`);
    });
  });

  // Test cases for Get Incoming Messages
  describe('Get Incoming Messages with Replies', () => {
    it('should retrieve incoming messages with 1 level depth replies', async () => {
      const parentMessage = await testDataService.createMessage({ authorId: anotherUser.id, body: 'Parent message' });
      const replyMessage = await testDataService.createMessage({
        authorId: anotherUser.id,
        body: 'Reply to parent message',
        parentId: parentMessage.id,
      });

      await testDataService.addMessageToUserInbox(createdUser.id, parentMessage.id);
      await testDataService.addMessageToUserInbox(createdUser.id, replyMessage.id);

      const response = await request(app.getHttpServer())
        .get('/api/message/current/incoming')
        .set('token', createdUser.id)
        .expect(200);

      expect(response.body).toBeInstanceOf(Array);
      expect(response.body.length).toBeGreaterThan(0);

      // Check that the parent message has replies with a depth of 1
      const parentMessageInResponse = response.body.find((msg: any) => msg.id === parentMessage.id);
      expect(parentMessageInResponse).toBeDefined();
      expect(parentMessageInResponse.replies).toBeInstanceOf(Array);
      expect(parentMessageInResponse.replies.length).toBe(1);
      expect(parentMessageInResponse.replies[0].body).toBe(replyMessage.body);
    });
  });

  // Test cases for Get Outcoming Messages
  describe('Get Outcoming Messages with Replies', () => {
    // beforeEach(async () => {
    //
    // });

    it('should retrieve outcoming messages with 1 level depth replies', async () => {
      const parentMessage = await testDataService.createMessage({ authorId: createdUser.id, body: 'Parent message' });
      const replyMessage = await testDataService.createMessage({
        authorId: anotherUser.id,
        body: 'Reply to parent message',
        parentId: parentMessage.id,
      });

      const response = await request(app.getHttpServer())
        .get('/api/message/current/outcoming')
        .set('token', createdUser.id)
        .expect(200);

      expect(response.body).toBeInstanceOf(Array);
      expect(response.body.length).toBeGreaterThan(0);

      // Check that the parent message has replies with a depth of 1
      const parentMessageInResponse = response.body.find((msg: any) => msg.id === parentMessage.id);
      expect(parentMessageInResponse).toBeDefined();
      expect(parentMessageInResponse.replies).toBeInstanceOf(Array);
      expect(parentMessageInResponse.replies.length).toBe(1);
      expect(parentMessageInResponse.replies[0].body).toBe(replyMessage.body);
    });
  });
});
