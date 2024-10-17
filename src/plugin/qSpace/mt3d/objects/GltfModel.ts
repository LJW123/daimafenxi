// import * as THREE from 'three';
// import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

import { GLTFLoader } from './GLTFLoader.js';

import { BaseObject } from './BaseObject';
import { Object3DOptions } from './object3d';

import { Scene } from '../Scene';

const rpi = Math.PI / 180;

export class GltfModel extends BaseObject {
  constructor(options: Object3DOptions, context: Scene) {
    super(options, context);

    let world = new THREE.Group();
    this.mesh = world;

    const appearance = options.appearance;

    world.name = `${appearance.id}_${appearance.url}`;
    if (options.position) {
      let position = options.position;
      let x = position[0] as number,
        y = position[1] as number,
        z = position[2] as number;
      this.mesh.position.set(x, y, z);
    } else {
      console.warn('没有指定模型位置信息！！');
      return;
    }

    if (appearance.rotate) {
      let rx = appearance.rotate[0] as number | 0,
        ry = appearance.rotate[1] as number | 0,
        rz = appearance.rotate[2] as number | 0;
      this.mesh
        .rotateX(rx * rpi)
        .rotateY(ry * rpi)
        .rotateZ(rz * rpi);
    }

    if (appearance.scale) {
      let sx = appearance.scale[0] as number | 1,
        sy = appearance.scale[1] as number | 1,
        sz = appearance.scale[2] as number | 1;
      this.mesh.scale.set(sx, sy, sz);
    }

    let loader = new GLTFLoader();
    loader.load(`./models/${appearance.url}`, (gltf: any) => {
      world.add(gltf.scene);
      // setTimeout(() => {
      //   context.render()
      // }, 101);
    });
  }
}
