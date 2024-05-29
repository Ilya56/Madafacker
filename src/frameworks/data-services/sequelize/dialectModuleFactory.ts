import { Dialect } from 'sequelize/types/sequelize';

/**
 * Returns
 * @param name
 */
export function getDialectPackageByName(name?: Dialect): any {
  if (name === 'postgres') {
    return require('pg');
  }
}
