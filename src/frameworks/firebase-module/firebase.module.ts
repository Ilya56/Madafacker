import { DynamicModule, Module } from '@nestjs/common';
import * as firebase from 'firebase-admin';
import { getApp, getApps } from 'firebase-admin/app';
import { ConfigType } from '@config';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { FirebaseAdminMock } from './mocks';
import App = firebase.app.App;

/**
 * Firebase DI keys
 */
export const FIREBASE_MESSAGING = Symbol('FIREBASE_MESSAGING');
export const FIREBASE_AUTH = Symbol('FIREBASE_AUTH');
export const FIREBASE_ROOT = Symbol('FIREBASE_ROOT');

/**
 * This module provides firebase services in Nest.js DI. It can mock Firebase services if Firebase is disabled for development
 */
@Module({})
export class FirebaseModule {
  static forRootAsync(): DynamicModule {
    return {
      module: FirebaseModule,
      imports: [ConfigModule],
      providers: [
        {
          provide: FIREBASE_ROOT,
          useFactory: (configService: ConfigService) => {
            const config = configService.get<ConfigType['firebase']>('firebase');
            if (!config || !config.isFirebaseEnabled) {
              return new FirebaseAdminMock();
            } else {
              return getApps().length
                ? getApp()
                : firebase.initializeApp({
                    credential: firebase.credential.cert(config),
                  });
            }
          },
          inject: [ConfigService],
        },
        {
          provide: FIREBASE_MESSAGING,
          useFactory: (app: App) => app.messaging(),
          inject: [FIREBASE_ROOT],
        },
        {
          provide: FIREBASE_AUTH,
          useFactory: (app: App) => app.auth(),
          inject: [FIREBASE_ROOT],
        },
      ],
      exports: [FIREBASE_MESSAGING, FIREBASE_AUTH],
    };
  }
}
