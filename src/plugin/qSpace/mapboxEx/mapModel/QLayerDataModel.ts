import { getDataUrl, mapDataType, MapDataTypeModel, getQMap } from "../../core";
import * as turf from "@turf/turf";

// 往地图中添加数据的结构
class QLayerDataModel {
  // 原始数据
  metaInfo: any;
  //原始数据类型   可接受 元信息  feature
  dataType: string; //metainfo feature raster vector geojson image

  //id
  id: string = "";
  //名称  用于源的id
  name: string = "";

  attributes: any = null;

  geometry: any = null;
  url: string = "";

  which: MapDataTypeModel | null = null;

  // 源集合
  sources: any = {};
  // 图层集合
  layers: any[] = [];
  // 样式
  style: any;

  maxzoom: number | undefined = undefined;
  minzoom: number | undefined = undefined;

  constructor(data: any, dataType: string = "metainfo") {
    this.dataType = dataType;
    this.metaInfo = data;
    this.id = `${data.id}`;
    this.name = `${data.name}` || `${data.id}`;
    this.geometry = data.geometry;
    this.attributes = data.attributes;

    this.maxzoom = data.maxzoom;
    this.minzoom = data.minzoom;

    const imgType = data.imgType;
    if (imgType == "Vector") {
      const which = mapDataType.find(
        (it: MapDataTypeModel) => it.name.indexOf("矢量") > -1
      );
      if (which) this.which = which;
    } else if (imgType == "Raster") {
      const which = mapDataType.find(
        (it: MapDataTypeModel) => it.name.indexOf("影像") > -1
      );
      if (which) this.which = which;
    } else if (imgType == "Dem") {
      const which = mapDataType.find(
        (it: MapDataTypeModel) => it.name.indexOf("地形") > -1
      );
      if (which) this.which = which;
    } else if (imgType == "Service") {
      const template = data.template;
      const which = mapDataType.find(
        (it: MapDataTypeModel) => it.code == template.code
      );
      if (which) this.which = which;
    }

    if (this.dataType === "metainfo") {
      this.init_metainfo();
    } else if (this.dataType === "feature") {
      const which = mapDataType.find((it: any) => it.code === "0101");
      if (which) this.which = which;
      this.init_feature();
    } else if (this.dataType === "raster") {
      this.url = data.url;
      this.layers = data.layers;
      this.sources[data.id] = {
        type: "raster",
        tiles: [this.url],
        tileSize: 256,
      };
    } else if (this.dataType === "vector") {
      this.url = data.url;
      this.layers = data.layers;
      this.sources[data.id] = {
        type: "vector",
        tiles: [this.url],
      };
    } else if (this.dataType === "geojson") {
      this.layers = data.layers;
      this.sources[data.id] = {
        type: "geojson",
        data: this.geometry,
      };
    } else if (this.dataType === "image") {
      this.init_image();
    }
  }

  init_metainfo() {
    let bounds = [73.505109, 34.89682, 96.136712, 49.139196];
    if (this.geometry != null) {
      const geometry = JSON.parse(this.geometry);
      const bbox = turf.bbox(geometry);
      // const bounds = [bbox[2], bbox[1], bbox[0], bbox[3]]
      bounds = [...bbox];
    }

    let _layer: any = {
      id: `${this.id}` || `${this.name}`,
      type: "raster",
      source: `${this.id}`,
    };

    if (this.maxzoom && this.maxzoom !== 0) {
      _layer.maxzoom = this.maxzoom;
    }

    if (this.minzoom && this.minzoom !== 0) {
      _layer.minzoom = this.minzoom;
    }

    this.layers = [_layer];

    const which = this.which;
    const attributes = this.attributes;
    const datamg = `${getDataUrl()}/datamg`;

    if (which?.code === "0101") {
      //矢量
      let file = `${datamg}/metainfo/${this.id}`;
      this.url = `${file}/tile?crs=EPSG:3857&l={z}&x={x}&y={y}&qtime=${new Date().getTime()}`;

      try {
        let style = this.metaInfo.style;
        if (style) {
          this.style = style;
          this.url = `${file}/vectortile?crs=EPSG:3857&l={z}&x={x}&y={y}&qtime=${new Date().getTime()}`;

          let _sources: any = {
            type: "vector",
            tiles: [this.url],
            bounds: bounds,
          };

          if (this.maxzoom && this.maxzoom !== 0) {
            _sources.maxzoom = this.maxzoom;
          }

          if (this.minzoom && this.minzoom !== 0) {
            _sources.minzoom = this.minzoom;
          }

          this.sources[this.id] = _sources;

          let _style = JSON.parse(style);
          if (_style instanceof Array) {
            _style.forEach((it: any, ind: number) => {
              if (it.minzoom) {
                it.minzoom = Number(it.minzoom);
              }
              if (it.maxzoom) {
                it.maxzoom = Number(it.maxzoom);
              }
              if (this.maxzoom && this.maxzoom !== 0) {
                it.maxzoom = this.maxzoom;
              }

              if (this.minzoom && this.minzoom !== 0) {
                it.minzoom = this.minzoom;
              }
              it.id = `${this.id}-${it.id}-${ind}`;
              it.source = this.id;
              it["source-layer"] = this.name;
            });
            this.layers = _style;
          } else {
            if (_style.minzoom) {
              _style.minzoom = Number(_style.minzoom);
            }
            if (_style.maxzoom) {
              _style.maxzoom = Number(_style.maxzoom);
            }

            if (this.maxzoom && this.maxzoom !== 0) {
              _style.maxzoom = this.maxzoom;
            }

            if (this.minzoom && this.minzoom !== 0) {
              _style.minzoom = this.minzoom;
            }

            _style.id = `${this.id}-${_style.id}`;
            _style.source = this.id;
            _style["source-layer"] = this.name;
            this.layers = [_style];
          }
        } else {
          this.sources[this.id] = {
            type: "raster",
            tiles: [this.url],
            bounds: bounds,
          };
        }
      } catch (e) {}
    } else if (which?.code === "0102") {
      //栅格-影像
      let file = `${datamg}/metainfo/${this.id}`;
      this.url = `${file}/tile?crs=EPSG:3857&l={z}&x={x}&y={y}&qtime=${new Date().getTime()}`;
      let _sources: any = {
        type: "raster",
        tiles: [this.url],
        tileSize: 256,
        bounds: bounds,
      };

      if (this.maxzoom && this.maxzoom !== 0) {
        _sources.maxzoom = this.maxzoom;
      }

      if (this.minzoom && this.minzoom !== 0) {
        _sources.minzoom = this.minzoom;
      }
      this.sources[this.id] = _sources;
    } else if (which?.code === "0201") {
      //引擎服务
      let dmServiceType = attributes?.dmServiceType;
      let serviceUrl = attributes?.serviceUrl;
      this.url = `${serviceUrl}/tile?crs=EPSG:3857&l={z}&x={x}&y={y}&cache=true&qtime=${new Date().getTime()}`;

      if (dmServiceType === 1) {
        //影像
        this.sources[this.id] = {
          type: "raster",
          tiles: [this.url],
          tileSize: 256,
          bounds: bounds,
        };
      } else if (dmServiceType === 2) {
        //矢量
        this.sources[this.id] = {
          type: "vector",
          tiles: [this.url],
          tileSize: 256,
        };
        this.layers=this.metaInfo.layers;
      } else if (dmServiceType === 3) {
      }
    } else if (which?.code === "0202") {
      //地图服务
      let serviceUrl = attributes?.serviceUrl;
      this.url = `${serviceUrl}`;
      this.sources[this.id] = {
        type: "raster",
        tiles: [this.url],
        tileSize: 256,
        bounds: bounds,
      };
    } else if (which?.code === "0203") {
      //地形服务
      let serviceUrl = attributes?.serviceUrl;
      this.url = `${serviceUrl}`;
    } else if (which?.code === "0204") {
      //倾斜服务
      let serviceUrl = attributes?.serviceUrl;
      this.url = `${serviceUrl}`;
    } else {
      this.url = `${this.metaInfo.url}`;
      this.sources[this.id] = {
        type: "raster",
        tiles: [this.url],
        tileSize: 256,
        bounds: bounds,
      };
    }
  }

