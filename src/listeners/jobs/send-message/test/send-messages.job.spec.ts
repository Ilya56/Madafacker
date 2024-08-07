import { Test, TestingModule } from '@nestjs/testing';
import { SendMessagesJob } from '@listeners';
import { DataServiceAbstract, Message, TaskServiceAbstract } from '@core';
import { SERVICES_PROVIDER } from '@utils/test-helpers';

describe('SendMessagesJob', () => {
  let sendMessagesJob: SendMessagesJob;
  let dataService: DataServiceAbstract;
  let taskService: TaskServiceAbstract;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SendMessagesJob, ...SERVICES_PROVIDER],
    }).compile();

    sendMessagesJob = module.get<SendMessagesJob>(SendMessagesJob);
    dataService = module.get<DataServiceAbstract>(DataServiceAbstract);
    taskService = module.get<TaskServiceAbstract>(TaskServiceAbstract);
  });

  it('should retrieve all messages and create tasks for each of them', async () => {
    const messages = [
      { id: '1', body: 'Test message 1' },
      { id: '2', body: 'Test message 2' },
    ] as Message[];

    jest.spyOn(dataService.messages, 'getNotSentMessages').mockResolvedValue(messages);
    jest.spyOn(taskService.sendMessage, 'addTask').mockImplementation();

    await sendMessagesJob.execute();

    expect(dataService.messages.getNotSentMessages).toHaveBeenCalled();
    expect(taskService.sendMessage.addTask).toHaveBeenCalledTimes(messages.length);
    for (const message of messages) {
      expect(taskService.sendMessage.addTask).toHaveBeenCalledWith(message);
    }
  });
});
