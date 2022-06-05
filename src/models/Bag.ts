import { Id, ModelOptions, QueryContext, RelationMappings } from 'objection';
import Base from './Base';
import { Cuboid } from './Cuboid';

export class Bag extends Base {
  id!: Id;
  volume!: number;
  title!: string;
  payloadVolume!: number;
  availableVolume!: number;
  cuboids?: Cuboid[] | undefined;

  static tableName = 'bags';

  static get relationMappings(): RelationMappings {
    return {
      cuboids: {
        relation: Base.HasManyRelation,
        modelClass: 'Cuboid',
        join: {
          from: 'bags.id',
          to: 'cuboids.bagId',
        },
      },
    };
  }
  updateVolume(): void {
    if (!this.cuboids) {
      return;
    }
    this.payloadVolume = this.cuboids.reduce(
      (volume: number, cuboid: Cuboid) => volume + cuboid.updateVolume(),
      0
    );
    this.availableVolume = this.volume - this.payloadVolume;
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
}

export default Bag;
