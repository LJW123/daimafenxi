import { getQMap, MapSource, QLayerDataModel } from "@/plugin/qSpace/core";
import { makeAutoObservable, runInAction, toJS } from "mobx";
import { dataToGeojson } from "@/configs/datatogeojson";
import MakerLayerManage from "./markerLayer";
import MapLayerFilter from "./maplayerfilter";
import { datamg } from "@/common";

type MapLayerData = { [key: string]: { [key: string]: string } };

class MapState {
  private static instance: MapState;
  public static getInstance() {
    if (!MapState.instance) {
      MapState.instance = new MapState();
    }
    return MapState.instance;
  }

  // 地图图层数据  元信息
  mapLayerData: MapLayerData = {};
  constructor() {
    makeAutoObservable(this);
  }
  setMapLayerData(data: MapLayerData) {
    runInAction(() => {
      this.mapLayerData = data;
    });
  }

  updateMaplayerData(metaId: any, title: any) {
    const _mapLayerData = Object.assign({}, toJS(this.mapLayerData));
    if (!_mapLayerData[metaId]) {
      _mapLayerData[metaId] = {};
    }
    _mapLayerData[metaId][title] = "";

    this.setMapLayerData(_mapLayerData);
  }

  removeMapLayer(mapLayerData: MapLayerData, layerId: any) {
    if (!mapLayerData[layerId]) {
      getQMap()?.removeLayerById(layerId);
    }
  }

  async addMapLayerData(data: {
    title: string;
    metaInfo: any;
    maxzoom?: number;
    minzoom?: number;
    item?: any;
    filterParams: any;
  }) {
    if (data.item && data.item.dataParams) {
      let dataParams = data.item.dataParams;
      //判断图层是否存在，如果存在，不在添加图层
      const dataList: MapSource[] = getQMap()?.getDataLayerList() || [];

      if (dataParams.type === "interface") {
        if (
          dataList.filter((it) => it.id == dataParams.layerName).length == 0
        ) {

          let res = await fetch(dataParams.url)
            .then((r) => r.json())

          if (dataParams.layerName == "区域用水总量(年)" || dataParams.layerName == "区域用水总量(总量)"
            || dataParams.layerName == "区域用水总量(地表水)" || dataParams.layerName == "区域用水总量(地下水)"

          ) {
            let wsdata = await fetch("http://10.65.6.47:8917/fpPreviewApi/map/getUseWaterStandard.json").then((r) => r.json())

            for (let i = 0; i < res.data.length; i++) {
              let resData = res.data[i];
              let data111 = wsdata.data.filter((it: any) => it.adAbbrName == resData.adAbbrName);
              if (data111.length > 0) {
                resData.permWw = data111[0].permWw
                resData.gcWw = data111[0].gcWw
                resData.ucWw = data111[0].ucWw

                if (dataParams.layerName == "区域用水总量(总量)" || dataParams.layerName == "区域用水总量(年)") {
                  resData.quota = data111[0].permWw
                } else if (dataParams.layerName == "区域用水总量(地表水)") {
                  resData.quota = data111[0].gcWw
                } else if (dataParams.layerName == "区域用水总量(地下水)") {
                  resData.quota = data111[0].ucWw
                }
              }
            }

          }


          //河道水情告警超警戒水位：需要做计算，realValue - wrz
          if (dataParams.layerName == '河道水情告警') {
            for (let i = 0; i < res.data.length; i++) {
                let item = res.data[i];
                if (item.realValue || item.wrz) {
                    item.wrz = item.realValue - item.wrz
                }
              }
          }
          
          let geojson = dataToGeojson(res.data);

          if (dataParams.layers) {
            let layerData = new QLayerDataModel(
              {
                id: dataParams.layerName,
                imgType: "Vector",
                geometry: geojson,
                layers: dataParams.layers,
              },
              "geojson"
            );
            getQMap()?.addLayer(layerData);
          } else if (dataParams.html) {
            MakerLayerManage.getInstance().addMakerLayer(
              geojson,
              dataParams.layerName
            );
          }

          this.updateMaplayerData(dataParams.layerName, data.title);
          MapLayerFilter.getInstance().createFilter(
            dataParams.layerName,
            data.filterParams
          );
        } else {
          this.updateMaplayerData(dataParams.layerName, data.title);
          MapLayerFilter.getInstance().createFilter(
            dataParams.layerName,
            data.filterParams
          );
        }
      } else if (dataParams.type === "service") {
        if (dataList.filter((it) => it.id == dataParams.id).length == 0) {
          let layerData = new QLayerDataModel({
            id: dataParams.id,
            imgType: "Service",
            attributes: {
              serviceUrl: `${datamg}/services/${dataParams.id}`,
              dmServiceType: 2,
            },
            template: {
              code: "0201",
              name: "引擎服务",
            },
            url: `${datamg}/services/${dataParams.id}`,
            layers: dataParams.layers,
          });
          getQMap()?.addLayer(layerData);

        }
      }

    } else {
      const { title, metaInfo, maxzoom, minzoom } = data;

      let _item = {
        ...metaInfo,
        maxzoom: maxzoom,
        minzoom: minzoom,
      };
      let layerData = new QLayerDataModel(_item, "metainfo");
      //判断图层是否存在，如果存在，不在添加图层
      const dataList: MapSource[] = getQMap()?.getDataLayerList() || [];
      if (dataList.filter((it) => it.id == metaInfo?.id).length == 0) {
        getQMap()?.addLayer(layerData);
      }

      this.updateMaplayerData(metaInfo.id, title);

      MapLayerFilter.getInstance().createFilter(
        data.item.metaId,
        data.filterParams
      );
    }
  }
  deleteMapLayer(data: { title: string, metaInfo: any, item?: any }) {
    let id = null;

    if (data.item && data.item.dataParams) {
      let dataParams = data.item.dataParams;
      id = dataParams.layerName;
    } else {
      id = data.metaInfo.id;
    }
    const _mapLayerData = Object.assign({}, toJS(this.mapLayerData))


    this.removeMapLayer(_mapLayerData, id)

    delete _mapLayerData[id]



    MakerLayerManage.getInstance().removeMakerLayer(id)

    this.setMapLayerData(_mapLayerData)
  }

