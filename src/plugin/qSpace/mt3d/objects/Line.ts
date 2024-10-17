// import * as THREE from 'three';
import { BaseObject } from './BaseObject';
import { Object3DOptions } from './object3d';
import { lngLatToMercator } from '../utils/util';
import { Scene } from '../Scene';

/**
 * Line Geometry
 */
export class Line extends BaseObject {
  constructor(options: Object3DOptions, context: Scene) {
    super(options, context);
    let position = options.position;
    let appearance = options.appearance;
    let color = appearance.color || 0x00ff00;
    let linewidth = appearance.linewidth || 5;

    const material = new THREE.LineBasicMaterial({
      color: color,
      linewidth: linewidth,
    });

    const geometry = this.getGeometry(position);

    this.mesh = new THREE.Line(geometry, material);
  }

  getGeometry(list: any) {
    let pos = list.map((it: [number, number, number]) => {
      let v1 = new THREE.Vector3(it[0], it[1], it[2] || 0);
      return v1;
    });

    const geometry = new THREE.BufferGeometry().setFromPoints(pos);
    // let curve = new THREE.CatmullRomCurve3(pos);
    // let geometry = new THREE.TubeGeometry(curve, 80, 5000, 16);
    return geometry;
  }
}
