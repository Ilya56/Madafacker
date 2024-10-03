import { InvalidNotifyServiceTokenException, NotifyServiceAbstract } from '@core';
import { Injectable, Logger } from '@nestjs/common';
import { initializeApp, messaging } from 'firebase-admin';
import Messaging = messaging.Messaging;
import { ConfigService } from '@nestjs/config';
import { ConfigType } from '@config';

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
   * @param configService
   */
  constructor(private configService: ConfigService) {
    super();

    const config = this.configService.get<ConfigType['firebase']>('firebase');
    this.fcm = initializeApp(config).messaging();

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
}
