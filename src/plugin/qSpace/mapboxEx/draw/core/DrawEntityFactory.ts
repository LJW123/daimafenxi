import { EntityModel } from '../../../core';
import DrawCore from './DrawCore';
import entityList from './entityList';
class DrawEntityFactory {
  map: any;

  constructor(map: any) {
    this.map = map;
  }

  createDrawEntity(
    drawName: string,
    style: object = {},
    opts: object = {},
  ): DrawCore | null {
    const factory: EntityModel | undefined = entityList.find(
      (it: any) => it.name === drawName,
    );

    const _style = style ? style : {};
    if (factory) {
      const entity: DrawCore = new factory.qEntity(
        this.map,
        factory,
        _style,
        opts,
      );
      return entity;
    }
    return null;
  }
}

export default DrawEntityFactory;
