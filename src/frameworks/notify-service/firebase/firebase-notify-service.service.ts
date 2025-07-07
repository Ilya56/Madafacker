import { InvalidNotifyServiceTokenException, NotifyServiceAbstract, TokenExpiredException } from '@core';
import { Inject, Injectable } from '@nestjs/common';
import * as firebase from 'firebase-admin';
import Messaging = firebase.messaging.Messaging;
import { ErrorCodes } from '@frameworks/notify-service/firebase/error-codes.enum';
import { FIREBASE_MESSAGING } from '@frameworks/firebase-module';

/**
 * This class provides firebase possibilities as a notification system
 */
@Injectable()
export class FirebaseNotifyServiceService extends NotifyServiceAbstract {
  /**
   * Creates new instance of the Firebase notify service using config service to configure it
   * If isFirebaseEnabled is false, mocked class is used instead of real FCM
   * Real value exists if no FIREBASE_ENABLED in envs or FIREBASE_ENABLED is true
   * @param fcm Firebase messaging service
   */
  constructor(@Inject(FIREBASE_MESSAGING) private fcm: Messaging) {
    super();
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
      if (err.code === ErrorCodes.INVALID_TOKEN_ERROR_CODE) {
        throw new InvalidNotifyServiceTokenException('Cannot send notification', token);
      }

      if (err.code === ErrorCodes.TOKEN_NOT_REGISTERED_ERROR_CODE) {
        throw new TokenExpiredException('Token was expired or app was removed', token);
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
