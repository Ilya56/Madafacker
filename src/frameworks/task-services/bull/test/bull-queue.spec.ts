import { BullQueue } from '../bull-queue';
import Bull, { Queue } from 'bull';
import { ConfigService } from '@nestjs/config';
import { ConfigType } from '@config';

jest.mock('bull');
jest.mock('@nestjs/config');

describe('BullQueue', () => {
  let bullQueue: BullQueue<any>;
  let queueMock: Queue;
  let configServiceMock: ConfigService;

  beforeEach(() => {
    // Mock the Bull Queue constructor and methods
    queueMock = {
      add: jest.fn(),
      process: jest.fn(),
    } as unknown as Queue;

    (Bull as jest.Mock).mockImplementation(() => queueMock);

    // Mock ConfigService
    configServiceMock = {
      get: jest.fn().mockReturnValue({
        host: 'localhost',
        port: 6379,
      } as ConfigType['redis']),
    } as unknown as ConfigService;

    // Instantiate the BullQueue with the mocked ConfigService and Bull Queue
    bullQueue = new BullQueue(configServiceMock, 'testQueue');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should add a task to the queue', async () => {
    const taskData = { foo: 'bar' };

    await bullQueue.addTask(taskData);

    expect(queueMock.add).toHaveBeenCalledWith(taskData);
  });

  it('should process the queue with the given processor', async () => {
    const processor = jest.fn();

    await bullQueue.processQueue(processor);

    expect(queueMock.process).toHaveBeenCalledWith(expect.any(Function));

    // Simulate a job being processed
    const job = { data: { foo: 'bar' } };
    const processFunction = (queueMock.process as jest.Mock).mock.calls[0][0];
    await processFunction(job);

    expect(processor).toHaveBeenCalledWith(job.data);
  });
});
