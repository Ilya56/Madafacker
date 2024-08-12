import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { v4 as uuidv4 } from 'uuid';
import { MessageModel, UserModel } from '@frameworks/data-services/sequelize/models';
import { MessageMode } from '@core';

describe('Reply Endpoints (e2e)', () => {
  let app: INestApplication;
  let createdReplies: MessageModel[] = [];
  const createdMessages: MessageModel[] = [];
  let createdUser: UserModel;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    // Create a user to use in the tests
    const userName = `user_${uuidv4()}`;
    createdUser = await UserModel.create({ name: userName });

    // Create a message to use as parent for replies
    const parentMessageData = {
      body: 'Parent message',
      mode: MessageMode.dark,
      authorId: createdUser.id,
    };
    const parentMessage = await MessageModel.create(parentMessageData);
    createdMessages.push(parentMessage);
  });

  afterEach(async () => {
    // Delete the replies created during the tests
    for (const reply of createdReplies) {
      await MessageModel.destroy({ where: { id: reply.id } });
    }
    createdReplies = [];
  });

  afterAll(async () => {
    // Clean up by deleting the created messages and user
    for (const message of createdMessages) {
      await MessageModel.destroy({ where: { id: message.id } });
    }
    await UserModel.destroy({ where: { id: createdUser.id } });
    await app.close();
  });

  // Test cases for Create Reply
  describe('Create Reply', () => {
    it('should create a reply successfully', async () => {
      const replyData = {
        body: 'Nice message',
        public: false,
        parentId: createdMessages[0].id, // Use the parent message created in beforeAll
      };

      const response = await request(app.getHttpServer())
        .post('/api/reply')
        .set('token', createdUser.id)
        .send(replyData)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.body).toBe(replyData.body);
      expect(response.body.public).toBe(replyData.public);
      expect(response.body.parentId).toBe(replyData.parentId);
      expect(response.body).toHaveProperty('createdAt');
      expect(response.body).toHaveProperty('updatedAt');

      const createdReply = await MessageModel.findOne({ where: { id: response.body.id } });
      expect(createdReply).toBeDefined();

      createdReplies.push(createdReply as MessageModel);
    });

    it('should return 404 if the parent message does not exist', async () => {
      const replyData = {
        body: 'Nice message',
        public: false,
        parentId: uuidv4(), // Use a random UUID for a non-existent parent
      };

      const response = await request(app.getHttpServer())
        .post('/api/reply')
        .set('token', createdUser.id)
        .send(replyData)
        .expect(404);

      expect(response.body.message).toContain('Message with id');
    });

    it.skip('should return 400 if the parentId is not a valid UUID', async () => {
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
  });

  // Test cases for Update Reply
  describe('Update Reply', () => {
    let createdReply: MessageModel;

    beforeEach(async () => {
      // Create a reply to use in the update tests
      const replyData = {
        body: 'Initial message',
        public: false,
        mode: MessageMode.light,
        parentId: createdMessages[0].id, // Use the parent message created in beforeAll
        authorId: createdUser.id,
      };
      createdReply = await MessageModel.create(replyData);
      createdReplies.push(createdReply);
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

    it.skip('should return 404 if the reply does not exist', async () => {
      const updateData = {
        id: uuidv4(), // Non-existent UUID
        public: true,
      };

      const response = await request(app.getHttpServer())
        .patch('/api/reply')
        .set('token', createdUser.id)
        .send(updateData)
        .expect(404);

      expect(response.body.message).toContain('Reply with such id was not found');
    });

    it.skip('should return 400 if the reply id is not a valid UUID', async () => {
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

  // Test cases for Get Reply by ID
  describe('Get Reply by ID', () => {
    let createdReply: MessageModel;

    beforeEach(async () => {
      // Create a reply to use in the get tests
      const replyData = {
        body: 'Initial message',
        public: false,
        mode: MessageMode.light,
        parentId: createdMessages[0].id, // Use the parent message created in beforeAll
        authorId: createdUser.id,
      };
      createdReply = await MessageModel.create(replyData);
      createdReplies.push(createdReply);
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

    it.skip('should return 404 if the reply does not exist', async () => {
      const nonExistentReplyId = uuidv4(); // Non-existent UUID

      const response = await request(app.getHttpServer())
        .get(`/api/reply/${nonExistentReplyId}`)
        .set('token', createdUser.id)
        .expect(404);

      expect(response.body.message).toContain('Reply with such id was not found');
    });

    it.skip('should return 400 if the reply id is not a valid UUID', async () => {
      const invalidReplyId = 'invalid_uuid'; // Invalid UUID

      const response = await request(app.getHttpServer())
        .get(`/api/reply/${invalidReplyId}`)
        .set('token', createdUser.id)
        .expect(400);

      expect(response.body.message).toContain('id must be a UUID');
    });
  });
});
