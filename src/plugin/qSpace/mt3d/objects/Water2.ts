import { Water } from '../effects/Water';
import { Sky } from '../effects/Sky';

import { BaseObject } from './BaseObject';
import { Object3DOptions } from './object3d';
import { Scene } from '../Scene';
import { fromLngLat } from '../index';

/**
 * 水2
 */
export class Water2Object extends BaseObject {
  constructor(options: Object3DOptions, context: Scene) {
    super(options, context);

    const position = options.position;
    const appearance = options.appearance;
    const color = appearance.color || 0xd48806;
    // const centerPosition = appearance.centerPosition;
    // const mercatorCenter = [...fromLngLat(centerPosition)]

    const mercatorCoords2 = position.map((it: any) => [...fromLngLat(it)]);
    const points = mercatorCoords2.map(
      (it: number[]) => new THREE.Vector2(it[0], it[1]),
    );
    const shape = new THREE.Shape(points);
    const geometry = new THREE.ShapeGeometry(shape);

    let water = new Water(geometry, {
      textureWidth: 512,
      textureHeight: 512,
      waterNormals: new THREE.TextureLoader().load(
        './images/water/waternormals.jpg',
        function (texture: any) {
          // texture.rotation = Math.PI / 2
          texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        },
      ),
      sunDirection: new THREE.Vector3(),
      sunColor: 0xffffff,
      waterColor: color,
      distortionScale: 3.7,
      fog: false,
    });

    // water.position.set(0, 0, 1500)
    water.name = `${appearance.id}_water`;
    this.mesh = water;

    //======光======================================
    const sky = new Sky();
    const sun = new THREE.Vector3();
    sky.scale.setScalar(9999);
    sky.position.y = 100;
    context.scene.add(sky);
    const skyUniforms = sky.material.uniforms;
    skyUniforms['turbidity'].value = 10;
    skyUniforms['rayleigh'].value = 2;
    skyUniforms['mieCoefficient'].value = 0.005;
    skyUniforms['mieDirectionalG'].value = 0.8;
    function updateSun() {
      const phi = THREE.MathUtils.degToRad(90);
      const theta = THREE.MathUtils.degToRad(90);
      sun.setFromSphericalCoords(theta, phi, 1);
      sky.material.uniforms['sunPosition'].value.copy(sun);
      water.material.uniforms['sunDirection'].value.copy(sun).normalize();
    }
    updateSun();

    function render() {
      water.material.uniforms['time'].value -= 1.0 / 60.0;
    }
    function animate() {
      requestAnimationFrame(animate);
      render();
    }

    animate();
  }
}
