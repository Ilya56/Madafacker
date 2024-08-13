import { Message, TaskServiceAbstract } from '@core';
import { BullQueue } from './bull-queue';
import { Injectable, OnApplicationShutdown } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * Implementation of the task service using bull lib
 */
@Injectable()
export class BullTaskServices extends TaskServiceAbstract implements OnApplicationShutdown {
  /**
   * System queues list
   */
  public sendMessage: BullQueue<Message>;

  /**
   * Constructor to init queues
   */
  constructor(private configService: ConfigService) {
    super();
    this.sendMessage = new BullQueue<Message>(this.configService, 'sendMessage');
  }

  /**
   * It should listen for application shutdown to close all queues to allow app be closed properly
   */
  async onApplicationShutdown() {
    await this.sendMessage.close();
  }
}
