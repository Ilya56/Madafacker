import { Message } from 'firebase-admin/lib/messaging/messaging-api';

/**
 * Firebase message cloud mock, useful in e2e tests
 */
export class FirebaseAdminMessagingMock {
  /**
   * This method throws an error about invalid token if token is 'invalid-token'
   * Otherwise it returns 'ok' string
   * @param message message object you want to send, only token field is used in it
   */
  async send(message: Message): Promise<string> {
    const tokenMessage = message as { token: string };
    if (tokenMessage.token.includes('invalid-token')) {
      throw {
        code: 'messaging/invalid-argument',
      };
    }
    if (tokenMessage.token.includes('error')) {
      throw new Error('MOCK ERROR');
    }
    return 'ok';
  }
}
