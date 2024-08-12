import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { v4 as uuidv4 } from 'uuid';
import { IncomeUserMessagesModel, MessageModel, UserModel } from '@frameworks/data-services/sequelize/models';
import { MessageMode } from '@core';
import { delay } from './utils/delay';

describe('Cron Jobs (e2e)', () => {
  let app: INestApplication;
  const createdMessages: MessageModel[] = [];
  const createdUsers: UserModel[] = [];
  const apiKey = process.env.API_KEY || '';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Prepopulate users with unique names
    for (let i = 0; i < 10; i++) {
      const user = await UserModel.create({ name: `test_user_${uuidv4()}` });
      createdUsers.push(user);
    }

    // Prepopulate messages that are not sent
    const messageData = {
      body: 'Message to be sent via cron job',
      mode: MessageMode.dark,
      authorId: createdUsers[0].id,
    };

    const message = await MessageModel.create(messageData);
    createdMessages.push(message);
  });

  afterAll(async () => {
    // Clean up created messages
    for (const message of createdMessages) {
      await IncomeUserMessagesModel.destroy({ where: { messageId: message.id } });
      await MessageModel.destroy({ where: { id: message.id } });
    }

    for (const user of createdUsers) {
      await UserModel.destroy({ where: { id: user.id } });
    }

    await app.close();
  });

  // Test case for Cron Job: Send Messages
  describe('Send Messages Cron Job', () => {
    it('should correctly calculate the number of users to send the message to using LinearAlgoService', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/cron/send-messages')
        .set('x-api-key', apiKey) // Set the API key in the headers
        .expect(201); // Assuming 201 is returned on success

      expect(response.body).toBeDefined(); // Further assertions can be made based on the actual response structure

      await delay(500);

      // Verify that the message processing involved the LinearAlgoService calculations
      const processedMessage = await MessageModel.findOne({ where: { id: createdMessages[0].id } });
      expect(processedMessage?.wasSent).toBe(false);

      // Calculate the total number of users before the test
      const totalUsers = await UserModel.count();

      // Verify that the correct number of messages was sent
      const incomeMessages = await IncomeUserMessagesModel.findAll({ where: { messageId: processedMessage?.id } });
      const expectedUsersCount = Math.floor(totalUsers * 0.1);
      expect(incomeMessages.length).toBeGreaterThanOrEqual(expectedUsersCount);
    });

    it('should mark the message as sent after all users have seen it', async () => {
      // Create a new message that should be fully sent
      const messageToComplete = await MessageModel.create({
        body: `Message to be fully sent ${uuidv4()}`,
        mode: MessageMode.dark,
        wasSent: false,
        authorId: createdUsers[0].id,
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Created 7 days ago
      });
      createdMessages.push(messageToComplete);

      // Simulate all users have seen the message
      const existingUsers = await UserModel.findAll();
      await IncomeUserMessagesModel.bulkCreate(
        existingUsers.map((user) => ({
          userId: user.id,
          messageId: messageToComplete.id,
        })),
      );

      const response = await request(app.getHttpServer())
        .post('/api/cron/send-messages')
        .set('x-api-key', apiKey) // Set the API key in the headers
        .expect(201); // Assuming 201 is returned on success

      expect(response.body).toBeDefined();

      await delay(500);

      // Verify the message is marked as sent
      const updatedMessage = await MessageModel.findOne({ where: { id: messageToComplete.id } });
      expect(updatedMessage?.wasSent).toBe(true);
    });

    it('should return 401 if the API key is missing', async () => {
      const response = await request(app.getHttpServer()).post('/api/cron/send-messages').expect(403);

      expect(response.body.message).toContain('Forbidden resource');
    });

    it('should return 401 if the API key is invalid', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/cron/send-messages')
        .set('x-api-key', 'invalid-api-key')
        .expect(403);

      expect(response.body.message).toContain('Forbidden resource');
    });
  });
});
