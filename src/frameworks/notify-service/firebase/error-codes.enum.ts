/**
 * Firebase error codes enum
 */
export enum ErrorCodes {
  /**
   * An invalid argument was provided to an FCM method. The error message should contain additional information.
   */
  INVALID_TOKEN_ERROR_CODE = 'messaging/invalid-argument',
  /**
   * The provided registration token is not registered. A previously valid registration token can be unregistered for a variety of reasons, including:
   * - The client app unregistered itself from FCM.
   * - The client app was automatically unregistered. This can happen if the user uninstalls the application or, on Apple platforms, if the APNs Feedback Service reported the APNs token as invalid.
   * - The registration token expired. For example, Google might decide to refresh registration tokens or the APNs token may have expired for Apple devices.
   * - The client app was updated, but the new version is not configured to receive messages.
   * For all these cases, remove this registration token and stop using it to send messages.
   */
  TOKEN_NOT_REGISTERED_ERROR_CODE = 'messaging/registration-token-not-registered',
}
