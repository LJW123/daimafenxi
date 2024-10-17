import React, { useState, useEffect, useRef, useCallback } from 'react';
import BaseMapView from './mapsView/baseMap/MapView';
import RollerMapView from './mapsView/rollerMap/MapView';
import MultiwindowMapView from './mapsView/multiwindowMap/MapView';
import LayerSwitch from './LayerSwitch';
import {
  getDataUrl,
  getGroupId,
  getPUBLIC_PATH,
  MapType,
  setDataUrl,
  setGroupId,
  setPUBLIC_PATH,
} from '../core';

import styles from './styles.less';

const MapControl: React.FC<{
  // 唯一值id
  mapid: string;
  // 绘制地图回调
  onLoadMap: any;
  //地图状态
  mapStatus?: MapType;
  //是否显示切换底图场景列表  右下角
  showLayerSwitch?: boolean;
  //是否初始化加载默认底图 showLayerSwitch为true时此值默认为true且传参无效
  loadDefaultLayer?: boolean;
  //组id
  groupId?: string | number;
  //平台工程id
  qProjectId?: string | number;
  //请求地址
  dataUrl: string;
  //静态路径
  public_path: string;
}> = ({
  mapid,
  onLoadMap,
  mapStatus,
  showLayerSwitch,
  loadDefaultLayer,
  groupId,
  qProjectId,
  dataUrl,
  public_path,
}) => {
  const _onLoadMap = onLoadMap;
  const _mapStatus = mapStatus || 'normal';
  const _showLayerSwitch =
    showLayerSwitch == undefined ? false : showLayerSwitch;
  let _loadDefaultLayer =
    loadDefaultLayer == undefined ? false : loadDefaultLayer;
  if (_showLayerSwitch) {
    _loadDefaultLayer = true;
  }

  if (!getDataUrl()) {
    setDataUrl(dataUrl);
  }

  const _mapid = mapid || '';
  const _groupId = groupId || null;
  const _qProjectId = qProjectId || null;

  if (!getGroupId()) {
    setGroupId(_groupId);
  }
  if (!getPUBLIC_PATH()) {
    setPUBLIC_PATH(public_path);
  }

  //地图加载完成
  const [mapLoad, setMapload] = useState<number>(0);

  const onLoadLayer = () => {
    if (_onLoadMap) _onLoadMap();
  };

  const a = { zIndex: 1, opacity: 1 };
  const b = { zIndex: -1, opacity: 0 };

  return (
    <div className={`${styles.map_view}`} id="q_map_view">
      {/* <QueryView mapLoad={mapLoad > 0} /> */}
      <div className={styles.b_map_view} style={_mapStatus == 'normal' ? a : b}>
        <BaseMapView
          mapid={_mapid}
          onLoadMap={() => {
            setMapload(1);
          }}
        />
      </div>
      <div className={styles.b_map_view} style={_mapStatus == 'roller' ? a : b}>
        {mapLoad > 0 && _mapStatus == 'roller' && (
          <RollerMapView
            mapid={_mapid}
            onLoadMap={() => {
              setMapload(2);
            }}
          />
        )}
      </div>
      <div
        className={styles.b_map_view}
        style={_mapStatus == 'multiwindow' ? a : b}
      >
        {mapLoad > 0 && _mapStatus == 'multiwindow' && (
          <MultiwindowMapView
            mapid={_mapid}
            onLoadMap={() => {
              setMapload(3);
            }}
          />
        )}
      </div>
      {mapLoad > 0 && (
        <LayerSwitch
          onLoadMap={onLoadLayer}
          showLayerSwitch={_showLayerSwitch}
          loadDefaultLayer={_loadDefaultLayer}
          groupId={_groupId}
          qProjectId={_qProjectId}
        />
      )}
    </div>
  );
};

export default MapControl;
