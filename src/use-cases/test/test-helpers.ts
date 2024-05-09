import { DataServiceAbstract, UserServiceAbstract } from '@core';

export const SERVICES_PROVIDER = [
  {
    provide: DataServiceAbstract,
    useValue: {
      users: {
        create: jest.fn(),
        update: jest.fn(),
        getById: jest.fn(),
      },
    },
  },
  {
    provide: UserServiceAbstract,
    useValue: {
      getCurrentUser: jest.fn(),
    },
  },
];
