import React, { useState, useEffect, useRef, useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import { history } from 'umi';

import { IMAGE_PATH } from '@/config';
import { systemTitle } from '@/common';
import uiState from '@/mobx/ui';
import styles from './styles.less';
import Schema from '@/configs/pageConfig/schema';

const HeaderView = observer((props: any) => {

  const pageConfig = Schema.getInstance()
    const pageStyle = pageConfig.pageStyle
    const headerPage = pageStyle.headerPage
    const bgImage = headerPage.bgImage
    const style = headerPage.style


    const headerClickItem = uiState.headerClickItem;
    const headerClickItemTitle = headerClickItem?.title;

    const headerData = [
        {
            "icon": "",
            "title": "专题数据",
            "path": '/index'
        },
        {
            "icon": "",
            "title": "历史数据",
            "path": '/history'
        },
        {
            "icon": "",
            "title": "操作手册",
        },
        {
            "icon": "",
            "title": "执行记录",
            "path": '/runrecord'
        }
    ]

    useEffect(() => {
        uiState.setHeaderClickItem(headerData[0])
    }, []);


    const onClick = (item: any) => {
        uiState.setHeaderClickItem(item)

        if (item.path) {
            history.push(item.path);
        }
    }


    return (
        <div
            className={styles.header_view}
            style={{
                backgroundImage: `url(${IMAGE_PATH}/${bgImage})`,
                ...style
            }}
        >
            <div className={styles.system_title}>{systemTitle}</div>

            <div className={styles.system_tabs}>
                {headerData.map((item: any) => {
                    let isSel = headerClickItemTitle == item.title;
                    let img = isSel ? "head_tabs_sel.png" : "head_tabs.png";

                    return (
                        <span
                            key={item.title}
                            className={styles.tabs_item}
                            style={{
                                backgroundImage: `url(${IMAGE_PATH}/${img})`,
                            }}
                            onClick={() => onClick(item)}
                        >{item.title}</span>
                    )
                })
                }
            </div>
        </div>


    )
})
export default HeaderView;
