import { DataServiceAbstract, UserServiceAbstract } from '@core';
import { Inject } from '@nestjs/common';
import { Transactional } from 'sequelize-transactional-decorator';

/**
 * Command options.
 */
type CommandOptions = {
  noTransaction: boolean;
};

/**
 * This class is an abstraction of any command operation.
 * It should be extended by any use case that *is changes* system state
 */
export abstract class CommandAbstract<I, O> {
  /**
   * Use transaction mark service to cover all operations in the transaction. It's enabled by default
   */
  public readonly useTransaction: boolean;

  /**
   * Inject services to work with
   * @protected
   */
  @Inject()
  protected dataService: DataServiceAbstract;
  @Inject()
  protected userService: UserServiceAbstract;

  /**
   * Constructor is created to change options if needed
   * @param [options] command settings
   * @protected
   */
  public constructor(options?: CommandOptions) {
    this.useTransaction = !options?.noTransaction ?? true;
  }

  /**
   * Run this command when use a use case.
   * Is run in transaction if useTransaction is true
   * @param input command input data
   */
  public async execute(input: I): Promise<O> {
    if (this.useTransaction) {
      return this.transactionalCall(input);
    }

    return this.implementation(input);
  }

  /**
   * Implement this method when extend a command in the use case
   * @param input input data
   * @protected
   */
  protected abstract implementation(input: I): Promise<O> | O;

  /**
   * Is used to run implementation in the one transaction without additional impact on the code
   * @param input
   * @private
   */
  @Transactional()
  private transactionalCall(input: I) {
    return this.implementation(input);
  }
}
