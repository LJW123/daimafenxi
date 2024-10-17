import React, { useState, useEffect, useRef, useCallback } from 'react';
import { setQMap, QMapModel, getQMap, BaseQMap } from '../../../core';
import { addImage, createSelectSvg } from '../../func';

const BaseMapView = (props: any) => {
  const _onLoadMap = props.onLoadMap;
  const mapid = props.mapid;
  const container = `${mapid}_base_map_view` || 'base_map_view';

  const mapEl: any = useRef(null);
  //地图加载完成
  const [mapLoad, setMapload] = useState(false);

  // 监听页面大小变化
  useEffect(() => {
    window.addEventListener('resize', mapResize);
    return () => {
      window.removeEventListener('resize', mapResize);

      setQMap(mapid, null);
    };
  }, []);

  // 刷新地图大小
  let mapResize = useCallback(() => {
    if (mapLoad) {
      getQMap()?.map.resize();
    }
  }, [mapLoad]);

  // 监听地图使用div
  useEffect(() => {
    if (mapEl) {
      initMap();
    }
  }, [mapEl]);

  // 初始化地图
  const initMap = () => {
    let _qMap = new BaseQMap(container);
    _qMap.map.on('load', (e: any) => {
      _qMap.resize();

      addImage(_qMap.map, () => {
        // 添加默认的选中框
        createSelectSvg(_qMap.map);

        // 设置氛围
        _qMap.map.setFog({
          color: 'rgb(255, 255, 255)',
          // color: 'rgb(186, 210, 235)',
          'high-color': 'rgb(36, 92, 223)',
          'horizon-blend': 0.02,
          'space-color': 'rgb(11, 11, 25)',
          'star-intensity': 0.6,
        });

        let qMapModel = new QMapModel(mapid, _qMap);

        setQMap(mapid, qMapModel);
        setMapload(true);
        if (_onLoadMap) _onLoadMap();
      });
    });
  };

  return (
    <div
      id={container}
      ref={mapEl}
      style={{ width: '100%', height: '100%' }}
    ></div>
  );
};

export default BaseMapView;
