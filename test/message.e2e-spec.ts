import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { MessageModel } from '@frameworks/data-services/sequelize/models';
import { TestDataService } from './utils/TestDataService';
import { VALID_TOKEN } from '@frameworks/firebase-module';
import { ModerationServiceAbstract } from '@core';

const VALID_AUTH = `Bearer ${VALID_TOKEN}`;

describe('Message Endpoints (e2e)', () => {
  let app: INestApplication;
  let testDataService: TestDataService;
  let createdUser: any;
  let anotherUser: any;

  let moderationMock: { moderate: jest.Mock };
  let configMock: { get: jest.Mock };

  beforeAll(async () => {
    moderationMock = {
      moderate: jest.fn(),
    };

    configMock = {
      get: jest.fn((key: string) => {
        if (key === 'moderation.thresholdLight') return 0.01;
        if (key === 'moderation.thresholdDark') return 0.4;
        return undefined;
      }),
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(ModerationServiceAbstract)
      .useValue(moderationMock)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    // Initialize the TestDataService
    testDataService = new TestDataService();
  }, 10000);

  beforeEach(async () => {
    jest.clearAllMocks();

    // Create users before each test
    createdUser = await testDataService.createUser({ token: 'token' });
    anotherUser = await testDataService.createUser({ token: 'token2', authProviderId: 'another_id' });

    // Default moderation behavior (safe): allow everything
    moderationMock.moderate.mockResolvedValue({ flagged: false, categoryScores: { safe: 0 } });

    // Default thresholds for tests (can be overridden per-test)
    configMock.get.mockImplementation((key: string) => {
      if (key === 'moderation.thresholdLight') return 0.01;
      if (key === 'moderation.thresholdDark') return 0.4;
      return undefined;
    });
  });

  afterEach(async () => {
    // Cleanup all created data after each test
    await testDataService.cleanupAll();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Create Message', () => {
    it('should create a message successfully', async () => {
      const messageData = {
        body: 'Test message',
        mode: 'dark',
      };

      const response = await request(app.getHttpServer())
        .post('/api/message')
        .set('Authorization', VALID_AUTH)
        .send(messageData)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.body).toBe(messageData.body);
      expect(response.body.mode).toBe(messageData.mode);
      expect(response.body).toHaveProperty('createdAt');
      expect(response.body).toHaveProperty('updatedAt');
      expect(response.body).toHaveProperty('author');
      expect(response.body.author.id).toBe(createdUser.id);
      expect(response.body.author.name).toBe(createdUser.name);

      const createdMessage = await testDataService.findMessage({ id: response.body.id });
      expect(createdMessage).toBeDefined();

      // Check that the message was not marked as sent yet
      const updatedMessage = await MessageModel.findOne({ where: { id: response.body.id, wasSent: false } });
      expect(updatedMessage).toBeDefined();

      testDataService.addCreatedMessage(createdMessage);
    });

    it('should return 400 for missing message body', async () => {
      const messageData = {
        mode: 'dark',
      };

      const response = await request(app.getHttpServer())
        .post('/api/message')
        .set('Authorization', VALID_AUTH)
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
        .set('Authorization', VALID_AUTH)
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
        .set('Authorization', VALID_AUTH)
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
        .set('Authorization', VALID_AUTH)
        .send(messageData)
        .expect(400);

      expect(response.body.message).toContain('mode must be one of the following values: light, dark');
    });

    describe('Moderation (e2e)', () => {
      it('light: should reject when ANY score is just above thresholdLight (422) and NOT create message', async () => {
        configMock.get.mockImplementation((key: string) => {
          if (key === 'moderation.thresholdLight') return 0.01;
          if (key === 'moderation.thresholdDark') return 0.4;
          return undefined;
        });

        moderationMock.moderate.mockResolvedValue({
          flagged: false,
          categoryScores: { hate: 0.010001 },
        });

        const messageData = {
          body: 'Test message - light mode',
          mode: 'light',
        };

        const response = await request(app.getHttpServer())
          .post('/api/message')
          .set('Authorization', VALID_AUTH)
          .send(messageData)
          .expect(422);

        expect(typeof response.body.message).toBe('string');
        expect(response.body.message).toContain('Message rejected: moderation threshold exceeded for "hate"');

        // Ensure a message was not created
        const created = await testDataService.findMessage({ body: messageData.body });
        expect(created).toBeNull();
      });

      it('light: should allow when score equals thresholdLight (edge case, 201)', async () => {
        configMock.get.mockImplementation((key: string) => {
          if (key === 'moderation.thresholdLight') return 0.01;
          if (key === 'moderation.thresholdDark') return 0.4;
          return undefined;
        });

        moderationMock.moderate.mockResolvedValue({
          flagged: true,
          categoryScores: { hate: 0.01 }, // equals => allowed
        });

        const messageData = {
          body: 'Allowed at threshold light',
          mode: 'light',
        };

        const response = await request(app.getHttpServer())
          .post('/api/message')
          .set('Authorization', VALID_AUTH)
          .send(messageData)
          .expect(201);

        expect(response.body.body).toBe(messageData.body);
        expect(response.body.mode).toBe(messageData.mode);

        const createdMessage = await testDataService.findMessage({ id: response.body.id });
        expect(createdMessage).toBeDefined();
        testDataService.addCreatedMessage(createdMessage);
      });

      it('dark: should allow when scores <= thresholdDark even if provider flagged=true (201)', async () => {
        configMock.get.mockImplementation((key: string) => {
          if (key === 'moderation.thresholdLight') return 0.01;
          if (key === 'moderation.thresholdDark') return 0.4;
          return undefined;
        });

        moderationMock.moderate.mockResolvedValue({
          flagged: true,
          categoryScores: { violence: 0.4 }, // equals => allowed
        });

        const messageData = {
          body: 'Borderline allowed in dark mode',
          mode: 'dark',
        };

        const response = await request(app.getHttpServer())
          .post('/api/message')
          .set('Authorization', VALID_AUTH)
          .send(messageData)
          .expect(201);

        expect(response.body.body).toBe(messageData.body);
        expect(response.body.mode).toBe(messageData.mode);

        const createdMessage = await testDataService.findMessage({ id: response.body.id });
        expect(createdMessage).toBeDefined();
        testDataService.addCreatedMessage(createdMessage);
      });

      it('dark: should reject when ANY score is above thresholdDark (422) and NOT create', async () => {
        configMock.get.mockImplementation((key: string) => {
          if (key === 'moderation.thresholdLight') return 0.01;
          if (key === 'moderation.thresholdDark') return 0.4;
          return undefined;
        });

        moderationMock.moderate.mockResolvedValue({
          flagged: false,
          categoryScores: { violence: 0.40001 },
        });

        const messageData = {
          body: 'Rejected in dark mode',
          mode: 'dark',
        };

        const response = await request(app.getHttpServer())
          .post('/api/message')
          .set('Authorization', VALID_AUTH)
          .send(messageData)
          .expect(422);

        expect(typeof response.body.message).toBe('string');
        expect(response.body.message).toContain('Message rejected: moderation threshold exceeded for "violence"');

        const created = await testDataService.findMessage({ body: messageData.body });
        expect(created).toBeNull();
      });

      it('should fail-close (422) when moderation provider throws and NOT create', async () => {
        moderationMock.moderate.mockRejectedValue(new Error('provider down'));

        const messageData = {
          body: 'Should fail close',
          mode: 'dark',
        };

        const response = await request(app.getHttpServer())
          .post('/api/message')
          .set('Authorization', VALID_AUTH)
          .send(messageData)
          .expect(422);

        expect(typeof response.body.message).toBe('string');
        expect(response.body.message).toBe('Message moderation failed. Please try again later.');

        const created = await testDataService.findMessage({ body: messageData.body });
        expect(created).toBeNull();
      });

      it('should ignore non-numeric category scores and still allow when no numeric score exceeds threshold (201)', async () => {
        moderationMock.moderate.mockResolvedValue({
          flagged: false,
          categoryScores: {
            weird: NaN as unknown as number,
            nonNumber: 'nope' as unknown as number,
            ok: 0.0,
          },
        });

        const messageData = {
          body: 'Non numeric scores should not break',
          mode: 'dark',
        };

        const response = await request(app.getHttpServer())
          .post('/api/message')
          .set('Authorization', VALID_AUTH)
          .send(messageData)
          .expect(201);

        expect(response.body.body).toBe(messageData.body);

        const createdMessage = await testDataService.findMessage({ id: response.body.id });
        expect(createdMessage).toBeDefined();
        testDataService.addCreatedMessage(createdMessage);
      });

      it('should still validate DTO first (400) and NOT call moderation when body is missing', async () => {
        const messageData = {
          mode: 'dark',
        };

        await request(app.getHttpServer())
          .post('/api/message')
          .set('Authorization', VALID_AUTH)
          .send(messageData)
          .expect(400);

        expect(moderationMock.moderate).not.toHaveBeenCalled();
      });

      it('should allow when categoryScores is null (treated as empty)', async () => {
        moderationMock.moderate.mockResolvedValue({
          flagged: false,
          categoryScores: null as any,
        });

        const messageData = {
          body: 'Null categoryScores',
          mode: 'dark',
        };

        const response = await request(app.getHttpServer())
          .post('/api/message')
          .set('Authorization', VALID_AUTH)
          .send(messageData)
          .expect(201);

        expect(response.body.body).toBe(messageData.body);
      });

      it('should allow when categoryScores is empty object', async () => {
        moderationMock.moderate.mockResolvedValue({
          flagged: false,
          categoryScores: {},
        });

        const response = await request(app.getHttpServer())
          .post('/api/message')
          .set('Authorization', VALID_AUTH)
          .send({ body: 'Empty scores', mode: 'light' })
          .expect(201);

        expect(response.body.body).toBe('Empty scores');
      });

      it('should reject when exceeded score is NOT first entry', async () => {
        moderationMock.moderate.mockResolvedValue({
          flagged: false,
          categoryScores: {
            safe: 0.0,
            hate: 0.02, // second entry exceeds
          },
        });

        const response = await request(app.getHttpServer())
          .post('/api/message')
          .set('Authorization', VALID_AUTH)
          .send({ body: 'Second score exceeds', mode: 'light' })
          .expect(422);

        expect(response.body.message).toContain('"hate"');
      });

      it('should reject when score is Infinity', async () => {
        moderationMock.moderate.mockResolvedValue({
          flagged: false,
          categoryScores: {
            extreme: Infinity,
          },
        });

        await request(app.getHttpServer())
          .post('/api/message')
          .set('Authorization', VALID_AUTH)
          .send({ body: 'Infinity score', mode: 'dark' })
          .expect(422);
      });

      it('should ignore undefined scores', async () => {
        moderationMock.moderate.mockResolvedValue({
          flagged: false,
          categoryScores: {
            weird: undefined as any,
          },
        });

        const response = await request(app.getHttpServer())
          .post('/api/message')
          .set('Authorization', VALID_AUTH)
          .send({ body: 'Undefined score', mode: 'dark' })
          .expect(201);

        expect(response.body.body).toBe('Undefined score');
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
        .set('Authorization', VALID_AUTH)
        .send(rateData)
        .expect(200);

      expect(response.body).toBeDefined();
    });

    it('should return 400 when trying to rate the message again', async () => {
      const rateData = { rating: 'like' };

      // First rate (success)
      await request(app.getHttpServer())
        .patch(`/api/message/${message.id}/rate`)
        .set('Authorization', VALID_AUTH)
        .send(rateData)
        .expect(200);

      // Second rate (error)
      const response = await request(app.getHttpServer())
        .patch(`/api/message/${message.id}/rate`)
        .set('Authorization', VALID_AUTH)
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
        .set('Authorization', VALID_AUTH)
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
        .set('Authorization', VALID_AUTH)
        .send(rateData)
        .expect(404);

      expect(response.body.message).toBe(
        `Cannot rate because message with id ${message.id} not found for current user ${createdUser.id}`,
      );
    });

    it('should return 400 for missing rating', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/api/message/${message.id}/rate`)
        .set('Authorization', VALID_AUTH)
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
        .set('Authorization', VALID_AUTH)
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
        .set('Authorization', VALID_AUTH)
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
        .set('Authorization', VALID_AUTH)
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

    it('should retrieve incoming messages with rating statistics and own rating', async () => {
      const message = await testDataService.createMessage({ authorId: anotherUser.id, body: 'Rated message' });
      await testDataService.addMessageToUserInbox(createdUser.id, message.id);

      // Other user likes this message
      const thirdUser = await testDataService.createUser({ token: 'token3', authProviderId: 'third_id' });
      await testDataService.addMessageToUserInbox(thirdUser.id, message.id);
      await testDataService.rateMessage(thirdUser.id, message.id, 'like');

      // Current user superlikes this message
      await testDataService.rateMessage(createdUser.id, message.id, 'superlike');

      const response = await request(app.getHttpServer())
        .get('/api/message/current/incoming')
        .set('Authorization', VALID_AUTH)
        .expect(200);

      const messageInResponse = response.body.find((msg: any) => msg.id === message.id);
      expect(messageInResponse).toBeDefined();
      expect(messageInResponse.ratingStats).toEqual({
        likes: 1,
        dislikes: 0,
        superLikes: 1,
      });
      expect(messageInResponse.ownRating).toBe('superlike');
    });
  });

  // Test cases for Get Outcoming Messages
  describe('Get Outcoming Messages with Replies', () => {
    it('should retrieve outcoming messages with 1 level depth replies', async () => {
      const parentMessage = await testDataService.createMessage({ authorId: createdUser.id, body: 'Parent message' });
      const replyMessage = await testDataService.createMessage({
        authorId: anotherUser.id,
        body: 'Reply to parent message',
        parentId: parentMessage.id,
      });

      const response = await request(app.getHttpServer())
        .get('/api/message/current/outcoming')
        .set('Authorization', VALID_AUTH)
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

    it('should retrieve outcoming messages with rating statistics', async () => {
      const message = await testDataService.createMessage({ authorId: createdUser.id, body: 'My outcoming message' });

      // Other user likes my message
      await testDataService.addMessageToUserInbox(anotherUser.id, message.id);
      await testDataService.rateMessage(anotherUser.id, message.id, 'dislike');

      const response = await request(app.getHttpServer())
        .get('/api/message/current/outcoming')
        .set('Authorization', VALID_AUTH)
        .expect(200);

      const messageInResponse = response.body.find((msg: any) => msg.id === message.id);
      expect(messageInResponse).toBeDefined();
      expect(messageInResponse.ratingStats).toEqual({
        likes: 0,
        dislikes: 1,
        superLikes: 0,
      });
      // Outcoming messages should not have ownRating (or it should be null/undefined as it is not an incoming message for the current user)
      expect(messageInResponse.ownRating).toBeFalsy();
    });
  });
});