  init_feature() {
    const attributes = this.attributes;

    let geometry = null;
    if (this.metaInfo.geom) {
      this.geometry = this.metaInfo.geom;
      geometry = JSON.parse(this.metaInfo.geom);
      geometry.properties = { ...attributes };
    }

    let layer: any = null;
    if (geometry.type === "Polygon" || geometry.type === "MultiPolygon") {
      layer = {
        id: this.id,
        source: this.id,
        type: "fill",
        layout: {},
        paint: {
          "fill-color": "#ff0000",
          "fill-opacity": 0.6,
        },
      };
    } else if (
      geometry.type === "LineString" ||
      geometry.type === "MultiLineString"
    ) {
      layer = {
        id: this.id,
        source: this.id,
        type: "line",
        layout: {},
        paint: {
          "line-color": "#ff0000",
          "line-width": 4,
        },
      };
    } else if (geometry.type === "Point") {
      const image = this.metaInfo.image;
      if (image) {
        layer = {
          id: this.id,
          source: this.id,
          type: "symbol",
          layout: {
            "icon-image": image.name,
            "icon-size": 1,
            "icon-allow-overlap": true,
            "icon-ignore-placement": true,
          },
          paint: {},
        };
        if (image.offset) {
          layer.layout["icon-offset"] = image.offset;
        }
      } else {
        layer = {
          id: this.id,
          source: this.id,
          type: "circle",
          layout: {},
          paint: {
            "circle-radius": 8,
            "circle-color": "#ff0000",
          },
        };
      }
    }
    this.layers = [layer];

    this.sources[this.id] = {
      type: "geojson",
      data: geometry,
    };

    if (geometry) {
      const bbox = turf.bbox(geometry);
      const bounds = [...bbox];

      this.sources[this.id].bounds = bounds;
    }
  }

  init_image() {
    this.layers = [
      {
        id: this.id || this.name,
        type: "raster",
        source: this.id,
      },
    ];
    const datamg = `${getDataUrl()}/datamg`;
    const pos = this.metaInfo.pos;
    const attributes = this.attributes;

    try {
      const quicklook = attributes?.quicklook || "";
      const geometry = JSON.parse(this.geometry);
      const bbox = turf.bbox(geometry);
      this.url = `${datamg}/qfile/preview/${quicklook}?gpid=${pos.id}`;
      this.sources[this.id] = {
        type: "image",
        url: this.url,
        coordinates: [
          [bbox[0], bbox[3]],
          [bbox[2], bbox[3]],
          [bbox[2], bbox[1]],
          [bbox[0], bbox[1]],
        ],
      };
    } catch (error) {}
  }

  setSources(sources: any = {}) {
    this.sources = sources;
  }

  setLayers(layers: any[]) {
    this.layers = layers;
  }

  location() {
    try {
      const geometry = JSON.parse(this.geometry);
      getQMap()?.locationGeometry(geometry);
    } catch (error) {}
  }
  locationNotA() {
    try {
      const geometry = JSON.parse(this.geometry);
      getQMap()?.locationGeometryNotA(geometry);
    } catch (error) {}
  }
}

export default QLayerDataModel;
