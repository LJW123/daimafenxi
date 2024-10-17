import React, { useState, useEffect, useRef, useCallback } from 'react';

import styles from './styles.less';

const ResultView = (props: any) => {
  const data = props.data || [];
 
  return (
    <div className={styles.results_view}>
      {data.map((item: any, index: any) => {
        return (
          <div key={index} className={styles.result_item}>
            <span>{item.name}</span>
          </div>
        )
      })
      }
    </div>
  );
};
export default ResultView;
