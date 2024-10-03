import { AppOptions, messaging } from 'firebase-admin';
import { App } from 'firebase-admin/lib/app';
import { FirebaseAdminMessagingMock } from './firebase-admin-messaging.mock';

/**
 * Firebase abstract class that implements App interface with only used methods + fields
 */
export abstract class FirebaseAdminApp implements App {
  messaging(): messaging.Messaging {
    return new FirebaseAdminMessagingMock() as messaging.Messaging;
  }
  name: string;
  options: AppOptions;
}

/**
 * Firebase mock that can be used instead of real Firebase
 */
export class FirebaseAdminMock extends FirebaseAdminApp {}
