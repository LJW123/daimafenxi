import React, { useState, useEffect, useRef } from 'react';
import { Dropdown } from 'antd';
import type { MenuProps } from 'antd';
import {
  getQMap,
  BaseScene,
  defBaseStyle,
  noneBaseStyle,
  queryBasicmapList,
  importProject,
  getDataUrl,
} from '../core';

import vectorImg from '../images/vector.jpg';
import rasterImg from '../images/raster.jpg';

import styles from './styles.less';

const LayerSwitch = (props: any) => {
  const _onLoadMap = props.onLoadMap;

  const _groupId = props.groupId;
  const _qProjectId = props.qProjectId;

  const _showLayerSwitch = props.showLayerSwitch;
  const _loadDefaultLayer = props.loadDefaultLayer;

  const imgUrl = `${getDataUrl()}/image`;

  const [sceneList, setSceneList] = useState<any>([]);
  const [selectScene, setSelectScene] = useState<BaseScene>();

  useEffect(() => {
    if (_groupId && _showLayerSwitch) {
      queryBasicmapList(_groupId, (items: any[]) => {
        setSceneList(items);
      });
    }
  }, [_groupId]);

  useEffect(() => {
    if (_qProjectId) {
      importProject(_qProjectId, () => {
        if (_onLoadMap) _onLoadMap();
        const bs = getQMap()?.getBaseScene();
        setSelectScene(bs);
      });
    } else {
      if (_loadDefaultLayer) {
        onClickItem(defBaseStyle);
      }
      if (_onLoadMap) _onLoadMap();
    }
  }, [_qProjectId]);

  const onClickItem = (scene: any) => {
    if (!scene) {
      getQMap()?.setBaseScene();
      return;
    }
    const item = { ...scene };
    getQMap()?.setBaseScene(item);
    const bs = getQMap()?.getBaseScene();
    setSelectScene(bs);
    getQMap()?.Evented.fire('updateNum', {});
  };

  if (!_showLayerSwitch) return null;
  let items: any = sceneList.map((item: any) => ({
    key: item.id,
    label: (
      <div
        className={`${styles.menu_li} ${
          item.id === selectScene?.id ? styles.li_click : ''
        }`}
        onClick={() => onClickItem(item)}
      >
        <div className={styles.li_img}>
          {item.icon ? (
            <img src={`${imgUrl}/${item.icon}`} alt="" />
          ) : (
            <img src={vectorImg} alt="" />
          )}
        </div>
        <div className={styles.li_tit}>{item.name}</div>
      </div>
    ),
  }));

  if (items)
    items.push({
      key: '11',
      label: (
        <div
          className={`${styles.menu_li} ${
            selectScene?.id === '11' ? styles.li_click : ''
          }`}
          onClick={() => onClickItem(defBaseStyle)}
        >
          <div className={styles.li_img}>
            <img src={vectorImg} alt="" />
          </div>
          <div className={styles.li_tit}>默认</div>
        </div>
      ),
    });

  if (items)
    items.push({
      key: '00',
      label: (
        <div
          className={`${styles.menu_li} ${
            selectScene?.id === '00' ? styles.li_click : ''
          }`}
          onClick={() => onClickItem(noneBaseStyle)}
        >
          <div className={styles.li_img}>
            <img src={vectorImg} alt="" />
          </div>
          <div className={styles.li_tit}>无</div>
        </div>
      ),
    });
  return (
    <div className={styles.layers_switch}>
      <Dropdown
        menu={{ items: items }}
        arrow={true}
        getPopupContainer={(triggerNode:any) => triggerNode}
        trigger={['click']}
        placement="topRight"
        overlayClassName={`${styles.menu_list}`}
      >
        <div className={styles.surface}>
          <img src={rasterImg} alt="" />
        </div>
      </Dropdown>
    </div>
  );
};
export default LayerSwitch;
