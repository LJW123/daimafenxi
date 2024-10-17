import * as turf from '@turf/turf';
import proj4 from 'proj4';
import projList from './projdef';

export default class SquareGrid {
  squareRid: boolean = false;
  map: any;
  gridSourceId: String = 'gridLine';
  gridSourcePointId: String = 'gridPoint';
  constructor(map: any) {
    this.map = map;
    this.initSquaregrid(map);
  }
  initSquaregrid(map: any) {
    map.on('moveend', (event: any) => {
      if (map.getZoom() > 11 && this.squareRid) {
        let bounds = map.getBounds();
        this.createGridLine(
          bounds.getWest(),
          bounds.getSouth(),
          bounds.getEast(),
          bounds.getNorth(),
        );
      } else {
        this.clearGridLine();
      }
    });

    this.initGridLineSL(map);
  }
  getSquareRid() {
    return this.squareRid;
  }
  setSquareRid(boo: boolean) {
    this.squareRid = boo;
    if (!boo) {
      this.clearGridLine();
    } else {
      if (this.map.getZoom() > 11) {
        let bounds = this.map.getBounds();
        this.createGridLine(
          bounds.getWest(),
          bounds.getSouth(),
          bounds.getEast(),
          bounds.getNorth(),
        );
      }
    }
  }
  initGridLineSL(map: any) {
    let collection = turf.featureCollection([]);

    map.addSource(this.gridSourceId, {
      type: 'geojson',
      data: collection,
    });

    map.addSource(this.gridSourcePointId, {
      type: 'geojson',
      data: collection,
    });

    map.addLayer({
      id: 'gridLineout',
      type: 'line',
      source: this.gridSourceId,

      paint: {
        'line-color': '#fff',
        'line-opacity': 0.7,
        'line-width': 3,
      },
    });

    map.addLayer({
      id: 'gridLine',
      type: 'line',
      source: this.gridSourceId,

      paint: {
        'line-color': '#000',
        'line-opacity': 0.7,
        'line-width': 1,
      },
    });

    map.addLayer({
      id: 'gridLine-label',
      type: 'symbol',
      source: this.gridSourcePointId,
      layout: {
        'symbol-placement': 'point',
        'text-field': '{name}',
        'text-font': ['Microsoft YaHei BD'],
      },
      paint: {
        'text-color': '#fff',
        'text-halo-color': '#000',
        'text-halo-width': 1,
      },
    });
  }
  clearGridLine() {
    if (this.map.getSource(this.gridSourceId)) {
      let collection = turf.featureCollection([]);

      this.map.getSource(this.gridSourceId).setData(collection);
    }
    if (this.map.getSource(this.gridSourcePointId)) {
      let collection = turf.featureCollection([]);

      this.map.getSource(this.gridSourcePointId).setData(collection);
    }
  }
  getProjDef(position: any) {
    let lng = position.lng;
    let min = 75 - 3;
    let max = 135 + 3;

    if (lng > min && lng < max) {
      let idx = Math.floor((lng - min) / 6);
      let proj = projList[idx];

      return proj.content;
    }
    return null;
  }
  createGridLine(minx: number, miny: number, maxx: number, maxy: number) {
    let zoom = this.map.getZoom();
    let center = this.map.getCenter();

    let projdef = this.getProjDef(center);
    if (!projdef) {
      return;
    }
    let firstProjection = projdef; // 'PROJCS["CGCS2000 / Gauss-Kruger zone 20",GEOGCS["China Geodetic Coordinate System 2000",DATUM["China_2000",SPHEROID["CGCS2000",6378137,298.257222101,AUTHORITY["EPSG","1024"]],AUTHORITY["EPSG","1043"]],PRIMEM["Greenwich",0,AUTHORITY["EPSG","8901"]],UNIT["degree",0.0174532925199433,AUTHORITY["EPSG","9122"]],AUTHORITY["EPSG","4490"]],PROJECTION["Transverse_Mercator"],PARAMETER["latitude_of_origin",0],PARAMETER["central_meridian",117],PARAMETER["scale_factor",1],PARAMETER["false_easting",20500000],PARAMETER["false_northing",0],UNIT["metre",1,AUTHORITY["EPSG","9001"]],AUTHORITY["EPSG","4498"]]';

    let secondProjection = 'EPSG:4326';
    let pt1 = proj4(secondProjection, firstProjection, [minx, miny]);
    let pt2 = proj4(secondProjection, firstProjection, [maxx, maxy]);

    let sx = Math.floor(pt1[0] / 1000) * 1000 - 5000;
    let sy = Math.floor(pt1[1] / 1000) * 1000 - 5000;
    let ex = Math.floor(pt2[0] / 1000) * 1000 + 5000;
    let ey = Math.floor(pt2[1] / 1000) * 1000 + 5000;

    let gridLineList = new Array<any>();
    let gridPointList = new Array<any>();
    for (let i = sy; i < ey; i += 1000) {
      let latitudeLine = [];
      for (let j = sx; j < ex; j += 1000) {
        let p1 = proj4(firstProjection, secondProjection, [j, i]);
        let p2 = proj4(firstProjection, secondProjection, [j + 1000, i]);

        latitudeLine.push(p1);
        latitudeLine.push(p2);

        if (i == sy + 6000) {
          let pp = proj4(firstProjection, secondProjection, [j, i + 500]);
          gridPointList.push(turf.point(pp, { name: (j / 1000).toString() }));
        }
      }
      let latitudeLineString = turf.lineString(latitudeLine, {
        name: (i / 1000).toString(),
      });
      gridLineList.push(latitudeLineString);
    }
    for (let j = sx; j < ex; j += 1000) {
      let longitudeLine = [];
      for (let i = sy; i < ey; i += 1000) {
        let p1 = proj4(firstProjection, secondProjection, [j, i]);
        let p2 = proj4(firstProjection, secondProjection, [j, i + 1000]);

        longitudeLine.push(p1);
        longitudeLine.push(p2);

        if (j == sx + 7000) {
          let pp = proj4(firstProjection, secondProjection, [j + 500, i]);
          gridPointList.push(turf.point(pp, { name: (i / 1000).toString() }));
        }
      }
      let longitudeLineString = turf.lineString(longitudeLine, {
        name: (j / 1000).toString(),
      });
      gridLineList.push(longitudeLineString);
    }

    if (this.map.getSource(this.gridSourceId)) {
      let collection = turf.featureCollection(gridLineList);

      this.map.getSource(this.gridSourceId).setData(collection);
    }

    if (this.map.getSource(this.gridSourcePointId)) {
      let collection = turf.featureCollection(gridPointList);

      this.map.getSource(this.gridSourcePointId).setData(collection);
    }
  }
}
