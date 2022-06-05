import { Knex } from 'knex';
import { Bag, Cuboid } from '../../src/models';

export const up = (knex: Knex): Promise<void> =>
  knex.schema.createTable(Cuboid.tableName, (table: Knex.TableBuilder) => {
    table.increments();
    table.timestamps();
    table.integer('width');
    table.integer('height');
    table.integer('depth');
    table.integer('bagId');
    table.foreign('bagId').references('id').inTable(Bag.tableName);
    table.integer('volume');
  });

export const down = (knex: Knex): Promise<void> =>
  knex.schema.dropTable(Cuboid.tableName);
