import * as turf from '@turf/turf';
import DrawThreeCore from '../DrawThreeCore';
import { getQMap, EntityModel } from '../../../../core';

// 弧度线
class DrawRadianLine extends DrawThreeCore {
  customLayer: any = null;

  constructor(
    map: any,
    factory: EntityModel,
    style: object = {},
    opts: object = {},
  ) {
    super(map, factory, style, opts);
  }

  createLayer() {
    const map = this.map;
    const tbMap = getQMap()?.tbMap;

    const allid = this.getAllId();
    const lid = allid.lid;

    const geometry = this.qGeometry.getGeojson();
    const coords = turf.getCoords(geometry);

    const qStyles = this.getQStyles();
    const layoutObj: any = qStyles.getLayoutObj();
    const height = layoutObj['_model-height'];
    const scale = layoutObj['_model-scale'];

    var lines = new Array();
    var arcSegments = 25;
    var lineQuantity = 11;

    for (var i = 0; i < lineQuantity; i++) {
      var line = new Array();
      var destination = [
        300 * (Math.random() - 0.5),
        140 * (Math.random() - 0.5),
      ];

      var maxElevation =
        Math.pow(Math.abs(destination[0] * destination[1]), 0.5) * 80000;

      var increment = destination.map(function (direction) {
        return direction / arcSegments;
      });

      for (var l = 0; l <= arcSegments; l++) {
        var waypoint = increment.map(function (direction) {
          return direction * l;
        });

        var waypointElevation =
          Math.sin((Math.PI * l) / arcSegments) * maxElevation;

        waypoint.push(waypointElevation);
        line.push(waypoint);
      }

      lines.push(line);
    }

    let objects: any[] = [];
    const customLayer = {
      id: lid,
      type: 'custom',
      renderingMode: '3d',
      onAdd: function (map: any, mbxContext: any) {
        for (line of lines) {
          var lineOptions = {
            geometry: line,
            color: (line[1][1] / 180) * 0xffffff, // color based on latitude of endpoint
            width: Math.random() + 1, // random width between 1 and 2
          };

          let lineMesh = tbMap.line(lineOptions);
          objects.push(lineMesh);
          tbMap.add(lineMesh);
        }
      },

      render: function (gl: any, matrix: any) {
        if (tbMap) tbMap.update();
      },
    };
    map.addLayer(customLayer);
    this.customLayer = customLayer;

    // setInterval(() => {
    //   var lines2 = new Array();
    //   for (var i = 0; i < lineQuantity; i++) {
    //     var line = new Array();
    //     var destination = [
    //       300 * (Math.random() - 0.5),
    //       140 * (Math.random() - 0.5),
    //     ];
    //     var maxElevation =
    //       Math.pow(Math.abs(destination[0] * destination[1]), 0.5) * 80000;

    //     var increment = destination.map(function (direction) {
    //       return direction / arcSegments;
    //     });

    //     for (var l = 0; l <= arcSegments; l++) {
    //       var waypoint = increment.map(function (direction) {
    //         return direction * l;
    //       });

    //       var waypointElevation =
    //         Math.sin((Math.PI * l) / arcSegments) * maxElevation;

    //       waypoint.push(waypointElevation);
    //       line.push(waypoint);
    //     }

    //     lines2.push(line);
    //   }

    //   objects.forEach((it: any, index: number) => {

    //     // Geometry
    //     var straightProject = tbMap.utils.lnglatsToWorld(lines2[index]);
    //     var normalized = tbMap.utils.normalizeVertices(straightProject);
    //     var flattenedArray = tbMap.utils.flattenVectors(normalized.vertices);

    //     it.geometry.setPositions(flattenedArray);

    //     it.material.setValues({
    //       color: lines[index][1][1] / (Math.random() * 180) * 0xffffff,
    //       linewidth: Math.random() * 20 + 1, // random width between 1 and 2

    //     });
    //   })
    //   map.triggerRepaint();

    // }, 1000);
  }

  updateLayer() {
    const map = this.map;
    const tbMap = getQMap()?.tbMap;

    const allid = this.getAllId();
    const lid = allid.lid;

    // const geometry = this.qGeometry.getGeojson()
    // const coords = turf.getCoords(geometry);

    // const qStyles = this.getQStyles();
    // const layoutObj: any = qStyles.getLayoutObj();
    // const height = layoutObj['_model-height'];
    // const scale = layoutObj['_model-scale'];

    // if (!this.customLayer) {
    //   const customLayer = {
    //     id: lid,
    //     type: 'custom',
    //     renderingMode: '3d',
    //     onAdd: function (map: any, mbxContext: any) {
    //       // instantiate threebox

    //       var lineOptions = {
    //         geometry: coords,
    //         color: '#ff0000', // color based on latitude of endpoint
    //         width: 11, // random width between 1 and 2
    //       };

    //       let lineMesh = tbMap.line(lineOptions);

    //       tbMap.add(lineMesh);
    //     },

    //     render: function (gl: any, matrix: any) {
    //       if (tbMap) tbMap.update();
    //     },
    //   }
    //   map.addLayer(customLayer);
    //   this.customLayer = customLayer
    // }
  }
}

export default DrawRadianLine;
