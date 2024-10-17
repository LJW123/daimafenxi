import React, { useState, useEffect } from 'react'
import { observer } from 'mobx-react-lite'
import { IMAGE_PATH } from '@/config'

import styles from './styles.less'
import Data from '@/configs/pageConfig/data'
import Schema from '@/configs/pageConfig/schema'

import DataView from './DataView'

import MapLayerFilter from '@/configs/filter/maplayerfilter'
import MapState from '@/configs/filter/mapLayerState'
import FilterContainer from '@/configs/filter/filterContainer'
import leftMenu from '@/mobx/leftmenu'
import LeftMenu from '@/mobx/leftmenu'

const LeftView = observer((props: any) => {
  useEffect(() => {}, [])
  const pageConfig = Schema.getInstance()

  const pageStyle = pageConfig.pageStyle
  const leftPage = pageStyle.leftPage
  const style = leftPage.style

  const datas = pageConfig.datas
  const pageDatas = datas.pageDatas

  const [selMenu, setSelMenu] = useState<any>(null)

  const onClick_1Lv = (item: Data) => {
    if (selMenu?.title == item.title) {
      getDefaultItems(selMenu, 'delete')
      setSelMenu(item)
    } else {
      if (selMenu) {
        getDefaultItems(selMenu, 'delete')
      }
      setTimeout(() => {
        setSelMenu(item)
        getDefaultItems(item, 'add')
      }, 100)
    }

    // const leftClickEnterItem = uiState.leftClickEnterItem

    // if (leftClickEnterItem?.title == item.title) {
    //   getDefaultItems(leftClickEnterItem, "delete")
    //   uiState.setLeftClickEnterItem(null)
    // } else {
    //   if (leftClickEnterItem) {
    //     getDefaultItems(leftClickEnterItem, "delete")
    //   }
    //   setTimeout(() => {
    //     uiState.setLeftClickEnterItem(item)
    //     getDefaultItems(item, "add")
    //   }, 100);

    // }
  }

  // 加载默认选中
  const getDefaultItems = (data: any, op: any) => {
    let childs = data.childs

    childs.forEach((item: any) => {
      let metaId = item.metaId
      if (item.default) {
        const _title = `${item.metaId}_${item.title}`
        opMapLayers(item, _title, op)
      }
      let filter = item.filter
      filter.forEach((it: any) => {
        let attr = it.attr
        let _childs = it.childs
        _childs.forEach((t: any) => {
          if (t.default) {
            const _title = `${metaId}_${t.label}`
            opMapLayers(item, _title, op, {
              attr: attr,
              child: t,
            })
          }
        })
      })
    })
  }

  const opMapLayers = (
    item: Data,
    title: string,
    op: string,
    filterParams?: any
  ) => {
    console.log('item')

    item.queryMetas((num: number) => {
      let metaInfo = item.metaInfo
      let metaId = item.metaId
      if (!metaId) {
        let dataParams = item.dataParams
        metaId = dataParams.layerName
      }

      if (op == 'add') {
        const _title = `${metaId}_${item.title}`
        deleteMapLayer(item, _title, metaInfo)

        addMapLayer(item, title, metaInfo, filterParams)
      } else if (op == 'delete') {
        deleteMapLayer(item, title, metaInfo, filterParams)
      }

      FilterContainer.getInstance().toMap()
    })
  }

  const addMapLayer = (
    item: Data,
    title: string,
    metaInfo: any,
    filterParams?: any
  ) => {
    let maxzoom = item.maxzoom
    let minzoom = item.minzoom
    // 点击过滤
    MapState.getInstance().addMapLayerData({
      title: `${title}`,
      metaInfo: metaInfo,
      maxzoom: maxzoom,
      minzoom: minzoom,
      item: item,
      filterParams: filterParams,
    })
    /*     if (filterParams) {
    
          if (metaInfo) {
            MapLayerFilter.getInstance().createFilter(item.metaId, filterParams)
          } else {
            MapLayerFilter.getInstance().createFilter(item.dataParams.layerName, filterParams)
          }
    
    
        } */
  }

  const deleteMapLayer = (
    item: Data,
    title: string,
    metaInfo: any,
    filterParams?: any
  ) => {
    MapState.getInstance().deleteMapLayerData({
      title: `${title}`,
      metaInfo: metaInfo,
      item: item,
    })
    if (filterParams) {
      if (metaInfo) {
        MapLayerFilter.getInstance().clearFilter(item.metaId, filterParams)
      } else {
        MapLayerFilter.getInstance().clearFilter(
          item.dataParams.layerName,
          filterParams
        )
      }
    }
  }

  // 鼠标移入
  const onMouseEnter_1Lv = (item: Data, index: number) => {
    item.index = index
    LeftMenu.getInstance().setSelLeftClickItem(item)
    LeftMenu.getInstance().setMainMnueView(true)
  }
  // 鼠标移出
  const onMouseLeave_1Lv = () => {
    LeftMenu.getInstance().setMainMnueView(false)
  }

  return (
    <div
      className={styles.left_view}
      style={{
        ...style,
      }}
    >
      <div className={styles.list_data}>
        <div className={styles.up_view}>
          <img
            src={`${IMAGE_PATH}/left/up.png`}
            className={styles.up_img}
            onClick={(e) => {
              document.getElementById('menuList')?.scrollTo({
                top: 0,
                behavior: 'smooth',
              })
            }}
          />
        </div>

        <div className={styles.list_ul} id="menuList">
          {pageDatas &&
            pageDatas.map((item: Data, index: number) => {
              let imgPath = `${IMAGE_PATH}/left/${item.icon}`
              return (
                <div
                  key={`${index}_${item.title}`}
                  className={`${styles.list_li}`}
                  onClick={() => onClick_1Lv(item)}
                  onMouseEnter={() => onMouseEnter_1Lv(item, index)}
                  onMouseLeave={() => onMouseLeave_1Lv()}
                >
                  <div
                    className={`${styles.list_li_bg} ${
                      selMenu?.title == item.title ? styles.list_li_bg_sel : ''
                    }`}
                  ></div>

                  <img src={imgPath} alt="" className={styles.img_view} />
                  <div className={styles.list_li_title}>
                    <div>{item.title}</div>
                  </div>
                </div>
              )
            })}
        </div>

        <div className={styles.up_view}>
          <img
            src={`${IMAGE_PATH}/left/down.png`}
            className={styles.up_img}
            onClick={(e) => {
              document.getElementById('menuList')?.scrollTo({
                top: document.getElementById('menuList')?.scrollHeight,
                behavior: 'smooth',
              })
            }}
          />
        </div>
      </div>

      {LeftMenu.getInstance().isShow() && (
        <DataView opMapLayers={opMapLayers} />
      )}
    </div>
  )
})
export default LeftView
