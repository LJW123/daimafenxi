// import {
//   Object3D,
//   SpotLight,
//   SpotLightHelper,
//   PerspectiveCamera,
//   CameraHelper,
//   Vector3,
// } from 'three';
import { Object3DOptions } from './object3d';
import { BaseObject } from './BaseObject';
import { TransformControls } from './TransformControls2.js';

import { Scene } from '../Scene';
const {
  Object3D,
  SpotLight,
  SpotLightHelper,
  PerspectiveCamera,
  CameraHelper,
  Vector3,
} = THREE;
// 辅助线
export class TransformControlsEffect extends BaseObject {
  constructor(options: Object3DOptions, context: Scene) {
    super(options, context);

    const camera = context.cameraForMap;
    const renderer = context.renderer;
    const lightOrigin = context.worldGroup.children[1];

    const scene = context.scene;

    const control = new TransformControls(camera, renderer.domElement);
    control.addEventListener('dragging-changed', (event) => {
      // controls.enabled = ! event.value;
    });
    control.attach(lightOrigin);
    // scene.add( control );

    this.mesh = control;
  }
}
