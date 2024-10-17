import React, { useState, useEffect, useRef, useCallback } from 'react';
import { observer } from 'mobx-react-lite';

import styles from './styles.less';
import { IMAGE_PATH } from '@/config';
import { getQMap } from '@/plugin/qSpace/core';
import { conversionToDufenmiao, decimal } from '@/plugin/qSpace/util/helper';
const BottomView = observer((props: any) => {

  const legendList = [
    {
      title: '已建',
      icon: 't1.png'
    },
    {
      title: '在建',
      icon: 't2.png'
    },
    {
      title: '拟建',
      icon: 't3.png'
    },
    {
      title: '待确定',
      icon: 't4.png'
    }
  ];


  const MapCView = (props: any) => {
    const [cameraParms, setCameraParms] = useState<any>({});
    const [location, setLocation] = useState<any>(null);
    useEffect(() => {
      let qMap = getQMap();
      if (qMap) {
        let map = qMap.getMap();
        if (map) {
          map.on('mousemove', (e: any) => {
            let lngLat = e.lngLat;
            setLocation(lngLat);
          });

          map.on('render', () => {
            let parmas = getQMap()?.getCameraParms();
            setCameraParms(parmas);
          });
        }
      }
    }, []);

    return (
      <>
        <span style={{ marginRight: 16 }}>CGCS2000</span>
        <div>经度：{conversionToDufenmiao(location?.lng)}</div>
        <div>纬度：{conversionToDufenmiao(location?.lat)}</div>
        <div>方位角：{decimal(cameraParms?.bearing)}°</div>
        <div>俯仰角：{decimal(cameraParms?.pitch)}°</div>
        <div>级别：{decimal(cameraParms?.zoom)}</div>
        {/* <div>刷新时间：{updateNumber}s</div> */}
      </>
    );
  };

  return (
    <>
      {/* <div className={styles.legend_box}>
        <div className={styles.title_view}>图例</div>
        <div className={styles.list_view}>
          <img src={`${IMAGE_PATH}/legend/legend.png`} alt="" className={styles.img_view} />
        </div>
      </div> */}
      <div className={styles.bottom_view}>
        <MapCView />
      </div>
    </>
  );
})

export default BottomView;
