import { Test, TestingModule } from '@nestjs/testing';
import { SendMessageListener } from '../send-message.listener';
import { TaskServiceAbstract, Message, User, ConvertObjectsToStringType } from '@core';
import { SendMessageUseCase } from '@use-cases/message';

describe('SendMessageListener', () => {
  let listener: SendMessageListener;
  let taskService: TaskServiceAbstract;
  let sendMessageUseCase: SendMessageUseCase;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SendMessageListener,
        {
          provide: TaskServiceAbstract,
          useValue: {
            sendMessage: {
              processQueue: jest.fn(),
            },
          },
        },
        {
          provide: SendMessageUseCase,
          useValue: {
            execute: jest.fn().mockResolvedValue(undefined),
          },
        },
      ],
    }).compile();

    listener = module.get<SendMessageListener>(SendMessageListener);
    taskService = module.get<TaskServiceAbstract>(TaskServiceAbstract);
    sendMessageUseCase = module.get<SendMessageUseCase>(SendMessageUseCase);
  });

  describe('subscribe', () => {
    it('should subscribe to the task service send message queue and process messages', () => {
      const bullMessage: ConvertObjectsToStringType<Message> = {
        id: '1',
        body: 'Test message',
        mode: 'light',
        wasSent: false,
        createdAt: '2023-01-01T00:00:00.000Z',
        author: {
          id: 'user1',
          name: 'Author Name',
          outcomeMessages: [],
          incomeMessages: [],
          coins: 0,
          registrationToken: '',
        },
      };

      jest.spyOn(taskService.sendMessage, 'processQueue').mockImplementation((callback) => {
        callback(bullMessage);
      });

      listener['subscribe']();

      expect(taskService.sendMessage.processQueue).toHaveBeenCalled();
      expect(sendMessageUseCase.execute).toHaveBeenCalledWith(listener['prepareMessage'](bullMessage));
    });
  });

  describe('prepareMessage', () => {
    it('should transform string date fields into Date objects and handle nested objects', () => {
      const bullMessage: ConvertObjectsToStringType<Message> = {
        id: '1',
        body: 'Test message',
        mode: 'light',
        wasSent: false,
        createdAt: '2023-01-01T00:00:00.000Z',
        author: {
          id: 'user1',
          name: 'Author Name',
          coins: 0,
          registrationToken: '',
          outcomeMessages: [
            {
              id: '2',
              body: 'Nested message 1',
              mode: 'dark',
              wasSent: true,
              createdAt: '2023-01-02T00:00:00.000Z',
              author: {} as ConvertObjectsToStringType<User>,
            },
          ],
          incomeMessages: [
            {
              id: '3',
              body: 'Nested message 2',
              mode: 'light',
              wasSent: false,
              createdAt: '2023-01-03T00:00:00.000Z',
              author: {} as ConvertObjectsToStringType<User>,
            },
          ],
        },
      };

      const result = listener['prepareMessage'](bullMessage);

      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.createdAt.toISOString()).toBe('2023-01-01T00:00:00.000Z');
      expect(result.author.id).toBe('user1');
      expect(result.author.name).toBe('Author Name');
      expect(result.author.outcomeMessages[0].createdAt).toBeInstanceOf(Date);
      expect(result.author.outcomeMessages[0].createdAt.toISOString()).toBe('2023-01-02T00:00:00.000Z');
      expect(result.author.incomeMessages[0].createdAt).toBeInstanceOf(Date);
      expect(result.author.incomeMessages[0].createdAt.toISOString()).toBe('2023-01-03T00:00:00.000Z');
    });
  });
});
