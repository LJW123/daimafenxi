import React, { useState, useEffect, useRef, useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import { IMAGE_PATH } from '@/config';
import { getQMap, toolList } from '@/plugin/qSpace/core';

import styles from './styles.less';
import mapUi from '@/mobx/mapUi';
import { Modal } from 'antd';
import { Input } from 'antd';
import { conversionToDufenmiao } from '@/plugin/qSpace/util/helper';
const ToolsView = observer((props: any) => {
    // const [selTool, setSelTool] = useState<any>(null)
    useEffect(() => { }, []);
    const updateNum = mapUi.updateNum
    const mapStatus = mapUi.mapStatus
    const toolStatus = mapUi.toolStatus
    const measureToolList = toolList.measureToolList;
    const pickToolList = toolList.pickToolList;
    const queryToolList = toolList.queryToolList;

    useEffect(() => {
        if (!getQMap()?.getNowTool()) {
            mapUi.setToolStatus(null)
        }
    }, [updateNum]);

    const tools = [
        {
            name: '查询',
            alias: '移动查询',
            icon: 'c7-1.png',
            icon_sle: 'c7.png',
            func: () => {
                const tool = queryToolList.find((it: any) => it.name === 'moveQueryTool');
                if (tool) {
                    if (toolStatus?.alias == '移动查询') {
                        getQMap()?.disableTool();
                        mapUi.setToolStatus(null)
                    } else {
                        getQMap()?.activateTool(tool.name, {});
                        mapUi.setToolStatus(tool)
                    }
                }
            }
        },
        {
            name: '测距',
            alias: '测距',
            icon: 'c1-1.png',
            icon_sle: 'c1.png',

            func: () => {
                const tool = measureToolList.find((it: any) => it.name === 'measureExtentTool');
                if (tool) {
                    if (toolStatus?.alias == '测距') {
                        getQMap()?.disableTool();
                        mapUi.setToolStatus(null)
                    } else {
                        getQMap()?.activateTool(tool.name, {});
                        mapUi.setToolStatus(tool)
                    }
                }
            }
        },
        {
            name: '面积',
            alias: '测面积',
            icon: 'c2-1.png',
            icon_sle: 'c2.png',

            func: () => {
                const tool = measureToolList.find((it: any) => it.name === 'measureAreaTool');
                if (tool) {
                    if (toolStatus?.alias == '测面积') {
                        getQMap()?.disableTool();
                        mapUi.setToolStatus(null)
                    } else {
                        getQMap()?.activateTool(tool.name, {});
                        mapUi.setToolStatus(tool)
                    }
                }
            }
        },
        // {
        //     name: '卷帘',
        //     icon: 'c3-1.png',
        //     icon_sle: 'c3.png',
        //     func: () => {
        //         if (mapStatus == 'roller') {
        //             getQMap()?.setMapStatus('normal');
        //             mapUi.setMapStatus('normal');
        //         } else {
        //             getQMap()?.setMapStatus('roller');
        //             mapUi.setMapStatus('roller');
        //         }
        //     }
        // },
        {
            name: '坐标定位',
            icon: 'c4-1.png',
            icon_sle: 'c4.png',
            func: () => {
                setLocationVisible(true);
            }
        },
        {
            name: '坐标拾取',
            alias: '点坐标拾取',
            icon: 'c5-1.png',
            icon_sle: 'c5.png',
            func: () => {
                const tool = pickToolList.find(
                    (it: any) => it.name === 'pickPointTool',
                );
                if (tool) {
                    getQMap()?.activateTool(tool.name, {
                        fn: (data: any) => {
                            setPickData(data);
                            setPickVisible(true);
                        },
                    });
                }
            }
        },

        // {
        //     name: '查询',
        //     alias: '地图查询',
        //     icon: 'c7-1.png',
        //     icon_sle: 'c7.png',
        //     func: () => {
        //         const tool = queryToolList.find((it: any) => it.name === 'mapClickTool');
        //         if (tool) {
        //             if (toolStatus?.alias == '地图查询') {
        //                 getQMap()?.disableTool();
        //                 mapUi.setToolStatus(null)
        //             } else {
        //                 getQMap()?.activateTool(tool.name, {});
        //                 mapUi.setToolStatus(tool)
        //             }
        //         }
        //     }
        // },

        {
            name: '清除',
            icon: 'c6-1.png',
            icon_sle: 'c6.png',
            func: () => {
                let analysisCollection = getQMap()?.analysisCollection;
                if (analysisCollection) {
                    getQMap()?.clearAnalysisCollection();
                }
                getQMap()?.disableTool();
                mapUi.setToolStatus(null)
            }
        },
    ]


    // 坐标拾取
    const [pickVisible, setPickVisible] = useState<boolean>(false);
    const [pickData, setPickData] = useState<[number, number]>([0, 0]);


    // 坐标定位
    const [locationVisible, setLocationVisible] = useState<boolean>(false);
    const [locationData, setLocationData] = useState<[number, number]>([0, 0]);

    // #cce5ff
    return (
        <>
            <div className={styles.tools_view}>

                <div className={styles.tools_head}>工具包</div>

                <div className={styles.tools_content}>
                    {tools.map((item: any, index: any) => {
                        let sel = false

                        if (item.alias && toolStatus?.alias == item.alias) {
                            sel = true
                        }

                        if (item.name == '卷帘') {
                            sel = mapStatus == 'roller'
                        }

                        let imgPath = sel ? `${IMAGE_PATH}/tools/${item.icon_sle}` : `${IMAGE_PATH}/tools/${item.icon}`

                        return (
                            <div
                                key={index}
                                className={`${styles.tools_li} ${sel ? styles.tools_li_sle : ""}`}
                                onClick={() => {
                                    if (item.func) {
                                        item.func()
                                    }
                                }}
                            >
                                <img
                                    key={index}
                                    src={imgPath}
                                    alt=""
                                    className={`${styles.img_view}`}
                                    title={item.name}

                                />
                                {/* <div className={styles.name}>{item.name}</div> */}
                            </div>
                        )
                    })}
                </div>


            </div>
            <Modal
                title={'坐标定位'}
                open={locationVisible}
                destroyOnClose={true}
                // getContainer={false}
                onOk={() => {
                    let _obj: any = {
                        center: locationData,
                        zoom: 12,
                        pitch: 0,
                        bearing: 0,
                    };
                    getQMap()?.getMap().flyTo(_obj);

                    setLocationVisible(false);
                }}
                onCancel={() => {
                    setLocationVisible(false);
                }}
            >
                <div style={{ color: '#fff' }}>
                    <div>
                        <div>经度：</div>
                        <div>
                            <Input
                                onChange={(e: any) => {
                                    let val = e.target.value;
                                    let _locationData: [number, number] = [...locationData];
                                    _locationData[0] = Number(val);
                                    setLocationData(_locationData);
                                }}
                            />
                        </div>
                    </div>
                    <div>
                        <div>纬度：</div>
                        <div>
                            <Input
                                onChange={(e: any) => {
                                    let val = e.target.value;
                                    let _locationData: [number, number] = [...locationData];
                                    _locationData[1] = Number(val);
                                    setLocationData(_locationData);
                                }}
                            />
                        </div>
                    </div>
                </div>
            </Modal>
            <Modal
                title={'坐标拾取结果'}
                open={pickVisible}
                destroyOnClose={true}
                // getContainer={false}
                footer={null}
                onCancel={() => {
                    getQMap()?.clearTemporaryCollection();
                    setPickVisible(false);
                }}
            >
                <div style={{ color: '#fff' }}>
                    <div>
                        <div>
                            经纬度：{pickData[0]} , {pickData[1]}
                        </div>
                        <div>
                            经纬度（度分秒）：{conversionToDufenmiao(pickData[0])} ,{' '}
                            {conversionToDufenmiao(pickData[1])}
                        </div>
                    </div>
                </div>
            </Modal>
        </>




    )
})

export default ToolsView;
