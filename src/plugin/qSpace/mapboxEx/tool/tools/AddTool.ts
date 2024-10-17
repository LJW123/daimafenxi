import BaseTool from '../BaseTool';
import { getQMap, DrawCore } from '../../../core';

class AddTool extends BaseTool {
  drawEntity: DrawCore | null = null;
  constructor() {
    super();
  }

  leftClickEvent(eve: any) {
    let pt = [eve.lngLat.lng, eve.lngLat.lat];
    if (this.drawEntity == null) {
      let style = this.opts.style || {};
      this.drawEntity = this.createDrawbase(style);
      if (this.drawEntity) {
        let drawCollection = getQMap()?.getDrawCollection();
        drawCollection?.addEntity(this.drawEntity);
      }
    }

    this.drawEntity?.addPoint(pt);
    this.drawEntity?.setUpdateState('geojson');
    if (this.drawEntity && this.drawEntity.isComplete()) this.complete();
  }
  rightClickEvent(eve: any) {
    eve.originalEvent.preventDefault();
    let pt = [eve.lngLat.lng, eve.lngLat.lat];
    this.drawEntity?.addPoint(pt);
    this.complete();
    return false;
  }
  mouseMoveEvent(eve: any) {
    let pt = [eve.lngLat.lng, eve.lngLat.lat];
    if (this.drawEntity && this.drawEntity.setTemporaryCoord && pt) {
      this.drawEntity.setTemporaryCoord(pt);
      this.drawEntity?.setUpdateState('geojson');
    }
  }
  complete() {
    if (this.drawEntity) {
      this.drawEntity?.complete();
      const featureKey = this.drawEntity.getFeatureKey();
      if (this.opts.fn) {
        this.opts.fn(featureKey);
      }

      this.drawComplete(featureKey);

      this.drawEntity = null;
      getQMap()?.disableTool();
    }
  }

  drawComplete(key: string) {
    const drawCollection = getQMap()?.getDrawCollection();
    if (drawCollection) {
      const entity = drawCollection.getEntity(key);
      if (entity) {
        getQMap()?.Evented.fire('drawCompleteEntity', { data: entity });
      }
    }
  }
  disable() {
    this.unBindEvent();
    if (this.drawEntity) {
      this.drawEntity?.complete();
      this.drawEntity?.remove();
      this.drawEntity = null;
    }
  }
}

export default AddTool;
