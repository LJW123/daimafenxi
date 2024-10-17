import { getQMap } from "@/plugin/qSpace/core";
import { observer } from "mobx-react-lite";
import React, { useEffect } from "react";
import mapUi from "@/mobx/mapUi";
import uiState from "@/mobx/ui";
import { message } from "antd";

import { datamg } from "@/common";
import axios from "axios";
import AttributeConfig from "@/configs/attributeConfig/attributeConfig";
const QueryView = observer((props: any) => {
  const mapLoad = props.mapLoad;

  useEffect(() => {
    if (mapLoad) {
      addUpdateNum();
      addEvented();
    }
  }, [mapLoad]);

  const addUpdateNum = () => {
    getQMap()?.Evented.on("updateNum", () => {
      let n = mapUi.updateNum;
      n++;
      mapUi.setUpdateNum(n);
    });
  };

  const addEvented = () => {
    getQMap()?.Evented.on("clickQueryData", (res: any) => {
      const data = res.data;
      uiState.setClickQueryData(data);
    });
    getQMap()?.Evented.on("mapQueryData", (res: any) => {
      const data = res.data;
      const item = data
        ? AttributeConfig.getInstance().getAttribute(data)
        : null;

      // 关闭弹框
      if (!data) {
        uiState.setClickQueryData(data);
      }

      // 先判断是否有 attribute
      if (item?.attribute && item.attribute.length > 0) {
        // 显示属性框（可能也有iframe）
        uiState.setClickQueryData(data);
      } else if (item?.iframe && item?.iframe.length > 0) {
        // 显示 iframe
        let iframe = item.iframe;
        let firstIframe = iframe[0];
        let params: any = {
          type: "iframe",
          data: data?.feature,
          url: firstIframe.url,
          attr: firstIframe.attr,
        };
        uiState.setRvInfo(params);
      }
    });

    const map = getQMap()?.getMap();
    if (map) {
      map.on("move", (e: any) => {
        setClickQueryDataEve();
      });
      map.on("zoom", () => {
        setClickQueryDataEve();
      });
      map.on("click", () => {
        getQMap()?.geometryHighlightedLayer2.removeLayerAll();
      });
    }

    window.Evented.on("countModal", (obj: any) => {
      let data = obj.data[1];
      uiState.setShowCountModal(data);
    });

    window.Evented.on("onLoaction", (obj: any) => {
      onLoactionFunByChart(obj.data);
    });

    window.Evented.on("onSraech", (obj: any) => { });

    window.Evented.on("onCardClick", (obj: any) => {
      const { layerName, data } = obj;
      const attributes = AttributeConfig.getInstance().attributes;
      let attr = attributes.find((item: any) => item.source == layerName);

      if (attr && attr?.iframe?.length > 0) {
        let firstIframe = attr.iframe[0];
        let url = firstIframe.url;
        let paramsName = firstIframe.attr;
        let title = "";
        if (attr) {
          title = attr.title;
        }
        let _tt = data[paramsName];

        let _url = `${url}${_tt}`;
        let params: any = {
          type: "iframe",
          data: data,
          title,
          url: _url,
        };
        uiState.setRvInfo(params);
      } else {
        message.info("暂无数据");
      }
    });
  };

  // 部件定位
  const onLoactionFunByChart = (data: any) => {
    if (data.length > 1) {
      const node = data[0];
      const { queryData } = data[1];
      const { metaId, feature } = data[2];

      if (feature) {
        getQMap()?.locationGeometryNotA(feature.geometry);
        getQMap()?.geometryHighlightedLayer.addLayer(
          feature.geometry,
          undefined,
          feature.properties
        );
      } else if (queryData && metaId) {
        const children = node.target?.children;
        const innerText = children[0]?.innerText;


        if (innerText) {
          const _index = Number(innerText);
          const datas = queryData;
          const item = datas[_index];

          let params = {
            loadAttr: true,
            loadGeom: true,
            id: item?.oid,
            metaId: metaId,
          };

          let _url = `${datamg}/stobject/query`;
          axios
            .create()
            .post(_url, params)
            .then((res: any) => {
              if (res.data.status == 200) {
                const items = res.data.data.items;
                if (items.length > 0) {
                  const item = items[0];
                  let geom = item.geom;
                  if (geom) {
                    try {
                      let geometry = JSON.parse(geom);
                      getQMap()?.locationGeometryNotA(geometry);
                      getQMap()?.geometryHighlightedLayer.addLayer(
                        geometry,
                        undefined,
                        item.properties
                      );
                    } catch (error) { }
                  } else {
                    message.info("无位置信息");
                  }
                }
              }
            });
        }
      } else {
        message.info("无位置信息");
      }
    }
  };

  const setClickQueryDataEve = () => {
    const map = getQMap()?.getMap();
    const clickQueryData = uiState.clickQueryData;
    if (clickQueryData) {
      const lngLat = clickQueryData.eve.lngLat;
      const coordinate = [lngLat.lng, lngLat.lat];
      const point = map?.project(coordinate);
      uiState.setClickQueryDataEve(point);
    }
  };

  return null;
});
export default QueryView;
