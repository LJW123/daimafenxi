import React, { useState, useEffect, useRef, useCallback } from 'react';
import { getQMap, MultiwindowQMaps } from '../../../core';
import { PlusOutlined } from '@ant-design/icons';

let multiwindowMapList = [
  {
    mapId: 'multiwindow_map_1',
    styleObj: {
      top: '0',
      left: '0',
      right: '50%',
      bottom: '50%',
      borderRight: '1px solid #333',
      borderBottom: '1px solid #333',
    },
  },
  {
    mapId: 'multiwindow_map_2',
    styleObj: {
      top: '0',
      left: 'calc(50% + 1px)',
      right: '0',
      bottom: '50%',
      borderLeft: '1px solid #333',
      borderBottom: '1px solid #333',
    },
  },
  {
    mapId: 'multiwindow_map_3',
    styleObj: {
      top: 'calc(50% + 1px)',
      left: '0',
      right: '50%',
      bottom: '0',
      borderRight: '1px solid #333',
      borderTop: '1px solid #333',
    },
  },
  {
    mapId: 'multiwindow_map_4',
    styleObj: {
      top: 'calc(50% + 1px)',
      left: 'calc(50% + 1px)',
      right: '0',
      bottom: '0',
      borderLeft: '1px solid #333',
      borderTop: '1px solid #333',
    },
  },
];

const MultiwindowMapView = (props: any) => {
  const _onLoadMap = props.onLoadMap;
  const mapid = props.mapid;
  const container =
    `${mapid}_multiwindow_mapbox_view` || 'multiwindow_mapbox_view';

  const [haveMouse, setHaveMouse] = useState<any>({
    mouseTop: 0,
    mouseleft: 0,
    mapId: '',
  });

  useEffect(() => {
    return () => {
      getQMap(mapid)?.multiwindowQMap?.remove();
      getQMap(mapid)?.setMultiwindowQMap(null);
    };
  }, []);

  const initMap = () => {
    let multiwindowMaps = new MultiwindowQMaps(multiwindowMapList, () => {
      let qmap = getQMap();
      if (qmap) {
        const baseScene = qmap.getBaseScene();
        multiwindowMaps.setBaseScene(baseScene?.baseScene);

        const businessScene = qmap.getBusinessScene();
        for (let index = 0; index < businessScene.length; index++) {
          const business = businessScene[index];
          multiwindowMaps.addBusinessScene(business?.baseScene);
        }
        qmap.setMultiwindowQMap(multiwindowMaps);
        if (_onLoadMap) _onLoadMap();
      }
    });
  };

  useEffect(() => {
    initMap();
  }, []);

  const onMouseMove = (e: any, mapId: string, hMouse: any) => {
    let nativeEvent = e.nativeEvent;
    let top = nativeEvent.layerY;
    let left = nativeEvent.layerX;

    let multiwindowMaps = getQMap()?.getMultiwindowQMap();
    if (multiwindowMaps) {
      multiwindowMaps.addSyncEvent(mapId, hMouse);
    }

    setHaveMouse({
      mouseTop: top,
      mouseleft: left,
      mapId: mapId,
    });
  };

  return (
    <div
      id={container}
      style={{ width: '100%', height: '100%', position: 'relative' }}
    >
      {multiwindowMapList.map((it: any) => {
        return (
          <div
            key={it.mapId}
            id={it.mapId}
            style={Object.assign(
              {
                position: 'absolute',
              },
              it.styleObj,
            )}
            onMouseMove={(e) => onMouseMove(e, it.mapId, haveMouse)}
          >
            {haveMouse.mapId !== it.mapId && (
              <PlusOutlined
                style={{
                  position: 'absolute',
                  top: haveMouse.mouseTop - 15,
                  left: haveMouse.mouseleft - 15,
                  zIndex: 2000,
                  fontSize: '30px',
                  color: '#00ff00',
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};
export default MultiwindowMapView;
