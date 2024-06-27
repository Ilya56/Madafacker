import { SetMetadata } from '@nestjs/common';

/**
 * API key controller meta key
 */
export const IS_API_KEY = 'isApiKey';

/**
 * Api key metadata type
 */
export type ApiKeyData = {
  apiKeyValue?: string;
};

/**
 * Sets controller as available by api key. That should allow using route with only an api key.
 * @param [apiKeyValue] you can provide specific key if you need. By default, config.apiKey value should be used
 * @constructor
 */
export const ApiKey = (apiKeyValue?: string) => SetMetadata(IS_API_KEY, { apiKeyValue });
