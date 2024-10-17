import React, { useState, useEffect, useRef, useCallback } from 'react';
import { observer } from 'mobx-react-lite';
 
import styles from './styles.less';
import { datamg, riverMetaId, riverRelationMetaId, rvMetaId } from '@/common';
import axiosFn from '@/server/axios';
import { Tree } from 'antd';
import { Space } from 'antd';
import CustomIcon from '@/components/CustomIcon';
import { message } from 'antd';
import { getQMap } from '@/plugin/qSpace/core';
import uiState from '@/mobx/ui';
import { Input } from 'antd';
import FilterContainer from '@/configs/filter/filterContainer';
import { toJS } from 'mobx';
import axios from 'axios';
const { Search } = Input;

const RiversView = observer((props: any) => {
  const [searchData, setSearchData] = useState<any>(null)
  const [selData, setSelData] = useState<any>(null)


  const riversTreeData = uiState.riversTreeData

  useEffect(() => {
    if (riversTreeData) {

    } else {
      initData()

    }
  }, []);
  const queryData = (obj: any) => {
    let params = {
      "metaId": rvMetaId,
      "pageSize": 9999,
      "pageNum": 1,
      "rType": "json",
      ...obj,
    }

    let url = `${datamg}/insights/query/data`
    return axiosFn.commonPost(url, params)
  };
  // 根级河流
  const initData = async () => {
    let params = {
      "sType": "statistics",
      "sFun": "count",
      "sField": "data.UP_RV_NAME",
      "groupField": "data.UP_RV_NAME",
      "whereCondition": {
        "conditionType": "leaf",
        "fieldName": "data.REV_LEVEL",
        "opType": "eq",
        "value": "1",
        "fieldType": 9
      },
    }

    let res: any = await queryData(params);
    if (res.status == 200) {
      let data = res.data;
      // 过滤出 count>10 的数据
      let rivers = data.filter((item: any) => item.count > 10);
      let riversTreeData = rivers.map((it: any) => {
        return {
          title: <div className={styles.title_view}>
            <span className={styles.title} onClick={() => onFilter(it)}>
              {it.varchar}
            </span>
            <Space>
              {/* <CustomIcon type="icon-xiangqing_line" title="信息汇总" onClick={() => onUpInfo(it)} /> */}
              <CustomIcon type="icon-a-lujing413" title="定位" onClick={() => onLocation(it.varchar)} />
              <CustomIcon type="icon-relation-full" title="关系详情" onClick={() => onDetails(it.varchar)} />
            </Space>
          </div>,
          key: it.varchar,
          data: {
            ...it
          }
        }
      })

      uiState.setRiversTreeData(riversTreeData)
      // setTreeData(riversTreeData)
    }
  };

  const onLoadData = (e: any) => {
    let key = e.key;
    let children = e.children;

    return new Promise<void>((resolve) => {
      if (children) {
        resolve();
        return;
      }

      let params = {
        "sType": "query",
        "whereCondition": {
          "conditionType": "leaf",
          "fieldName": "data.UP_RV_NAME",
          "opType": "eq",
          "value": key,
          "fieldType": 9
        },
      }

      queryData(params).then((res: any) => {
        let data = res.data;
        let childrenData = data.map((item: any) => {
          return {
            title: <div className={styles.title_view}>
              <span className={styles.title} onClick={() => onFilter(item)}>
                {item.RV_NAME}
              </span>
              <Space>
                {/* <CustomIcon type="icon-xiangqing_line" title="信息汇总" onClick={() => onUpInfo(item)} /> */}
                <CustomIcon type="icon-a-lujing413" title="定位" onClick={() => onLocation(item.RV_NAME)} />
                <CustomIcon type="icon-relation-full" title="关系详情" onClick={() => onDetails(item.RV_NAME)} />
              </Space>
            </div>,
            key: item.RV_NAME,
            data: {
              ...item
            }
          }
        })
        const _treeData = updateTreeData(riversTreeData, key, childrenData)
        uiState.setRiversTreeData(_treeData)
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

  // 定位  点击定位图标
  const onLocation = async (name: any) => {

    let params = {
      "metaId": riverMetaId,
      "sType": "query",
      "whereCondition": {
        "conditionType": "leaf",
        "fieldName": "atts.NAME",
        "opType": "eq",
        "value": name,
        "fieldType": 9
      },
    }

    let url = `${datamg}/insights/query/data`
    axiosFn.commonPost(url, params).then((res: any) => {
      if (res.status == 200) {
        let data = res.data;
        let feature = data?.features[0]
        let geometry = feature?.geometry
        if (geometry) {
          const qmap = getQMap();
          qmap?.locationGeometryNotA(geometry, {
            padding: 200
          })
          qmap?.geometryHighlightedLayer2.addLayer(geometry);

        } else {
          message.info("无位置信息")
        }
      }
    })
  }

  // 点击出G6图表
  const onDetails = (name: any) => {
    uiState.setShowRiverName(name)
  }

  // 点击名称  筛选地图上的数据
  const onFilter = (obj: any) => {
    const sel = toJS(uiState.selectedRiver)

    let name = ''
    let lv = 0
    if (obj.varchar) {
      lv = 0
      name = obj.varchar
    } else if (obj.RV_NAME) {
      lv = obj.REV_LEVEL
      name = obj.RV_NAME
    }


    queryRiverData(Number(lv), name, (obj: any) => {

      if (sel.find(item => item == name)) {
        uiState.setSelectedRiver([])
        FilterContainer.getInstance().setRivers({
          rKey: '',
          rValue: ''
        })
      } else {
        uiState.setSelectedRiver([name])
        FilterContainer.getInstance().setRivers({
          rKey: 'rv_name',
          rValue: Object.keys(obj)
        })
      }

    })



  }

  const queryInsightsData = (params: any) => {
    return new Promise((resolve, reject) => {
      let _url = `${datamg}/insights/query/data`;
      axios.create().post(_url, params).then((res: any) => {
        if (res.status == 200) {
          resolve(res.data)
        }
      })
    });
  }

  const queryRiverData = async (num: number = 0, rName: string, callback?: any) => {
    let params = {
      "metaId": riverRelationMetaId,
      "whereCondition": {
        "conditionType": "leaf",
        "fieldName": `data.N${num}`,
        "opType": "eq",
        "value": rName,
        "fieldType": 9
      },
      "sType": "query",
      "rType": "json",
      "pageSize": 9999,
      "pageNum": 1,
    }

    const res: any = await queryInsightsData(params)
    if (res.length > 0) {

      function createNestedObject(data: any, _n: number, _obj: any = {}) {
        const key = `N${_n}`
        const _nn = data[key]
        if (_nn) {
          if (!_obj[_nn]) {
            _obj[_nn] = {};
          }
          if (_n < 7) {
            const n = _n + 1
            createNestedObject(data, n, _obj);
          }
        }

      }
      let obj: any = {}

      for (let index = 0; index < res.length; index++) {
        const rr = res[index];
        createNestedObject(rr, num, obj)

      }

      if (callback) {
        callback(obj)
      }

    } else {
      const n = num + 1
      if (n < 7) {
        queryRiverData(n, rName)
      }
    }
  }


  //  搜索
  const onSearch = (value: any) => {
    if (value) {
      let params = {
        "metaId": riverMetaId,
        "sType": "query",
        "whereCondition": {
          "conditionType": "leaf",
          "fieldName": "atts.NAME",
          "opType": "like",
          "value": value,
          "fieldType": 9
        },
        "rType": "json"
      }
      let url = `${datamg}/insights/query/data`;
      axiosFn.commonPost(url, params).then((res: any) => {
        let data = res.data || [];
        setSearchData(data);
      })
    } else {
      setSelData(null)
      setSearchData(null);
    }
  }

  // 点击定位  搜索后的结果点击
  const onClickItem = (item: any) => {
    setSelData(item)
    if (item.oid) {
      const params = {
        loadAttr: true,
        loadGeom: true,
        metaId: riverMetaId,
        id: item.oid
      }
      const url = `${datamg}/stobject/query`;

      axiosFn.commonPost(url, params).then((res: any) => {
        if (res.status == 200) {
          let data = res.data;
          let item = data.data.items[0];
          let geom = item?.geom
          if (geom) {
            let geometry = JSON.parse(geom)
            const qmap = getQMap();
            qmap?.locationGeometryNotA(geometry, {
              padding: 200
            })
            qmap?.geometryHighlightedLayer2.addLayer(geometry);

          } else {
            message.info("无位置信息")
          }
        }
      })
    }

  }


  return (
    <div className={styles.rivers_view}>

      <div className={styles.search_view}>
        <Search
          placeholder="输入名称搜索"
          onSearch={onSearch}
          style={{ width: "290px" }}
          size="small"
          allowClear
        />
      </div>

      <Tree
        style={{ display: searchData ? "none" : "block" }}
        treeData={riversTreeData}
        loadData={onLoadData}
        // selectable={false}
        blockNode={true}
        selectedKeys={uiState.selectedRiver}

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
              {item?.NAME}
            </div>
          )
        })}
      </div>
    </div>
  );
})

export default RiversView;
