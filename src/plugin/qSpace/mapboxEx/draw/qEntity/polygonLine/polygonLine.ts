import { EntityModel } from '../../../../core';
import DrawLineString from '../linestring/lineString';

class DrawPolygonLine extends DrawLineString {
  constructor(
    map: any,
    factory: EntityModel,
    style: object = {},
    opts: object = {},
  ) {
    super(map, factory, style, opts);
  }
}

export default DrawPolygonLine;
