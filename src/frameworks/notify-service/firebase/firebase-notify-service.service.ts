import { InvalidNotifyServiceTokenException, NotifyServiceAbstract } from '@core';
import { Injectable, Logger } from '@nestjs/common';
import * as firebase from 'firebase-admin';
import Messaging = firebase.messaging.Messaging;
import { ConfigService } from '@nestjs/config';
import { ConfigType } from '@config';
import { FirebaseAdminMock } from '@frameworks/notify-service/firebase/mocks/firebase-admin.mock';

/**
 * Firebase error code
 */
const INVALID_TOKEN_ERROR_CODE = 'messaging/invalid-argument';

/**
 * This class provides firebase possibilities as a notification system
 */
@Injectable()
export class FirebaseNotifyServiceService extends NotifyServiceAbstract {
  /** Firebase Messaging Module instance */
  private readonly fcm: Messaging;
  /** Logger */
  private readonly logger: Logger;

  /**
   * Creates new instance of the Firebase notify service using config service to configure it
   * If isFirebaseEnabled is false, mocked class is used instead of real FCM
   * Real value exists if no FIREBASE_ENABLED in envs or FIREBASE_ENABLED is true
   * @param configService nestjs config service
   */
  constructor(private configService: ConfigService) {
    super();

    const config = this.configService.get<ConfigType['firebase']>('firebase');

    if (!config || !config.isFirebaseEnabled) {
      this.fcm = new FirebaseAdminMock().messaging();
    } else {
      const app = firebase.initializeApp({
        credential: firebase.credential.cert(config),
      });
      this.fcm = app.messaging();
    }

    this.logger = new Logger(FirebaseNotifyServiceService.name);
  }

  /**
   * Notify user about something.
   * In case of error it can separate some issues in specific errors
   * @param token unique user token to identify user
   * @param message message to send
   */
  public async notify(token: string, message: string): Promise<void> {
    try {
      await this.fcm.send({ token, data: { message }, notification: { title: message } });
    } catch (err) {
      if (err.code === INVALID_TOKEN_ERROR_CODE) {
        throw new InvalidNotifyServiceTokenException('Cannot send notification', token);
      }

      throw err;
    }
  }

  /**
   * Verifies that provided token is valid and can be used to send notification to the user
   * @param token token to check
   */
  public async verifyToken(token: string): Promise<boolean> {
    try {
      await this.fcm.send({ token }, true);
      return true;
    } catch (e) {
      return false;
    }
  }
}
