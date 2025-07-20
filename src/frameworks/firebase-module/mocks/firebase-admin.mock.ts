import { AppOptions, messaging, auth } from 'firebase-admin';
import { App } from 'firebase-admin/lib/app';
import { FirebaseAdminMessagingMock } from './firebase-admin-messaging.mock';
import { FirebaseAdminAuthMock } from './firebase-admin-auth.mock';

/**
 * Firebase abstract class that implements App interface with only used methods + fields
 */
export abstract class FirebaseAdminApp implements App {
  messaging(): messaging.Messaging {
    return new FirebaseAdminMessagingMock() as messaging.Messaging;
  }
  auth(): auth.Auth {
    return new FirebaseAdminAuthMock() as unknown as auth.Auth;
  }
  name: string;
  options: AppOptions;
}

/**
 * Firebase mock that can be used instead of real Firebase
 */
export class FirebaseAdminMock extends FirebaseAdminApp {}
