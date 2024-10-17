import { useEffect, useState } from "react";
import { observer } from "mobx-react-lite";

import uiState from "@/mobx/ui";
import { IMAGE_PATH, PUBLIC_PATH } from "@/config";

import LayersView from "./childView/layers";
// import IrrigatedView from "./childView/irrigated";
import ToolsView from "./childView/tools";
import BasemapView from "./childView/basemap";

import styles from './styles.less';
import { getQMap } from "@/plugin/qSpace/core";
import mapUi from "@/mobx/mapUi";
import RegionView from "./childView/region";
import QueryView from "./childView/queryView";
import Schema from "@/configs/pageConfig/schema";
import BasinView from "./childView/basinView";
import RiversView from "./childView/riversView";
import { decimal } from "@/plugin/qSpace/util/helper";
import { queryToolList } from "@/plugin/qSpace/mapboxEx/tool/toolList";
import Masking from "@/configs/masking";



const ToolsPageView = observer((props: any) => {

    const rightPageShow = uiState.rightPageShow
    const toolStatus = mapUi.toolStatus

    const pageConfig = Schema.getInstance()
    const pageStyle = pageConfig.pageStyle
    const rightPage = pageStyle.rightPage
    const style = rightPage.style

    let right = 10
    if (rightPageShow && uiState.leftClickEnterItem) {
        let w = style.width || 0
        right = w + 20
    } else {
        right = 10
    }

    const [selTool, setSelTool] = useState<any>(null);

    const [cameraParms, setCameraParms] = useState<any>({});
    useEffect(() => {
        let qMap = getQMap();
        if (qMap) {
            let map = qMap.getMap();
            if (map) {
                map.on('render', () => {
                    let parmas = getQMap()?.getCameraParms();
                    setCameraParms(parmas);
                });
            }
        }
    }, []);


    const setSelToolFn = (item: any, tool: any) => {
        if (item?.key === tool?.key) {
            setSelTool(null)
        } else {
            setSelTool(item)
        }
    }

    const toolsData = [
        {
            title: '搜索',
            icon: 'tool7-1.png',
            icon_c: 'tool7-2.png',
            children_bg: 'tool1bg.png',
            func: (item: any) => {
                setSelToolFn(item, selTool)
            },
            children: <QueryView />
        },
        // {
        //     title: '查询',
        //     alias: '移动查询',
        //     icon: 'tool7-1.png',
        //     icon_c: 'tool7-2.png',
        //     children_bg: 'tool1bg.png',
        //     func: (item: any) => {
        //         const tool = queryToolList.find((it: any) => it.name === 'moveQueryTool');
        //         if (tool) {
        //             if (toolStatus?.alias == '移动查询') {
        //                 getQMap()?.disableTool();
        //                 mapUi.setToolStatus(null)
        //             } else {
        //                 getQMap()?.activateTool(tool.name, {});
        //                 mapUi.setToolStatus(tool)
        //             }
        //         }
        //     },
        // },
        {
            title: '行政区划',
            icon: 'tool8-1.png',
            icon_c: 'tool8-2.png',
            children_bg: 'tool1bg.png',
            func: (item: any) => {
                setSelToolFn(item, selTool)
            },
            children: <RegionView />
        },
        {
            title: '河流关系',
            icon: 'tool11-1.png',
            icon_c: 'tool11-2.png',
            children_bg: 'tool1bg.png',
            func: (item: any) => {
                setSelToolFn(item, selTool)
            },
            children: <RiversView />
        },
        // {
        //     title: '流域定位',
        //     icon_c: 'tool10.png',
        //     icon: 'tool10-1.png',
        //     children_bg: 'tool1bg.png',
        //     func: (item: any) => {
        //         setSelToolFn(item, selTool)
        //     },
        //     children: <BasinView />
        // },
        // {
        //     title: '图层',
        //     icon_c: 'tool1.png',
        //     icon: 'tool11.png',
        //     children_bg: 'tool1bg.png',
        //     func: (item: any) => {
        //         setSelToolFn(item, selTool)
        //     },
        //     children: <LayersView />
        // },
        // {
        //     title: '灌区',
        //     icon: 'tool2.png',
        //     icon_c: 'tool21.png',
        //     children_bg: 'tool1bg.png',
        //     func: (item: any) => {
        //         setSelToolFn(item, selTool)
        //     },
        //     children: <IrrigatedView />
        // },

        {
            title: '工具',
            icon: 'tool3-1.png',
            icon_c: 'tool3-2.png',
            children_bg: 'tool1bg.png',
            func: (item: any) => {
                setSelToolFn(item, selTool)
            },
            children: <ToolsView />
        },
        {
            title: '底图',
            icon: 'tool4-1.png',
            icon_c: 'tool4-2.png',
            children_bg: 'tool1bg.png',
            func: (item: any) => {
                setSelToolFn(item, selTool)
            },
            children: <BasemapView />
        },
        {
            title: '场景复位',
            icon: 'tool12-1.png',
            icon_c: 'tool12-2.png',
            children_bg: 'tool1bg.png',
            func: (item: any) => {
                fetch(`${PUBLIC_PATH}configJson/疆域.geojson`).then(r => r.json()).then((res: any) => {
                    let geoData = res.features.find((it: any) => it.properties.DIST_NAME == '新疆维吾尔自治区')
                    if (geoData) {
                        const geometry = geoData.geometry
                        getQMap()?.locationGeometryNotA(geometry)
                        getQMap()?.geometryHighlightedLayer.addLayer(geometry);
                        Masking.getInstance().setSource(geometry)
                    }
                })

            },
        },

        // {
        //     title: '正北',
        //     icon_c: 'tool7.png',
        //     icon: 'tool71.png',
        //     children_bg: 'tool1bg.png',
        //     func: (item: any) => {
        //         let map = getQMap()?.getMap();
        //         map.resetNorthPitch({ duration: 1000 });
        //     },
        // },
        {
            title: '二三维切换',
            icon: 'tool6-1.png',
            icon_c: 'tool6-2.png',
            children_bg: 'tool1bg.png',
            func: (item: any) => {
                const is3d: boolean = getQMap()?.getIs3d() || false;
                getQMap()?.setIs3d(!is3d);
                getQMap()?.disableTool();
                mapUi.setToolStatus(null)
            },
        },

        {
            title: '全屏',
            icon: 'tool13-1.png',
            icon_c: 'tool13-2.png',
            children_bg: 'tool1bg.png',
            func: (item: any) => {
                // 判断是否全屏
                if (document.fullscreenElement) {
                    // 退出全屏
                    document.exitFullscreen()
                } else {
                    // 全屏展示
                    document.documentElement.requestFullscreen();
                }
            },
        },

        {
            title: '',
            icon: 'tool5-1.png',
            icon_c: 'tool5-2.png',
            func: () => {
                if (uiState.leftClickEnterItem) {
                    uiState.setRightPageShow(!rightPageShow)
                }
            }
        },
    ]

    toolsData.forEach((item: any, index: number) => {
        item.key = index + 1
    })
    return (
        <div
            className={styles.tools_page_view}
            style={{
                right: right
            }}
        >

            <div className={styles.list_data}>
                {
                    toolsData.map((item: any, index: number) => {
                        let sel = false

                        if (item.alias && toolStatus?.alias == item.alias) {
                            sel = true
                        } else if (item.key == selTool?.key) {
                            sel = true

                        }

                        const border_color = sel ? 'rgb(66,139,202)' : 'rgb(66,139,202)'
                        const bg_color = sel ? 'rgba(96, 176, 255, 0.3)' : 'rgba(0, 48, 94, 0.3)'
                        let icon = sel ? item.icon_c : item.icon
                        let transform = {}
                        if (!item.title) {

                            icon = rightPageShow && uiState.leftClickEnterItem ? item.icon_c : item.icon
                            // transform = {
                            //     transform: rightPageShow && uiState.leftClickEnterItem ? `rotateZ(0deg)` : `rotateZ(180deg)`
                            // }
                        }

                        const north = item.title == '正北'
                        let t_north = {}

                        if (north) {
                            t_north = {
                                transform: `rotateZ(${decimal(cameraParms?.bearing)}deg)`
                            }
                        }


                        return (
                            <div
                                key={index}
                                className={styles.list_li}
                                title={item.title}
                                style={{
                                    // backgroundImage: `url(${IMAGE_PATH}/tools/${icon_p})`,
                                    // border: `2px solid ${border_color}`,
                                    // background: bg_color,
                                    // borderRadius: "4px",
                                    // ...transform
                                }}
                                onClick={() => {
                                    if (item.func) {
                                        item.index = index;
                                        item.func(item)
                                    }
                                }}
                            >
                                <div
                                    className={styles.icon_view}
                                    style={{
                                        backgroundImage: `url(${IMAGE_PATH}/tools/${icon})`,
                                        ...t_north
                                    }}
                                ></div>
                            </div>
                        )
                    })
                }
            </div>


            {selTool && selTool.children && <div
                className={styles.item_up}
                style={{
                    top: selTool ? (selTool.index) * 44 : 0,
                    // backgroundImage: `url(${IMAGE_PATH}/tools/${selTool.children_bg})`,
                }}
            >
                {selTool.children}

            </div>}

        </div>
    )
})
export default ToolsPageView