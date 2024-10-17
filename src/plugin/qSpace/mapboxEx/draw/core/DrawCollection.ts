import DrawCore from './DrawCore';
import QAttribute from '../qAttribute/qAttribute';

import { getQMap } from '../../../core';

class DrawCollection {
  drawEntitys: DrawCore[] = [];
  constructor() {}
  update() {
    for (let i = 0; i < this.drawEntitys.length; i++) {
      let ent = this.drawEntitys[i];
      ent.update();
    }
  }
  addEntity(qEntity: DrawCore) {
    let featureKey = qEntity.getFeatureKey();
    let entity = this.getEntity(featureKey);
    if (!entity) this.drawEntitys.push(qEntity);
  }
  //删除
  removeEntity(qEntity: DrawCore) {
    let featureKey = qEntity.getFeatureKey();
    let idx = this.drawEntitys.findIndex(
      (entity) => entity.featureKey == featureKey,
    );
    if (idx >= 0) {
      qEntity.remove();
      this.drawEntitys.splice(idx, 1);
    }
  }
  removeEntity_featureKey(featureKey: string) {
    let idx = this.drawEntitys.findIndex(
      (entity) => entity.featureKey == featureKey,
    );
    if (idx >= 0) {
      this.drawEntitys[idx].remove();
      this.drawEntitys.splice(idx, 1);
    }
  }
  removeEntity_featureKeys(featureKey: string[]) {
    featureKey.forEach((id: string) => {
      this.removeEntity_featureKey(id);
    });
  }
  removeEntity_id(id: string) {
    let idx = this.drawEntitys.findIndex((entity) => entity.id == id);
    if (idx >= 0) {
      this.drawEntitys[idx].remove();
      this.drawEntitys.splice(idx, 1);
    }
  }
  removeEntity_ids(ids: string[]) {
    ids.forEach((id: string) => {
      this.removeEntity_id(id);
    });
  }
  getEntity(featureKey: string): DrawCore | null {
    let entity = this.drawEntitys.find((entity) => {
      return entity.featureKey == featureKey;
    });
    if (entity) return entity;
    return null;
  }
  getEntityById(id: string): DrawCore | null {
    let entity = this.drawEntitys.find((entity) => {
      return entity.id == id;
    });
    if (entity) return entity;
    return null;
  }
  removeAll() {
    this.drawEntitys.forEach((it: DrawCore) => {
      it.remove();
      // it.removeSelect();
    });
    this.drawEntitys = [];
  }

  async addSTobjectList(stObjectList: any, callback?: any) {
    let num = 0;
    if (stObjectList.length > 0) {
      stObjectList.forEach((item: any) => {
        num++;
        let attributes: any = item.attributes;
        let opts: any = {};
        let attr: any = {};
        for (const key in attributes) {
          if (Object.prototype.hasOwnProperty.call(attributes, key)) {
            const it = attributes[key];
            if (key.indexOf('o_') > -1) {
              let k = key.slice(2);
              if (k == 'geometry') {
                try {
                  opts[k] = JSON.parse(it);
                } catch (error) {}
              } else {
                opts[k] = it;
              }
            } else {
              attr[key] = it;
            }
          }
        }
        this.addDrawEntity(item, opts, attr, () => {
          if (num === stObjectList.length) {
            if (callback) callback();
          }
        });
      });
    } else {
      if (callback) callback();
    }
  }
  async addFeatureList(featureList: any[], tt: string, callback?: any) {
    let num = 0;
    if (featureList.length > 0) {
      featureList.forEach((item: any) => {
        num++;

        let geometry = JSON.parse(item.geom);
        let drawType: string = '';

        if (geometry.type === 'Point') {
          drawType = 'Point';
        } else if (geometry.type === 'LineString') {
          drawType = 'Linestring';
        } else if (geometry.type === 'MultiLineString') {
          drawType = 'Linestring';
          geometry = { ...geometry, coordinates: [...geometry.coordinates[0]] };
        } else if (geometry.type === 'Polygon') {
          drawType = 'Polygon';
        } else if (geometry.type === 'MultiPolygon') {
          drawType = 'Polygon';
          geometry = { ...geometry, coordinates: [...geometry.coordinates[0]] };
        }

        if (tt) {
          drawType = tt;
        }
        let opts: any = {
          drawType: drawType,
        };
        let attr: any = {};
        let feature = { ...item };
        // feature.geometry = geometry;
        opts.geometry = geometry;
        if (!feature.attributes) feature.attributes = {};
        attr['name'] = feature.name;
        this.addDrawEntity(feature, opts, attr, () => {
          if (num === featureList.length) {
            if (callback) callback();
          }
        });
      });
    } else {
      if (callback) callback();
    }
  }
  async addImagesList(imagesList: any[], callback?: any) {
    let num = 0;
    if (imagesList.length > 0) {
      imagesList.forEach((item: any) => {
        num++;
        let geometry = JSON.parse(item.geom);

        let opts: any = {
          drawType: 'IconBase',
        };
        let attr: any = {};
        let feature = { ...item };
        // feature.geometry = geometry;
        opts.geometry = geometry;
        if (!feature.attributes) feature.attributes = {};
        attr['name'] = feature.name;
        this.addDrawEntity(feature, opts, attr, () => {
          if (num === imagesList.length) {
            if (callback) callback();
          }
        });
      });
    } else {
      if (callback) callback();
    }
  }
  async addDrawEntity(item: any, opts: any, attr: any = {}, callback?: any) {
    let drawEntityFactory = getQMap()?.drawEntityFactory;
    if (drawEntityFactory) {
      let drawType: string = opts.drawType;
      let style: any = item.style ? JSON.parse(item.style) : null;

      let drawEntity: DrawCore | null = drawEntityFactory.createDrawEntity(
        drawType,
        style,
        opts,
      );

      if (drawEntity) {
        drawEntity.setId(item.id);
        const qGeometry = drawEntity.qGeometry;
        const geometry = opts.geometry;
        let newCoord = [];
        if (geometry) {
          newCoord = qGeometry.toCoordinates(geometry);
        } else {
          newCoord = qGeometry.toCoordinates(item.geometry);
        }
        qGeometry.setCoordinates(newCoord);
        if (opts.featureKey) {
          drawEntity.setFeatureKey(opts.featureKey);
        }
        if (opts.hasOwnProperty('show')) {
          drawEntity.setShow(opts.show);
        }

        drawEntity.qAttribute = new QAttribute(attr);

        drawEntity.complete();

        this.addEntity(drawEntity);
      }

      if (callback) {
        callback();
      }
    }
  }
}

export default DrawCollection;
