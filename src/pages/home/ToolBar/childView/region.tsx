import React, { useState, useEffect, useRef, useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import styles from './styles.less';
import { cityId, countyId, datamg } from '@/common';
import axiosFn from '@/server/axios';
import { Tree } from 'antd';
import { getQMap } from '@/plugin/qSpace/core';
import QueryConfig from '@/configs/queryConfig/queryConfig';
import uiState from '@/mobx/ui';
import Masking from '@/configs/masking';
import FilterContainer from '@/configs/filter/filterContainer';
import { toJS } from 'mobx';
import { Input } from 'antd';
const { Search } = Input;
const RegionView = observer((props: any) => {
  const [searchData, setSearchData] = useState<any>(null)
  const [selData, setSelData] = useState<any>(null)

  const regionTreeData = uiState.regionTreeData
  const jyData = uiState.jyData
  useEffect(() => {
    if (regionTreeData) {

    } else {
      initData()

    }
  }, []);

  const initData = async () => {
    const jyRes: any = toJS(jyData)
    const cityRes: any = await queryStobject(cityId);
    if (cityRes.data.status == 200 && jyRes) {
      const cityList = cityRes?.data?.data?.items || [];

      let cc = jyRes.features.filter((it: any) => it.properties.DIST_NAME != '新疆维吾尔自治区')
      const root = {
        title: '新疆维吾尔自治区',
        key: '新疆维吾尔自治区',
        geoData: jyRes.features.find((it: any) => it.properties.DIST_NAME == '新疆维吾尔自治区'),
        children: cc.map((it: any) => {
          return {
            title: it.properties.DIST_NAME,
            key: `${it.properties.DIST_NAME}`,
            geoData: it,
            children: cityList.filter((tt: any) => tt.attributes.ADNT == it.properties.DIST_NAME).map((item: any) => {
              return {
                oldData: { ...item },
                title: item.attributes.DIST_NAME,
                key: item.id
              }
            })
          }
        })
      }
      uiState.setRegionTreeData([root])
    }
  }

  const queryStobject = (metaId: any) => {
    let params = {
      loadAttr: true,
      loadGeom: false,
      metaId: metaId
    }

    let url = `${datamg}/stobject/query`;
    return axiosFn.commonPost(url, params);
  }

  // 根据 市code 查询县
  const queryCounty = (code: any) => {
    let params = {
      "metaId": countyId,
      "sType": "query",
      "whereCondition": {
        "conditionType": "leaf",
        "fieldName": "atts.count_code",
        "opType": "rlike",
        "value": code,
        "fieldType": 9
      },
      "rType": "json"
    }
    let url = `${datamg}/insights/query/data`
    return axiosFn.commonPost(url, params)
  }

  const onLoadData = (e: any) => {

    let key = e.key;
    let children = e.children;
    let oldData = e.oldData;
    let code = `${oldData.attributes.DIST_CODE}`;
    let simpleCode = code.substring(0, 4);

    return new Promise<void>((resolve) => {
      if (children) {
        resolve();
        return;
      }

      queryCounty(simpleCode).then((res: any) => {
        let data = res.data;
        let childrenData = data.map((item: any) => {
          return {
            title: item.count_name,
            key: `${key}-${item.oid}`,
            isLeaf: true,
            oldData: { from: countyId, id: item.oid, ...item },

          }
        })
        const _treeData = updateTreeData(regionTreeData, key, childrenData)
        uiState.setRegionTreeData(_treeData)

        resolve();
      })
    })
  };

  const updateTreeData = (list: any, key: any, children: any): any =>
    list.map((node: any) => {
      if (node.key === key) {
        return {
          ...node,
          children,
        };
      }
      if (node.children) {
        return {
          ...node,
          children: updateTreeData(node.children, key, children),
        };
      }
      return node;
    });


  const onSelect = (selectedKeys: any, e: any) => {
    uiState.setSelectedRegion(selectedKeys)

    const node = e.node;
    const selected = e.selected;
    const value = node.title;
    const oldData = node.oldData ? toJS(node.oldData) : null;
    const geoData = node.geoData ? toJS(node.geoData) : null;
    const children = node.children ? toJS(node.children) : [];
    const isLeaf = node.isLeaf;


    let dataType = 'city';
    if (isLeaf) {
      dataType = "county"
    } else if (oldData) {
      dataType = "city"
    }

    getQMap()?.geometryHighlightedLayer.removeLayerAll();
    if (selected) {

      if (geoData) {
        const geometry = geoData.geometry
        getQMap()?.locationGeometryNotA(geometry)
        getQMap()?.geometryHighlightedLayer.addLayer(geometry);
        Masking.getInstance().setSource(geometry)

        let dValue: string[] = []
        children.forEach((item: any) => {
          if (item.geoData) {
            item.children.forEach((it: any) => dValue.push(it.title))
          } else {
            dValue.push(item.title)
          }
        })

        FilterContainer.getInstance().setDistricts({
          dKey: dataType,
          dValue: dValue
        })
      } else {
        const id = oldData.id;
        const from = oldData.from;
        const params = {
          loadAttr: true,
          loadGeom: true,
          metaId: from,
          id: id
        }
        const url = `${datamg}/stobject/query`;
        axiosFn.commonPost(url, params).then((res: any) => {
          let items = res.data.data.items || []
          if (items.length > 0) {
            const item = items[0];
            const geometry = JSON.parse(item.geom)
            getQMap()?.locationGeometryNotA(geometry)
            getQMap()?.geometryHighlightedLayer.addLayer(geometry);
            Masking.getInstance().setSource(geometry)
            FilterContainer.getInstance().setDistricts({
              dKey: dataType,
              dValue: value
            })
          }
        })
      }
    } else {
      Masking.getInstance().setSource()
      FilterContainer.getInstance().setDistricts({
        dKey: '',
        dValue: ''
      })
    }
  }

  // 市、县搜索
  const onSearch = async (value: any) => {

    if (value) {
      let city = QueryConfig.getInstance().getFieldName('行政区划', 'city')
      let county = QueryConfig.getInstance().getFieldName('行政区划', 'county')

      let params = {
        // "metaId": countyId,
        "sType": "query",
        "whereCondition": {
          "conditionType": "leaf",
          "fieldName": "",
          "opType": "like",
          "value": value,
          "fieldType": 9
        },
        "rType": "json"
      }
      let url = `${datamg}/insights/query/data`;

      let cityParams = {
        ...params,
        metaId: cityId
      }
      cityParams.whereCondition.fieldName = `atts.${city}`

      let cityRes: any = await axiosFn.commonPost(url, cityParams)
      let cityData = [];
      if (cityRes.data) {
        cityData = cityRes.data.map((item: any) => {
          return {
            ...item,
            from: cityId
          }
        })
      }

      let countyParams = {
        ...params,
        metaId: countyId
      }
      countyParams.whereCondition.fieldName = `atts.${county}`

      let countyRes: any = await axiosFn.commonPost(url, countyParams)
      let countyData = [];

      if (countyRes.data) {
        countyData = countyRes.data.map((item: any) => {
          return {
            ...item,
            from: countyId
          }
        })
      }

      let resData = [
        ...cityData,
        ...countyData,
      ]
      setSearchData(resData)
    } else {
      setSelData(null)
      setSearchData(null)
    }
  };

  // 点击定位
  const onClickItem = (item: any) => {

    setSelData(item)

    if (item.from && item.oid) {
      const params = {
        loadAttr: true,
        loadGeom: true,
        metaId: item.from,
        id: item.oid
      }
      const url = `${datamg}/stobject/query`;

      axiosFn.commonPost(url, params).then((res: any) => {
        let items = res.data.data.items || []
        if (items.length > 0) {
          const item = items[0];
          const geometry = JSON.parse(item.geom)
          getQMap()?.locationGeometryNotA(geometry)
          getQMap()?.geometryHighlightedLayer.addLayer(geometry);
          Masking.getInstance().setSource(geometry)
        }
      })
    }
  }

  return (
    <div className={styles.region_view}>
      <div className={styles.search_view}>
        <Search
          placeholder="输入名称搜索"
          onSearch={onSearch}
          style={{ width: "260px" }}
          size="small"
          allowClear
        />
      </div>
      <Tree
        style={{ display: searchData ? "none" : "block" }}
        treeData={regionTreeData}
        onSelect={onSelect}
        loadData={onLoadData}
        selectedKeys={uiState.selectedRegion}
      />

      <div
        className={styles.list_view}
        style={{ display: searchData ? "block" : "none" }}
      >
        {searchData && searchData.map((item: any, index: any) => {
          return (
            <div
              key={index}
              className={`${styles.list_item} ${selData?.oid == item.oid ? styles.list_item_sel : ""}`}
              onClick={() => onClickItem(item)}
            >
              {item?.DIST_NAME || item?.count_name}
            </div>
          )
        })}
      </div>


    </div>
  );
})

export default RegionView;
