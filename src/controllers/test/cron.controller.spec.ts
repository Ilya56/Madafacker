import { Test, TestingModule } from '@nestjs/testing';
import { CronController } from '../cron.controller';
import { SendMessagesJob } from '@listeners';

describe('CronController', () => {
  let cronController: CronController;
  let sendMessagesJob: SendMessagesJob;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CronController],
      providers: [
        {
          provide: SendMessagesJob,
          useValue: {
            execute: jest.fn(),
          },
        },
      ],
    }).compile();

    cronController = module.get<CronController>(CronController);
    sendMessagesJob = module.get<SendMessagesJob>(SendMessagesJob);
  });

  describe('sendMessages', () => {
    it('should call execute on SendMessagesJob', async () => {
      const executeSpy = jest.spyOn(sendMessagesJob, 'execute').mockResolvedValue();

      await cronController.sendMessages();

      expect(executeSpy).toHaveBeenCalled();
    });
  });
});
