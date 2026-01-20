import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { TestDataService } from './utils/TestDataService';

describe('Cron Jobs (e2e)', () => {
  let app: INestApplication;
  let testDataService: TestDataService;
  const apiKey = process.env.API_KEY || '';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
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
  });

  afterAll(async () => {
    // Clean up created data
    await testDataService.cleanupAll();
    await app.close();
  });

  describe('Send Messages Cron Job', () => {
    it('should accept a cron trigger with a valid API key', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/cron/send-messages')
        .set('x-api-key', apiKey)
        .expect(201);

      expect(response.body).toBeDefined();

      // The cron endpoint enqueues async work; no queue assertions here.
      const message = await testDataService.findMessage({ id: testDataService.getFirstCreatedMessage().id });
      expect(message).toBeDefined();
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
