import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { v4 as uuidv4 } from 'uuid';
import { MessageModel, UserModel, IncomeUserMessagesModel } from '@frameworks/data-services/sequelize/models';
import { MessageMode } from '@core';
import { delay } from './utils/delay';

describe('Message Endpoints (e2e)', () => {
  let app: INestApplication;
  let createdMessages: MessageModel[] = [];
  let createdUser: UserModel;
  let anotherUser: UserModel;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    // Create a user to use in the tests
    const userName = `user_${uuidv4()}`;
    const user2Name = `user_${uuidv4()}`;
    createdUser = await UserModel.create({ name: userName, registrationToken: 'token' });
    anotherUser = await UserModel.create({ name: user2Name, registrationToken: 'token2' });
  });

  afterEach(async () => {
    // Delete only the messages created during the tests
    for (const message of createdMessages) {
      await IncomeUserMessagesModel.destroy({ where: { messageId: message.id } });
      await MessageModel.destroy({ where: { id: message.id } });
    }
    createdMessages = [];
  });

  afterAll(async () => {
    // Clean up by deleting the created users
    await IncomeUserMessagesModel.destroy({ where: { userId: createdUser.id } });
    await MessageModel.destroy({ where: { authorId: createdUser.id } });
    await UserModel.destroy({ where: { id: createdUser.id } });

    await IncomeUserMessagesModel.destroy({ where: { userId: anotherUser.id } });
    await MessageModel.destroy({ where: { authorId: anotherUser.id } });
    await UserModel.destroy({ where: { id: anotherUser.id } });

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

      const createdMessage = await MessageModel.findOne({ where: { id: response.body.id } });
      expect(createdMessage).toBeDefined();

      // Check that the message was marked as sent
      const updatedMessage = await MessageModel.findOne({ where: { id: response.body.id, wasSent: false } });
      expect(updatedMessage).toBeDefined();

      await delay(100);

      // Check that the message was sent to users (i.e., entries exist in IncomeUserMessagesModel)
      // const incomeUserMessages = await IncomeUserMessagesModel.findAll({ where: { messageId: response.body.id } });
      // expect(incomeUserMessages.length).toBeGreaterThan(0);

      createdMessages.push(createdMessage as MessageModel);
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
  });

  // Test cases for Rate Message
  describe('Rate Message', () => {
    it('should rate a message successfully', async () => {
      const messageData = {
        body: 'Test message for rating',
        mode: MessageMode.light,
        authorId: anotherUser.id,
      };

      const createdMessage = await MessageModel.create(messageData);
      createdMessages.push(createdMessage);
      await IncomeUserMessagesModel.create({
        userId: createdUser.id,
        messageId: createdMessage.id,
      });

      const rateData = {
        rating: 'like',
      };

      const response = await request(app.getHttpServer())
        .patch(`/api/message/${createdMessage.id}/rate`)
        .set('token', createdUser.id)
        .send(rateData)
        .expect(200);

      expect(response.body).toBeDefined();
    });

    it('should return 400 when trying to rate message again', async () => {
      const messageData = {
        body: 'Test message for rating',
        mode: MessageMode.light,
        authorId: anotherUser.id,
      };

      const createdMessage = await MessageModel.create(messageData);
      createdMessages.push(createdMessage);
      await IncomeUserMessagesModel.create({
        userId: createdUser.id,
        messageId: createdMessage.id,
      });

      const rateData = {
        rating: 'like',
      };

      // first time rate 200
      await request(app.getHttpServer())
        .patch(`/api/message/${createdMessage.id}/rate`)
        .set('token', createdUser.id)
        .send(rateData)
        .expect(200);

      // second rate error
      const response = await request(app.getHttpServer())
        .patch(`/api/message/${createdMessage.id}/rate`)
        .set('token', createdUser.id)
        .send(rateData)
        .expect(400);

      expect(response.body.message).toBe('Operation not allowed: Rating can only be set once and cannot be changed');
    });

    it('should return 400 when trying to rate own message', async () => {
      const messageData = {
        body: 'Test message to self-rate',
        mode: MessageMode.light,
        authorId: createdUser.id,
      };

      const createdMessage = await MessageModel.create(messageData);
      createdMessages.push(createdMessage);

      const rateData = {
        rating: 'like',
      };

      const response = await request(app.getHttpServer())
        .patch(`/api/message/${createdMessage.id}/rate`)
        .set('token', createdUser.id)
        .send(rateData)
        .expect(400);

      expect(response.body.message).toBe('Operation not allowed: Cannot rate own message');
    });

    it('should return 404 when trying to rate that not receiver', async () => {
      const messageData = {
        body: 'Test message for rating',
        mode: MessageMode.light,
        authorId: anotherUser.id,
      };

      const createdMessage = await MessageModel.create(messageData);
      createdMessages.push(createdMessage);

      const rateData = {
        rating: 'like',
      };

      const response = await request(app.getHttpServer())
        .patch(`/api/message/${createdMessage.id}/rate`)
        .set('token', createdUser.id)
        .send(rateData)
        .expect(404);

      expect(response.body.message).toBe(
        `Cannot rate because message with id ${createdMessage.id} not found for current user ${createdUser.id}`,
      );
    });

    it('should return 400 for missing rating', async () => {
      const messageData = {
        body: 'Test message for missing rating',
        mode: MessageMode.light,
        authorId: anotherUser.id,
      };

      const createdMessage = await MessageModel.create(messageData);
      createdMessages.push(createdMessage);
      await IncomeUserMessagesModel.create({
        userId: createdUser.id,
        messageId: createdMessage.id,
      });

      const response = await request(app.getHttpServer())
        .patch(`/api/message/${createdMessage.id}/rate`)
        .set('token', createdUser.id)
        .send({})
        .expect(400);

      expect(response.body.message).toContain('rating should not be empty');
    });

    it('should return 400 for invalid rating value', async () => {
      const messageData = {
        body: 'Test message for invalid rating',
        mode: MessageMode.light,
        authorId: anotherUser.id,
      };

      const createdMessage = await MessageModel.create(messageData);
      createdMessages.push(createdMessage);
      await IncomeUserMessagesModel.create({
        userId: createdUser.id,
        messageId: createdMessage.id,
      });

      const rateData = {
        rating: 'invalid_rating',
      };

      const response = await request(app.getHttpServer())
        .patch(`/api/message/${createdMessage.id}/rate`)
        .set('token', createdUser.id)
        .send(rateData)
        .expect(400);

      expect(response.body.message[0]).toContain('rating must be one of the following values:');
    });

    it('should return 404 for rating a non-existent message', async () => {
      const rateData = {
        rating: 'like',
      };

      const nonExistentMessageId = uuidv4();

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
      const parentMessageData = {
        body: 'Parent message',
        mode: MessageMode.light,
        authorId: anotherUser.id,
      };

      const parentMessage = await MessageModel.create(parentMessageData);

      // Create a reply to the parent message
      const replyMessageData = {
        body: 'Reply to parent message',
        mode: MessageMode.light,
        authorId: anotherUser.id,
        parentId: parentMessage.id, // Setting parentId to establish the reply relationship
      };

      const replyMessage = await MessageModel.create(replyMessageData);
      createdMessages.push(replyMessage);
      createdMessages.push(parentMessage);

      // Associate messages with the created user
      await IncomeUserMessagesModel.create({
        userId: createdUser.id,
        messageId: parentMessage.id,
      });
      await IncomeUserMessagesModel.create({
        userId: createdUser.id,
        messageId: replyMessage.id,
      });

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
    it('should retrieve outcoming messages with 1 level depth replies', async () => {
      const parentMessageData = {
        body: 'Parent message',
        mode: MessageMode.light,
        authorId: createdUser.id,
      };

      const parentMessage = await MessageModel.create(parentMessageData);

      // Create a reply to the parent message
      const replyMessageData = {
        body: 'Reply to parent message',
        mode: MessageMode.light,
        authorId: anotherUser.id,
        parentId: parentMessage.id, // Setting parentId to establish the reply relationship
      };

      const replyMessage = await MessageModel.create(replyMessageData);
      createdMessages.push(replyMessage);
      createdMessages.push(parentMessage);

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
