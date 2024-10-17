import { EntityModel } from '../../../../core';
import DrawLineString from '../linestring/lineString';

class BaseArrow extends DrawLineString {
  entityType: string = 'arrow';

  constructor(
    map: any,
    factory: EntityModel,
    style: object = {},
    opts: object = {},
  ) {
    super(map, factory, style, opts);
    this.controlPointHasMid = false;
  }
}

export default BaseArrow;
