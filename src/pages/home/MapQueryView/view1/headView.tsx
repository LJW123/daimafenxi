import React, { useState, useEffect, useRef, useCallback } from 'react';
import { observer } from 'mobx-react-lite';

import styles from './styles.less';
import CustomIcon from '@/components/CustomIcon';
import { getQMap } from '@/plugin/qSpace/core';
import AttributeConfig from '@/configs/attributeConfig/attributeConfig';
import uiState from '@/mobx/ui';
const HeadView = observer((props: any) => {
  const showRiverRelation = props.showRiverRelation;
  const clickQueryData = props.clickQueryData;
  const attribute = clickQueryData ? AttributeConfig.getInstance().getAttribute(clickQueryData) : null
  const iframe = attribute?.iframe || [];


  const onClose = () => {
    getQMap()?.Evented.fire('mapQueryData', { data: null });
  }

  const onRelation = () => {
    let properties = clickQueryData?.feature.properties;
    let name = properties.NAME || properties['河流名'];
    uiState.setShowRiverName(name)
  }



  return (
    <div className={styles.head_view}>
      {iframe.map((item: any, index: any) => {

        let params: any = {
          type: 'iframe',
          data: clickQueryData?.feature,
          url: item.url,
          attr: item.attr,
        };
        return (
          <div key={index} className={styles.details} onClick={() => {
            uiState.setRvInfo(params)
          }}>{item.title}</div>
        )
      })
      }

      {/* 河流 */}
      {showRiverRelation &&
        <div className={styles.details} onClick={() => onRelation()}>河流关系</div>
      }

      <CustomIcon type='icon-guanbi2' className={styles.close_btn} onClick={onClose} />
    </div>
  );
})

export default HeadView;
