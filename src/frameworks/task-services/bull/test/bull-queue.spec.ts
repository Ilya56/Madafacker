import { BullQueue } from '../bull-queue';
import Bull, { Queue } from 'bull';

jest.mock('bull');

describe('BullQueue', () => {
  let bullQueue: BullQueue<any>;
  let queueMock: Queue<any>;

  beforeEach(() => {
    // Mock the Bull Queue constructor and methods
    queueMock = {
      add: jest.fn(),
      process: jest.fn(),
    } as unknown as Queue<any>;

    (Bull as jest.Mock).mockImplementation(() => queueMock);

    // Instantiate the BullQueue with the mocked Bull Queue
    bullQueue = new BullQueue('testQueue');
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
