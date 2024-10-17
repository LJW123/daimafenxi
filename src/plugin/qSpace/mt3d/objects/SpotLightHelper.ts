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
export class SpotLightHelperEffect extends BaseObject {
  constructor(options: Object3DOptions, context: Scene) {
    super(options, context);
    let appearance = options.appearance;
    let angle = appearance.angle;

    let position = options.position;
    let x = position[0] as number,
      y = position[1] as number,
      z = position[2] as number;

    let offset = appearance.offset || [];
    let offsetX = offset[0] || 0;
    let offsetY = offset[1] || 0;
    let offsetZ = offset[2] || 0;

    let SCREEN_WIDTH = window.innerWidth;
    let SCREEN_HEIGHT = window.innerHeight;
    let aspect = SCREEN_WIDTH / SCREEN_HEIGHT;

    let cameraPerspective = new PerspectiveCamera(
      angle,
      0.5 * aspect,
      1,
      z + 10,
    );

    cameraPerspective.position.set(x + offsetX, y + offsetY, z + offsetZ);
    cameraPerspective.lookAt(new Vector3(x, y, 0));
    cameraPerspective.updateProjectionMatrix();

    let cameraPerspectiveHelper = new CameraHelper(cameraPerspective);
    cameraPerspectiveHelper.name = 'cameraHelper';

    this.mesh = cameraPerspectiveHelper;
  }
}
