import * as turf from '@turf/turf';

import DrawCore from '../../core/DrawCore';
import { EntityModel } from '../../../../core';

class ModelCore extends DrawCore {
  entityType: string = 'model';
  constructor(
    map: any,
    factory: EntityModel,
    style: object = {},
    opts: object = {},
  ) {
    super(map, factory, style, opts);
    this.controlPointHasMid = false;
  }
  // 添加图层
  addLayer() {
    this.createModelLayer();
    this.updateNoteLayer();
    if (this.controlPointLayer) this.controlPointLayer.moveLayer();
  }
  updateData() {
    let geojson = this.getGeojson();
    this.updateLayers('', '');
    this.updateSource(geojson);
    if (this.controlPointLayer) {
      let ctrlPointList = this.qGeometry?.createCtrlPoint(
        this.controlPointHasMid,
        this.featureKey,
      );
      this.controlPointLayer.createCtrlPt(ctrlPointList);
    }
    if (!this.ready) {
      this.ready = true;
      this.addLayer();
    }
  }
  // 刷新 数据源
  updateSource(geojson: any = null) {
    if (!this.map) return;
    let allid = this.getAllId();
    let stid = allid.stid;
    this.textLayer.updateData(geojson, stid);
    if (geojson) {
      const centroid = turf.centroid(geojson);
      const center: number[] = turf.getCoord(centroid);
      if (center == null) return;
      this.labelLayer.updateData(center);
    }
  }
  createModelLayer() {}

  isComplete() {
    return true;
  }
}

export default ModelCore;
