import {
  AlgoServiceAbstract,
  DataServiceAbstract,
  NotifyServiceAbstract,
  TaskServiceAbstract,
  UserServiceAbstract,
} from '@core';

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
        addCoins: jest.fn(),
        getByName: jest.fn(),
        markTokensAsInvalid: jest.fn(),
      },
      messages: {
        getById: jest.fn(),
        create: jest.fn(),
        getIncomingByUserId: jest.fn(),
        markAsSent: jest.fn(),
        getNotSentMessages: jest.fn(),
        getByIdWithAuthor: jest.fn(),
      },
      replies: {
        create: jest.fn(),
        update: jest.fn(),
        getByIdWithPopulatedReplies: jest.fn(),
      },
      incomeUserMessage: {
        getUserMessageRating: jest.fn(),
        rateMessage: jest.fn(),
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
  {
    provide: NotifyServiceAbstract,
    useValue: {
      notify: jest.fn(),
      verifyToken: jest.fn(),
    },
  },
];
