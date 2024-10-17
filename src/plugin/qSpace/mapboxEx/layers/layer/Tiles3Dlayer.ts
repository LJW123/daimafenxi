import { QMapGl, QLayerDataModel } from '../../../core';
import MapLayer from './MapLayer';

import MapboxLayer from './3dtiles/mapbox-layer';
// import { MapboxLayer } from '@deck.gl/mapbox/src/index';

import { Tile3DLayer } from '@deck.gl/geo-layers';
import { Tiles3DLoader } from '@loaders.gl/3d-tiles';

import { Vector3, Matrix4, Matrix3 } from '@math.gl/core';
import { Ellipsoid } from '@math.gl/geospatial';

interface xyz {
  x: number;
  y: number;
  z: number;
}
interface objs {
  id: string;
  url: string;
  location: number[];
  height?: number;
  gr?: xyz;
  tr?: xyz;
}
let dutohu = (num: number) => {
  return (num / 180) * Math.PI;
};
class Tiles3Dlayer extends MapLayer {
  [props: string]: any;

  map: any;
  qLayerData: QLayerDataModel;

  id: string = '';
  url: string = '';

  tilesModel: any = null; //倾斜图层

  tilesObj: any = null; //倾斜

  order: string | null = null;

  center: any = null;
  zoom: any = null;
  tile3dHeight: number = 0;

  constructor(
    map: any,
    id: string,
    qLayerData: QLayerDataModel,
    extraAttr: any = {},
  ) {
    super(map, id, qLayerData);

    this.map = map;
    this.id = id;
    this.qLayerData = qLayerData;

    this.url = qLayerData.url;

    const attributes = qLayerData.attributes;
    const tile3dHeight = Number(attributes.tile3dHeight) || 0;
    this.tile3dHeight = tile3dHeight;

    for (let i in extraAttr) {
      this[i] = extraAttr[i];
    }
  }
  addLayers(order: string | null = null) {
    this.order = order;

    // const maximumScreenSpaceError = attributes.maximumScreenSpaceError || 32;

    let mplayer = new MapboxLayer({
      type: Tile3DLayer,
      id: this.id,

      data: this.url,
      // data: 'http://125.46.29.234:801/qxsy/Data-GJT-1-2/tileset.json',
      // data: 'http://125.46.29.234:801/qxsy/huanghe/tileset.json',
      // data: 'http://125.46.29.234:801/qxsy/zhonghe/tileset.json',
      // data: 'http://125.46.29.234:801/qxsy/tianshui/tileset.json',
      // data: 'http://192.168.1.175:8100/tileset.json',
      // data:'http://125.46.29.234:801/qxsy/tianshui/tileset.json',
      loader: Tiles3DLoader,
      loadOptions: {
        tileset: {
          throttleRequests: false,
          maxRequests: 256 * 8,
          maximumMemoryUsage: 1024 * 16,
          updateTransforms: false,
          maximumScreenSpaceError: 16,
        },
        draco: {
          // workerUrl: '../../../../../plug_in/draco-worker.js',
        },
      },

      onTilesetLoad: (tileset: any) => {
        const cartographicCenter: any = tileset.cartographicCenter;
        const zoom: any = tileset.zoom;
        this.zoom = zoom;

        if (!this.center) {
          this.center = [cartographicCenter[0], cartographicCenter[1], 0];
        }

        const v1 = new Vector3(cartographicCenter[0], cartographicCenter[1], 0);
        const r1 = new Vector3();
        Ellipsoid.WGS84.cartographicToCartesian(v1, r1);

        const v2 = new Vector3(
          cartographicCenter[0],
          cartographicCenter[1],
          this.tile3dHeight,
        );
        const r2 = new Vector3();
        Ellipsoid.WGS84.cartographicToCartesian(v2, r2);

        const c = r2.subtract(r1);

        const mMtx = new Matrix4().makeTranslation(c[0], c[1], c[2]);
        tileset.modelMatrix = mMtx;

        this.tilesObj = tileset;
      },
    });

    this.tilesModel = mplayer;

    if (order) {
      this.map.addLayer(mplayer, order);
    } else {
      this.map.addLayer(mplayer);
    }
    this.layers.push(mplayer);
  }

  removeLayer(callback?: any) {
    if (this.tilesModel) {
      this.tilesModel.onRemove();
      this.tilesModel = null;
      this.tilesObj = null;
      this.layers = [];
    }
    this.map.removeLayer(this.id);
    if (callback) callback();
  }

  setTile3dHeight(num: number) {
    this.tile3dHeight = num;
    this.removeLayer(() => {
      setTimeout(() => {
        this.addLayers(this.order);
      }, 1000);
    });
  }

  getExtraAttr() {
    return {
      tile3dHeight: this.tile3dHeight,
      center: this.center,
      zoom: this.zoom,
    };
  }
}

export default Tiles3Dlayer;
