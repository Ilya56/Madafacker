export const VALID_TOKEN = 'valid_token';
export const REVOKED_TOKEN = 'revoked_token';
export const NO_USER_TOKEN = 'no_user_token';
export const USER_ID = 'authProviderId';

/**
 * Firebase auth mock, useful in e2e tests
 */
export class FirebaseAdminAuthMock {
  /**
   * This method check is token equal to `VALID_TOKEN` value. If true - returns object with uid=1
   * If false - throw an error
   * Also, if you need to check revoked token - use `REVOKED_TOKEN` and set `checkRevoked` true
   */
  async verifyIdToken(idToken: string, checkRevoked?: boolean): Promise<{ uid: string }> {
    if (idToken === VALID_TOKEN) {
      return { uid: USER_ID };
    } else if (idToken === NO_USER_TOKEN) {
      return { uid: 'non-existence-id' };
    } else if (idToken === REVOKED_TOKEN && checkRevoked) {
      throw new Error('MOCK token revoked auth error');
    } else {
      throw new Error('MOCK invalid token auth error');
    }
  }
}
