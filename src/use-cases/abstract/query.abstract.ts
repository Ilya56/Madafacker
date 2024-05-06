import { DataServiceAbstract } from '@core';
import { Inject } from '@nestjs/common';
import { UserServiceAbstract } from '../../core/absctract/user-service.abstract';

/**
 * This class is an abstraction of any query operation.
 * It should be extended by any use case that is not changes system state
 */
export abstract class QueryAbstract<I, O> {
  @Inject()
  protected dataService: DataServiceAbstract;

  @Inject()
  protected userService: UserServiceAbstract;

  /**
   * Run this command when use a use case
   * @param input input data
   */
  public async execute(input: I): Promise<O> {
    return this.implementation(input);
  }

  /**
   * Implement this method when extend a query in the use case
   * @param input input data
   * @protected
   */
  protected abstract implementation(input: I): Promise<O> | O;
}