  deleteMapLayerData(data: { title: string; metaInfo: any; item?: any }) {
    const _mapLayerData = Object.assign({}, toJS(this.mapLayerData));

    const { title } = data;

    let id = null;
    if (data.item) {
      if (data.item.dataParams) {
        let dataParams = data.item.dataParams;
        id = dataParams.layerName;
      } else {
        id = data.item.metaId;
      }
    } else if (data.metaInfo) {
      id = data.metaInfo.id;
    }

    if (_mapLayerData[id] && title) {
      delete _mapLayerData[id][title];

      if (Object.keys(_mapLayerData[id]).length == 0) {
        delete _mapLayerData[id];
      }
    }
    this.removeMapLayer(_mapLayerData, id);

    MakerLayerManage.getInstance().removeMakerLayer(id);

    this.setMapLayerData(_mapLayerData);
  }
  getMapLayerData() {
    const _mapLayerData = Object.assign({}, this.mapLayerData);
    let _obj: { [key: string]: string } = {};
    for (const key in _mapLayerData) {
      const obj = _mapLayerData[key];
      _obj = { ..._obj, ...obj };
    }
    const keys = Object.keys(_obj);
    return keys;
  }

  /**
   * 获取图层是否勾选
   * @param metaId
   * @param title
   */
  getShowState(metaId: string, title: string) {
    let mapLayerData = toJS(this.mapLayerData);
    if (mapLayerData[metaId]) {
      const _title = `${metaId}_${title}`;
      if (_title in mapLayerData[metaId]) {
        return true;
      }
    }

    return false;
  }
}

export default MapState;
