import * as turf from '@turf/turf';
import DrawLineString from '../../../linestring/lineString';
import { EntityModel, getQMap, QMapGl } from '../../../../../../core';
import * as mt3d from '../../../../../../mt3d/index';
import { Water } from '../../../../../../mt3d/effects/Water';
import { Sky } from '../../../../../../mt3d/effects/Sky';
import earcut from '../earcut';

class DrawWaterPolygon extends DrawLineString {
  constructor(
    map: any,
    factory: EntityModel,
    style: object = {},
    opts: object = {},
  ) {
    super(map, factory, style, opts);
  }
  // 添加图层
  addLayer() {
    this.createFillLayer();
    // this.updateNoteLayer();
    if (this.controlPointLayer) this.controlPointLayer.moveLayer();
  }
  updateLayers(type: string, item: any) {
    const allid = this.getAllId();
    const fid = allid.fid;

    const lay = this.map.getLayer(fid);
    if (!lay) return;

    const qStyles = this.getQStyles();
    const layoutObj: any = qStyles.getLayoutObj();
    if (this.customLayer) {
      const map = getQMap()?.getMap();
      map.triggerRepaint();
    }
  }

  createFillLayer() {
    const allid = this.getAllId();
    const sid = allid.sid;
    const fid = allid.fid;

    const qStyles = this.getQStyles();
    const layoutObj: any = qStyles.getLayoutObj();
    const paintObj: any = qStyles.getPaintObj();

    const coordCollection = this.qGeometry.getCoordCollection();
    const coords = coordCollection.toArray();
    if (coords.length > 2) {
      const center = this.qGeometry.getCenter();
      const mercatorCenter = [...mt3d.fromLngLat(center)];

      let mercatorCoords2 = coords.map((it: any) => [...mt3d.fromLngLat(it)]);
      let mercatorCoords3 = mercatorCoords2.map((it: any) => {
        return [it[0] - mercatorCenter[0], it[1] - mercatorCenter[1]];
      });

      // ============================================================================
      const modelOrigin = [...center];
      const modelAltitude = 10;
      const modelRotate = [Math.PI / 2, 0, 0];

      const modelAsMercatorCoordinate = QMapGl.MercatorCoordinate.fromLngLat(
        modelOrigin,
        modelAltitude,
      );

      const modelTransform = {
        translateX: modelAsMercatorCoordinate.x,
        translateY: modelAsMercatorCoordinate.y,
        translateZ: modelAsMercatorCoordinate.z,
        rotateX: modelRotate[0],
        rotateY: modelRotate[1],
        rotateZ: modelRotate[2],
        scale: modelAsMercatorCoordinate.meterInMercatorCoordinateUnits(),
      };

      let water: any = null;

      const customLayer: any = {
        id: fid,
        type: 'custom',
        renderingMode: '3d',
        onAdd: function (map: any, gl: any) {
          this.map = map;

          this.camera = new THREE.Camera();
          this.scene = new THREE.Scene();

          const ambientLight = new THREE.AmbientLight(0xe7e7e7, 1.2);
          // const ambientLight = new THREE.AmbientLight(0xffffff, 11);
          this.scene.add(ambientLight);

          // const directionalLight = new THREE.DirectionalLight(0xffffff, 12);
          // directionalLight.position.set(0, 0, 999);
          const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
          directionalLight.position.set(
            mercatorCenter[0],
            mercatorCenter[1],
            9999,
          );
          this.scene.add(directionalLight);

          let points = mercatorCoords3.map((it: number[]) => {
            return new THREE.Vector2(it[0], it[1]);
          });
          const shape = new THREE.Shape(points);
          const geometry = new THREE.ShapeGeometry(shape);

          water = new Water(geometry, {
            // textureWidth: 1024,
            // textureHeight: 1024,
            waterNormals: new THREE.TextureLoader().load(
              './images/water/Water_1_M_Normal.jpg',
              function (texture: any) {
                texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
              },
            ),
            sunDirection: new THREE.Vector3(),
            sunColor: 0xffffff,
            // sunColor: 0x2FA1D6,
            waterColor: 0xff0000,
            // waterColor: 0x2FA1D6,
            // waterColor: 0x001e0f,
            distortionScale: 3.7,
            // fog: this.scene.fog !== undefined,
            fog: false,
            // alpha:0.9
          });
          water.rotation.x = -Math.PI / 2;

          this.scene.add(water);

          const sky = new Sky();
          sky.scale.setScalar(9999999);
          sky.position.y = 100;
          this.scene.add(sky);

          this.renderer = new THREE.WebGLRenderer({
            canvas: map.getCanvas(),
            context: gl,
            antialias: true,
          });

          this.renderer.autoClear = false;

          const skyUniforms = sky.material.uniforms;
          skyUniforms['turbidity'].value = 10;
          skyUniforms['rayleigh'].value = 2;
          skyUniforms['mieCoefficient'].value = 0.005;
          skyUniforms['mieDirectionalG'].value = 0.8;
          const parameters = {
            elevation: 90,
            azimuth: 90,
          };
          let sun = new THREE.Vector3();

          const phi = THREE.MathUtils.degToRad(parameters.elevation);
          const theta = THREE.MathUtils.degToRad(parameters.azimuth);

          sun.setFromSphericalCoords(1, phi, theta);
          sky.material.uniforms['sunPosition'].value.copy(sun);
          water.material.uniforms['sunDirection'].value.copy(sun).normalize();
        },
        render: function (gl: any, matrix: any) {
          const rotationX = new THREE.Matrix4().makeRotationAxis(
            new THREE.Vector3(1, 0, 0),
            modelTransform.rotateX,
          );
          const rotationY = new THREE.Matrix4().makeRotationAxis(
            new THREE.Vector3(0, 1, 0),
            modelTransform.rotateY,
          );
          const rotationZ = new THREE.Matrix4().makeRotationAxis(
            new THREE.Vector3(0, 0, 1),
            modelTransform.rotateZ,
          );

          const m = new THREE.Matrix4().fromArray(matrix);
          const l = new THREE.Matrix4()
            .makeTranslation(
              modelTransform.translateX,
              modelTransform.translateY,
              modelTransform.translateZ,
            )
            .scale(
              new THREE.Vector3(
                modelTransform.scale,
                -modelTransform.scale,
                modelTransform.scale,
              ),
            )
            .multiply(rotationX)
            .multiply(rotationY)
            .multiply(rotationZ);

          this.camera.projectionMatrix = m.multiply(l);
          this.renderer.resetState();

          water.material.uniforms['time'].value += 1.0 / 60.0;

          this.renderer.render(this.scene, this.camera);
          this.map.triggerRepaint();
        },
      };

      this.customLayer = customLayer;
      if (!this.map) return;
      const lay = this.map.getLayer(fid);
      if (lay) this.map.removeLayer(fid);
      this.map.addLayer(customLayer);
    }
  }
}

export default DrawWaterPolygon;
