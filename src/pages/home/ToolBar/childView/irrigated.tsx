import React, { useState, useEffect, useRef, useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import { Collapse } from 'antd';
import type { TreeDataNode, TreeProps } from 'antd';

import styles from './styles.less';
import { Tree } from 'antd';
const IrrigatedView = observer((props: any) => {
  useEffect(() => { }, []);

  const metaList = [
    {
      title: '灌域',
      metaId: '1779103202940480',
      metaName: "灌域边界84"
    },
    {
      title: '干渠灌域',
      metaId: '1780513674176064',
      metaName: "干渠灌域",
      children:[]
    },
    {
      title: '干渠',
      metaId: '1778691338298944',
      metaName: "渠道_Polyline",
      children:[]
    },
    {
      title: '沟道',
      metaId: '1778757486265920',
      metaName: "沟道_Polyline",
      children:[]
    },
  ];


  const onExpand = (expandedKeysValue: any) => {
  };


  return (
    <div className={styles.irrigated_view}>
      <Tree
        checkable
        treeData={metaList}
        fieldNames={{
          title: "title",
          key: "metaId",
          children: "children"
        }}
        onExpand={onExpand}
      />
    </div>
  );
})

export default IrrigatedView;
