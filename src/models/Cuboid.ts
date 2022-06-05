import { Id, ModelOptions, QueryContext, RelationMappings } from 'objection';
import { Bag } from './Bag';
import Base from './Base';

export class Cuboid extends Base {
  id!: Id;
  width!: number;
  height!: number;
  depth!: number;
  bagId?: Id;
  bag!: Bag;
  volume!: number;

  static tableName = 'cuboids';

  static get relationMappings(): RelationMappings {
    return {
      bag: {
        relation: Base.BelongsToOneRelation,
        modelClass: 'Bag',
        join: {
          from: 'cuboids.bagId',
          to: 'bags.id',
        },
      },
    };
  }

  updateVolume(): number {
    this.volume = this.width * this.height * this.depth;
    return this.volume;
  }
  async $beforeInsert(queryContext: QueryContext): Promise<void> {
    await super.$beforeInsert(queryContext);
    this.updateVolume();
  }

  async $beforeUpdate(
    opt: ModelOptions,
    queryContext: QueryContext
  ): Promise<void> {
    await super.$beforeUpdate(opt, queryContext);
    this.updateVolume();
  }

  async updateBagVolume(): Promise<void> {
    const bag = (await Bag.query()
      .findById(this.bagId as Id)
      .forUpdate()
      .withGraphFetched('cuboids')) as Bag;
    bag.updateVolume();
    await bag.$query().update();
  }

  async $afterInsert(queryContext: QueryContext): Promise<void> {
    await super.$afterInsert(queryContext);
    await this.updateBagVolume();
  }
}

export default Cuboid;
