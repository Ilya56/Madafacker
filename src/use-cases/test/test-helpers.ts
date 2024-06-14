import { AlgoServiceAbstract, DataServiceAbstract, TaskServiceAbstract, UserServiceAbstract } from '@core';

/**
 * This variable is useful to create tests for a use cases
 * Can stub all services dependencies
 */
export const SERVICES_PROVIDER = [
  {
    provide: DataServiceAbstract,
    useValue: {
      users: {
        create: jest.fn(),
        update: jest.fn(),
        getById: jest.fn(),
        getRandomUserIds: jest.fn(),
        sendMessageToUsers: jest.fn(),
      },
      messages: {
        getById: jest.fn(),
        create: jest.fn(),
        getIncomingByUserId: jest.fn(),
      },
      replies: {
        create: jest.fn(),
        update: jest.fn(),
        getByIdWithPopulatedReplies: jest.fn(),
      },
      transactional: jest.fn().mockImplementation(async (fn: any) => fn()),
    },
  },
  {
    provide: UserServiceAbstract,
    useValue: {
      getCurrentUser: jest.fn(),
    },
  },
  {
    provide: AlgoServiceAbstract,
    useValue: {
      selectUsersShowMessage: jest.fn(),
    },
  },
  {
    provide: TaskServiceAbstract,
    useValue: {
      sendMessage: {
        addTask: jest.fn(),
      },
    },
  },
];
