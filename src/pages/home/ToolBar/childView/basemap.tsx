import React, { useState, useEffect, useRef, useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import groupSpace from '@/mobx/groupSpace';
import { queryBasicmapList } from '@/plugin/qSpace/mapboxEx/func';
import { BaseScene, getQMap } from '@/plugin/qSpace/core';

import styles from './styles.less';
import { imgUrl } from '@/common';
import { IMAGE_PATH } from '@/config';
const BasemapView = observer((props: any) => {

  const [sceneList, setSceneList] = useState<any>([]);
  const [selectScene, setSelectScene] = useState<string>();

  useEffect(() => {
    const _bs = getQMap()?.getBaseScene();
    setSelectScene(_bs?.id)
  }, [])

  useEffect(() => {
    const gpId = groupSpace.getGroup();
    if (gpId) {
      queryBasicmapList(gpId, (items: any[]) => {
        setSceneList(items);
      });
    }
  }, []);


  const onClickItem = (scene: any) => {
    if (!scene) {
      getQMap()?.setBaseScene();
      return;
    }
    const item = { ...scene };
    getQMap()?.setBaseScene(item);
    const bs = getQMap()?.getBaseScene();
    setSelectScene(bs?.id);
  };


  return (
    <div className={styles.basemap_view}>
      {sceneList.map((item: any) => {
        let isShow = item.id == selectScene;

        return (
          <div
            key={item.id}
            className={`${styles.menu_li} ${isShow ? styles.li_click : ''}`}
            onClick={() => onClickItem(item)}
          >
            <div className={styles.li_img}>
              {item.icon ? (
                <img src={`${imgUrl}/${item.icon}`} alt="" />
              ) : (
                <img src={`${IMAGE_PATH}/vector.jpg`} alt="" />
              )}
            </div>
            <div className={styles.li_tit}>{item.name}</div>
          </div>
        )
      })}
    </div>
  );
})

export default BasemapView;
