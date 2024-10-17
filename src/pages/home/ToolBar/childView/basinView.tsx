import React, { useState, useEffect, useRef, useCallback } from 'react';
import { observer } from 'mobx-react-lite';

import styles from './styles.less';
import { datamg, liuyuId } from '@/common';
import axiosFn from '@/server/axios';
import { message } from 'antd';
import { getQMap } from '@/plugin/qSpace/core';
const BasinView = observer((props: any) => {

  const [dataList, setDataList] = useState<any>([]);


  useEffect(() => {
    initData()
  }, []);

  const initData = async () => {
    let res: any = await queryStobject();
    if (res.data.status == 200) {
      let items = res.data.data.items;
      setDataList(items)
    }
  }


  const queryStobject = (obj?: any) => {
    let params = {
      loadAttr: true,
      loadGeom: false,
      metaId: liuyuId,
      ...obj,
    }

    let url = `${datamg}/stobject/query`;
    return axiosFn.commonPost(url, params)
  }

  const onClickItem = async (item: any) => {
    let params = {
      loadGeom: true,
      id: item.id
    }
    let res: any = await queryStobject(params);
    if (res.data.status == 200) {
      let item = res.data.data.items[0];
      let geom = item.geom;
      if (geom) {
        const qmap = getQMap();
        let geometry = JSON.parse(item.geom)
        qmap?.locationGeometryNotA(geometry)
        qmap?.geometryHighlightedLayer.addLayer(geometry);
      } else {
        message.info("该数据无位置信息")
      }
    }
  }

  return (
    <div className={styles.basin_view}>
      <div className={styles.list_title}>
        <div>流域名称</div>
      </div>
      <div className={styles.list_body}>
        {dataList.map((item: any) => {
          return (
            <div onClick={() => onClickItem(item)} key={item.id} className={styles.item_view}>
              <div>{item.name}</div>
            </div>
          )
        })
        }
      </div>
    </div>
  );
})

export default BasinView;
