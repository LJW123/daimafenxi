import React, { useState, useEffect, useRef, useCallback } from 'react';
import { observer } from 'mobx-react-lite';

import { IMAGE_PATH } from '@/config';
import { datamg, riverRelationMetaId } from '@/common';
import axios from 'axios';
import { Spin } from 'antd';
import styles from "./styles.less";
import G6View from './g6View';
import uiState from '@/mobx/ui';
const RiverContent = observer((props: any) => {
    const divId = props.divId

    const rName = uiState.showRiverName

    const [loading, setLoading] = useState<boolean>(true);

    const [resData, setResData] = useState<any>();
    const fullScreen = uiState.fullScreen



    useEffect(() => {
        if (rName) {
            setLoading(true)
            queryData(0)
        }

    }, [rName])

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

    const queryData = async (num: number = 0) => {
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
            disposeData(res)
            setLoading(false)

        } else {
            const n = num + 1
            if (n < 7) {
                queryData(n)
            }
        }
    }

    const disposeData = (originalData: any[]) => {
        let obj: any = {}
        for (let index = 0; index < originalData.length; index++) {
            const data = originalData[index];
            function createNestedObject(_n: number, _obj: any = {}) {
                const key = `N${_n}`
                const _nn = data[key]
                if (_nn) {
                    if (!_obj[_nn]) {
                        _obj[_nn] = {};
                    }
                    if (_n < 7) {
                        const n = _n + 1
                        createNestedObject(n, _obj[_nn]);
                    }
                }
            }
            createNestedObject(0, obj)
        }

        let arr: any[] = []
        recursion(arr, obj, 1)
        if (arr.length > 0) {
            setResData(arr[0])
        }
    }

    const recursion = (arr: any[], objData: any, num: number = 1) => {
        const keys = Object.keys(objData)
        for (let index = 0; index < keys.length; index++) {
            const key = keys[index];
            const _keys = Object.keys(objData[key])

            let obj = {
                id: `${key}_${num}`,
                label: `${key}`,
                children: [],
                isLeaf: _keys.length > 0 ? false : true
            }
            arr.push(obj)
            let n = num + 1
            recursion(obj.children, objData[key], n)

        }
    }

    return (
        <div className={styles.river_model_view}>
            {
                loading ? <Spin /> : <G6View fullScreen={fullScreen} resData={resData} divId={divId} />
            }
        </div>
    )
})

export default RiverContent;
