import * as turf from '@turf/turf';
import DrawLineString from '../../../linestring/lineString';
import { EntityModel, QMapGl } from '../../../../../../core';
import earcut from '../earcut';
import { waterVertexShader, waterFragmentShader } from '../../shader/shader';

class DrawPolygon extends DrawLineString {
  customLayer: any = null;

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
    // this.updateLayers('', '');
    this.updateSource(geojson);
    if (this.controlPointLayer) {
      let ctrlPointList = this.qGeometry?.createCtrlPoint(
        this.controlPointHasMid,
        this.featureKey,
      );
      this.controlPointLayer.createCtrlPt(ctrlPointList);
    }
    // if (!this.ready) {
    this.ready = true;
    this.addLayer();
    // }
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
    const lid = allid.lid;

    const lay = this.map.getLayer(fid);
    const lay_l = this.map.getLayer(lid);
    if (!lay || !lay_l) return;

    const qStyles = this.getQStyles();
    const layoutObj: any = qStyles.getLayoutObj();
    // if (type === 'layout') {
    //   for (let i in item) {
    //     if (i.indexOf('_') < 0) {
    //       this.map.setLayoutProperty(fid, i, item[i]);
    //     } else {
    //       if (i === '_minzoom') {
    //         const n = layoutObj['_maxzoom'];
    //         this.map.setLayerZoomRange(fid, item[i], n);
    //       } else if (i === '_maxzoom') {
    //         const n = layoutObj['_minzoom'];
    //         this.map.setLayerZoomRange(fid, n, item[i]);
    //       }
    //     }
    //     if (i.indexOf('_') < 0) {
    //       this.map.setLayoutProperty(lid, i, item[i]);
    //     } else {
    //       if (i === '_minzoom') {
    //         const n = layoutObj['_maxzoom'];
    //         this.map.setLayerZoomRange(lid, item[i], n);
    //       } else if (i === '_maxzoom') {
    //         const n = layoutObj['_minzoom'];
    //         this.map.setLayerZoomRange(lid, n, item[i]);
    //       }
    //     }
    //   }
    // } else if (type === 'paint') {
    //   for (let i in item) {
    //     if (i.indexOf('_') < 0) {
    //       if (i.indexOf('line') > -1) {
    //         this.map.setPaintProperty(lid, i, item[i]);
    //       } else {
    //         this.map.setPaintProperty(fid, i, item[i]);
    //       }
    //     }
    //   }
    // }
  }

  createFillLayer() {
    const allid = this.getAllId();
    const sid = allid.sid;
    const fid = allid.fid;

    const qStyles = this.getQStyles();
    const layoutObj: any = qStyles.getLayoutObj();
    const paintObj: any = qStyles.getPaintObj();

    const geometry = this.qGeometry.getGeojson();
    const coordCollection = this.qGeometry.getCoordCollection();
    const coords = coordCollection.toArray();

    const coordMercator = [];
    const coordArr = [];

    for (let index = 0; index < coords.length; index++) {
      const coord = coords[index];
      const cc = QMapGl.MercatorCoordinate.fromLngLat({
        lng: coord[0],
        lat: coord[1],
      });
      coordMercator.push([cc.x, cc.y]);
      coordArr[index * 2] = coord[0];
      coordArr[index * 2 + 1] = coord[1];
    }
    const triangle = earcut(coordArr, null, 2);

    const coordData = new Float32Array(triangle.length * 2);

    for (let i = 0; i < triangle.length; i += 3) {
      const a = triangle[i];
      const b = triangle[i + 1];
      const c = triangle[i + 2];

      const arr = [
        coordMercator[a][0],
        coordMercator[a][1],
        coordMercator[b][0],
        coordMercator[b][1],
        coordMercator[c][0],
        coordMercator[c][1],
      ];

      coordData[i * 2] = arr[0];
      coordData[i * 2 + 1] = arr[1];
      coordData[i * 2 + 2] = arr[2];
      coordData[i * 2 + 3] = arr[3];
      coordData[i * 2 + 4] = arr[4];
      coordData[i * 2 + 5] = arr[5];
    }

    const layer = {
      id: fid,
      type: 'custom',

      program: null,
      aPos: null,
      buffer: null,
      onAdd: function (map: any, gl: any) {
        const vertexSource = `
              uniform mat4 u_matrix;
              attribute vec2 a_pos;
              void main() {
                  gl_Position = u_matrix * vec4(a_pos, 0.0, 1.0);
              }`;

        const fragmentSource = `
              void main() {
                  gl_FragColor = vec4(1.0, 0.0, 0.0, 0.5);
              }`;

        const vertexShader = gl.createShader(gl.VERTEX_SHADER);
        gl.shaderSource(vertexShader, vertexSource);
        gl.compileShader(vertexShader);

        const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(fragmentShader, fragmentSource);
        gl.compileShader(fragmentShader);

        this.program = gl.createProgram();
        gl.attachShader(this.program, vertexShader);
        gl.attachShader(this.program, fragmentShader);
        gl.linkProgram(this.program);

        this.aPos = gl.getAttribLocation(this.program, 'a_pos');

        // create and initialize a WebGLBuffer to store vertex and color data
        this.buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
        gl.bufferData(gl.ARRAY_BUFFER, coordData, gl.STATIC_DRAW);
      },

      render: function (gl: any, matrix: any) {
        gl.useProgram(this.program);
        gl.uniformMatrix4fv(
          gl.getUniformLocation(this.program, 'u_matrix'),
          false,
          matrix,
        );
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
        gl.enableVertexAttribArray(this.aPos);
        gl.vertexAttribPointer(this.aPos, 2, gl.FLOAT, false, 0, 0);
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        // gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        gl.drawArrays(gl.TRIANGLES, 0, coordData.length);
      },
    };
    this.customLayer = layer;
    if (!this.map) return;
    const lay = this.map.getLayer(fid);
    if (lay) this.map.removeLayer(fid);
    this.map.addLayer(layer);
  }
}

export default DrawPolygon;
