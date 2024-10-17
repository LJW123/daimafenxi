import React, { useState, useEffect, useRef, useCallback } from 'react';
import { getQMap, RollerQMaps } from '../../../core';

const CompareMapView = (props: any) => {
  const _onLoadMap = props.onLoadMap;
  const mapid = props.mapid;
  const container = `${mapid}_compare_mapbox_view` || 'compare_mapbox_view';

  const mapEl: any = useRef(null);
  useEffect(() => {
    return () => {
      getQMap(mapid)?.rollerQMap?.remove();
      getQMap(mapid)?.setRollerQMap(null);
    };
  }, []);

  const initMap = () => {
    let rollerQMaps = new RollerQMaps(container, () => {
      let qmap = getQMap();
      if (qmap) {
        const baseScene = qmap.getBaseScene();
        rollerQMaps.setBaseScene(baseScene?.baseScene);

        const businessScene = qmap.getBusinessScene();
        for (let index = 0; index < businessScene.length; index++) {
          const business = businessScene[index];
          rollerQMaps.addBusinessScene(business?.baseScene);
        }
        qmap.setRollerQMap(rollerQMaps);
      }
      if (_onLoadMap) _onLoadMap();
    });
  };

  useEffect(() => {
    if (mapEl) {
      initMap();
    }
  }, [mapEl]);
  return (
    <div
      id={container}
      ref={mapEl}
      style={{ width: '100%', height: '100%', position: 'relative' }}
    >
      <div
        id="roller_map_1"
        style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 }}
      ></div>
      <div
        id="roller_map_2"
        style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 }}
      ></div>
    </div>
  );
};
export default CompareMapView;
