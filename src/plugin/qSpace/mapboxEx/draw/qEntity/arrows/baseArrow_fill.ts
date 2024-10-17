import { EntityModel } from '../../../../core';
import DrawPolygon from '../polygon/polygon';

class BaseArrow extends DrawPolygon {
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
