import { ClsStore } from 'nestjs-cls';
import { User } from '@core';

/**
 * Describes what type of the data is stored in the CLS service
 */
export interface ClsData extends ClsStore {
  /**
   * Current user in the scope of the request
   */
  user: User;
}
