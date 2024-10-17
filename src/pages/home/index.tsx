import React, { useState, useEffect, useRef, useCallback } from 'react'
import { observer } from 'mobx-react-lite'
import { IMAGE_PATH, PUBLIC_PATH } from '@/config'
import { datamg, dataUrl, groupId, qProjectId } from '@/common'
import uiState from '@/mobx/ui'
import mapUi from '@/mobx/mapUi'

import MapboxExView from '@/plugin/qSpace/mapboxEx/MapboxEx'
import QueryView from './Query'
// import LeftView from './components/leftPage/view1';
// import LeftView from './components/leftPage/view2';
// import LeftView from './MainNav/view3';
import LeftView from './MainNav/view4'

import RightView from './components/rightPage/view1'
// import RightView from './components/rightPage/view2';
import BottomView from './BottomBar/view2'
import ToolsPageView from './ToolBar'
import RollerView from './components/roller'
import CountModal from './components/countModal'
import QueryDataView from './MapQueryView/index'
import styles from './styles.less'
import Schema from '@/configs/pageConfig/schema'
import ModalViewRiver from './RiverFlowView'
import { getQMap } from '@/plugin/qSpace/core'
import Masking from '@/configs/masking'
import RiverInfoModel from './components/riverInfoModel'
import { queryToolList } from '@/plugin/qSpace/mapboxEx/tool/toolList'
// import FullScreenView from './components/modelView_river/fullScreen';

const HomePageView = observer((props: any) => {
  //地图加载完成
  const [mapLoad, setMapload] = useState<boolean>(false)

  const onLoadMap = () => {
    setMapload(true)
    const tool = queryToolList.find((it: any) => it.name === 'moveQueryTool')
    if (tool) {
      getQMap()?.activateTool(tool.name, {})
      mapUi.setToolStatus(tool)
    }

    getJy()
  }

  const getJy = () => {
    // fetch(`${PUBLIC_PATH}configJson/疆域.geojson`)
    //   .then((r) => r.json())
    //   .then((res: any) => {
    //     uiState.setJyData(res)
    //     let geoData = res.features.find(
    //       (it: any) => it.properties.DIST_NAME == '新疆维吾尔自治区'
    //     )
    //     if (geoData) {
    //       const geometry = geoData.geometry
    //       getQMap()?.geometryHighlightedLayer.addLayer(geometry)
    //       Masking.getInstance().setSource(geometry)
    //     }
    //   })
  }

  const mapStatus = mapUi.mapStatus

  const pageConfig = Schema.getInstance()
  const pageStyle = pageConfig.pageStyle
  const mainPage = pageStyle.mainPage
  const bgImage = mainPage.bgImage

  return (
    <div className={styles.home_page_view}>
      <div
        className={styles.ztsj_view}
        style={{
          backgroundImage: `url(${IMAGE_PATH}/${bgImage})`,
        }}
      >
        <QueryView mapLoad={mapLoad} />
        <MapboxExView
          mapid={'home'}
          groupId={groupId}
          qProjectId={qProjectId}
          onLoadMap={onLoadMap}
          dataUrl={dataUrl}
          public_path={PUBLIC_PATH}
          mapStatus={mapStatus}
        />

        {mapLoad && mapStatus == 'normal' && (
          <>
            <LeftView />
            <RightView />
            <BottomView />
            <ToolsPageView />
            <QueryDataView />
          </>
        )}

        <CountModal />
        {mapLoad && mapStatus == 'roller' && (
          <>
            <RollerView />
          </>
        )}

        {mapLoad && (
          <>
            <ModalViewRiver />
            {/* <FullScreenView /> */}
            <RiverInfoModel />
          </>
        )}
      </div>
    </div>
  )
})
export default HomePageView
