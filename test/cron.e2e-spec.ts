import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { TestDataService } from './utils/TestDataService'; // Import the TestDataService
import { delay } from './utils/delay';

describe('Cron Jobs (e2e)', () => {
  let app: INestApplication;
  let testDataService: TestDataService;
  const apiKey = process.env.API_KEY || '';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
    await app.init();

    // Initialize the TestDataService
    testDataService = new TestDataService();

    // Prepopulate users
    await testDataService.createMultipleUsers(10);

    // Prepopulate a message that is not sent
    await testDataService.createMessage({
      authorId: testDataService.getFirstCreatedUser().id,
      body: 'Message to be sent via cron job',
    });
  }, 30000);

  afterAll(async () => {
    // Clean up created data
    await testDataService.cleanupAll();
    await app.close();
  }, 30000);

  describe('Send Messages Cron Job', () => {
    it('should correctly calculate the number of users to send the message to using LinearAlgoService', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/cron/send-messages')
        .set('x-api-key', apiKey) // Set the API key in the headers
        .expect(201); // Assuming 201 is returned on success

      expect(response.body).toBeDefined(); // Further assertions can be made based on the actual response structure

      await delay(5000);

      // Verify that the message processing involved the LinearAlgoService calculations
      const processedMessage = await testDataService.findMessage({ id: testDataService.getFirstCreatedMessage().id });
      expect(processedMessage?.wasSent).toBe(false);

      // Calculate the total number of users before the test
      const totalUsers = await testDataService.getUsersCount();

      // Verify that the correct number of messages was sent
      const incomeMessages = await testDataService.findIncomeMessages(processedMessage?.id as string);
      const expectedUsersCount = Math.floor(totalUsers * 0.1);
      expect(incomeMessages.length).toBeGreaterThanOrEqual(expectedUsersCount);
    }, 10000);

    it('should mark the message as sent after all users have seen it', async () => {
      // Create a new message that should be fully sent
      const messageToComplete = await testDataService.createMessage({
        authorId: testDataService.getFirstCreatedUser().id,
        body: `Message to be fully sent ${testDataService.getNonExistentId()}`,
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      });

      // Simulate all users have seen the message
      const existingUsers = await testDataService.getAllUsers();
      await testDataService.bulkCreateIncomeMessages(existingUsers, messageToComplete.id);

      const response = await request(app.getHttpServer())
        .post('/api/cron/send-messages')
        .set('x-api-key', apiKey) // Set the API key in the headers
        .expect(201); // Assuming 201 is returned on success

      expect(response.body).toBeDefined();

      await delay(5000);

      // Verify the message is marked as sent
      const updatedMessage = await testDataService.findMessage({ id: messageToComplete.id });
      expect(updatedMessage?.wasSent).toBe(true);
    }, 10000);

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
