import * as turf from '@turf/turf';
import * as mt3d from '../../../../../../mt3d/index';
import { getQMap, EntityModel } from '../../../../../../core';
import DrawLineString from '../../../linestring/lineString';
import ModelCore from '../../../threeModels/modelCore';

const { Color } = THREE;
class DrawWaterPolygon extends DrawLineString {
  customLayer: CustomLayer | null = null;

  constructor(
    map: any,
    factory: EntityModel,
    style: object = {},
    opts: object = {},
  ) {
    super(map, factory, style, opts);
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
  // 完成 结束
  complete() {
    this.qGeometry.temporaryCoord = null;
    this.setUpdateState('geojson');
    this.removeFillLayer();
  }

  // 添加图层
  addLayer() {
    if (this.qGeometry.temporaryCoord) {
      this.createFillLayer();
    }
    if (!this.customLayer) {
      this.createModelLayer();
    }
    this.updateNoteLayer();
    if (this.controlPointLayer) this.controlPointLayer.moveLayer();
  }

  updateLayers(type: string, item: any) {
    if (this.customLayer) {
      const mesh = this.customLayer._mesh.mesh;
      if (type) {
        const material = mesh.material;
        const qStyles = this.getQStyles();
        const layoutObj: any = qStyles.getLayoutObj();
        const paintObj: any = qStyles.getPaintObj();
        const waterColor = paintObj['fill-color'];
        const sunColor = new Color(waterColor);
        material.uniforms['waterColor'].value = sunColor;
        material.uniforms['time'].value += 1.0 / 60.0;
      } else {
        const coordCollection = this.qGeometry.getCoordCollection();
        const coords = coordCollection.toArray();
        const mercatorCoords2 = coords.map((it: any) => [
          ...mt3d.fromLngLat(it),
        ]);
        const points = mercatorCoords2.map((it: number[]) => {
          return new THREE.Vector2(it[0], it[1]);
        });
        const shape = new THREE.Shape(points);
        mesh.geometry = new THREE.ShapeGeometry(shape);
      }
      const map = getQMap()?.getMap();
      map.triggerRepaint();
    } else {
      this.createModelLayer();
    }
  }

  removeFillLayer(): void {
    const allid = this.getAllId();
    const sid = allid.sid;
    const fid = allid.fid;
    if (!this.map) return;
    const lay = this.map.getLayer(fid);
    if (lay) this.map.removeLayer(fid);
  }

  createFillLayer() {
    const allid = this.getAllId();
    const sid = allid.sid;
    const fid = allid.fid;

    const qStyles = this.getQStyles();
    const layoutObj: any = qStyles.getLayoutObj();
    const paintObj: any = qStyles.getPaintObj();

    let layer = {
      id: fid,
      type: 'fill',
      source: sid,
      // minzoom: layoutObj['_minzoom'],
      // maxzoom: layoutObj['_maxzoom'],
      layout: {
        visibility: this.show ? 'visible' : 'none',
      },
      paint: {
        'fill-color': paintObj['fill-color'],
        'fill-opacity': 0.3,
      },
    };
    if (!this.map) return;
    const lay = this.map.getLayer(fid);
    if (lay) this.map.removeLayer(fid);
    this.map.addLayer(layer);
  }

  createModelLayer() {
    const allid = this.getAllId();
    const sid = allid.sid;
    const pid = allid.pid;

    const qStyles = this.getQStyles();
    const layoutObj: any = qStyles.getLayoutObj();
    const paintObj: any = qStyles.getPaintObj();
    const waterColor = paintObj['fill-color'];
    const coordCollection = this.qGeometry.getCoordCollection();
    const coords = coordCollection.toArray();

    if (coords.length > 2) {
      const customLayer = new CustomLayer(pid, this.map, coords, waterColor);
      this.customLayer = customLayer;
      if (!this.map) return;
      const lay = this.map.getLayer(pid);
      if (lay) this.map.removeLayer(pid);
      this.map.addLayer(customLayer);
    }
  }

  //是否完成
  isComplete() {
    return false;
  }
}

// 自定义图层
class CustomLayer {
  id: string = '';
  type = 'custom';
  renderingMode = '3d';

  map: any;
  _scene: any;
  _mesh: any;

  positions: any[];
  waterColor: string;

  constructor(id: string, map: any, positions: any[], waterColor: string) {
    this.id = id;
    this.map = map;

    this.positions = positions;
    this.waterColor = waterColor;
  }

  onAdd(map: any, gl: any) {
    this._scene = new mt3d.Scene({
      map: map,
      gl: gl,
      showFog: true,
    });

    // 光
    this._scene.addObject({
      type: 'light',
      position: mt3d.fromLngLat([120, 40]),
      appearance: {
        lightType: 'ambient',
        color: '#ffffff',
        intensity: 1,
      },
    });

    // 光
    this._scene.addObject({
      type: 'light',
      position: mt3d.fromLngLat([120, 40]),
      appearance: {
        lightType: 'directional',
        color: '#ffffff',
        offset: [0, 0, 10000],
        target: mt3d.fromLngLat([120, 40]),
        intensity: 5,
      },
    });

    // 水
    this._mesh = this._scene.addObject({
      type: 'water2',
      position: [...this.positions],
      appearance: {
        id: this.id,
        // color: '#001e0f',
        // color: this.waterColor || '#d48806',
        color: this.waterColor || '#001e0f',
      },
    });
  }
  render() {
    this._scene.update();
    this.map.triggerRepaint();
  }
}

export default DrawWaterPolygon;
