import React, { useState, useEffect, useRef, useCallback } from 'react';
import { observer } from 'mobx-react-lite';

import styles from "./styles.less";
const RiverContent = observer((props: any) => {

    const titleList = [
        "汇总",
        "河流",
        "水库",
        "视频点",
        "汇合点",
        "取水口",
        "在建工程",
    ] 

    const [tabTitle, setTabTitle] = useState<string>(titleList[0]);


    return (
        <div className={styles.river_info_model}>
            <div className={styles.left_info}></div>
            <div className={styles.content}>
                <div className={styles.tabs_tit}>
                    {
                        titleList.map((item, index) => (
                            <div
                                onClick={() => {
                                    setTabTitle(item)
                                }}
                                key={index}
                                className={`${styles.tabs_item} ${item == tabTitle ? styles.tabs_item_active : ''}`}>
                                {item}
                            </div>
                        ))
                    }
                </div>
                <div className={styles.chart_con}></div>
                <div className={styles.statistics}></div>
            </div>
        </div>
    )
})

export default RiverContent;
