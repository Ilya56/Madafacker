import { NotifyServiceAbstract } from '@core';
import { Injectable } from '@nestjs/common';
import { initializeApp, messaging } from 'firebase-admin';
import Messaging = messaging.Messaging;
import { ConfigService } from '@nestjs/config';
import { ConfigType } from '@config';

/**
 * This class provides firebase possibilities as a notification system
 */
@Injectable()
export class FirebaseNotifyServiceService extends NotifyServiceAbstract {
  private readonly fcm: Messaging;

  constructor(private configService: ConfigService) {
    super();
    const config = this.configService.get<ConfigType['firebase']>('firebase');
    this.fcm = initializeApp(config).messaging();
  }

  /**
   * Notify user about something
   * @param token unique user token to identify user
   * @param message message to send
   */
  public async notify(token: string, message: string): Promise<void> {
    try {
      await this.fcm.send({ token, data: { message }, notification: { title: message } });
    } catch (err) {
      throw err;
    }
  }
}
