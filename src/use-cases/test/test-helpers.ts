import { AlgoServiceAbstract, DataServiceAbstract, UserServiceAbstract } from '@core';

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
        create: jest.fn(),
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
];
