// import * as THREE from 'three';
import { BaseObject } from './BaseObject';
import { Object3DOptions } from './object3d';
import { Scene } from '../Scene';
import { WaterEffect } from '../effects/water/WaterEffect';
import { fromLngLat } from '../index';

// import { Vector2 } from 'three';
const Vector2 = THREE.Vector2;

/**
 * Box Geometry
 */
export class WaterObject extends BaseObject {
  constructor(options: Object3DOptions, context: Scene) {
    super(options, context);
    const position = options.position;
    const appearance = options.appearance;
    const color = appearance.color || 0xd48806;

    // const mercatorCoords2 = position.map((it: any) => [...fromLngLat(it)]);
    // const points = mercatorCoords2.map((it: number[]) => new THREE.Vector2(it[0], it[1]));
    // const shape = new THREE.Shape(points);
    // const geometry = new THREE.ShapeGeometry(shape);

    let x = position[0] as number;
    let y = position[1] as number;
    let geometry = new THREE.PlaneGeometry(100000, 100000);

    let water = new WaterEffect(geometry, {
      color: color,
      flowDirection: new Vector2(1, 1),
      repaint: () => {
        this.context.map.triggerRepaint();
      },
    });

    this.mesh = water.mesh;
    this.mesh.position.set(x, y, 0);

    // this.mesh.castShadow = appearance.castShadow || false;
    // this.mesh.receiveShadow = appearance.receiveShadow || false;
  }
}
