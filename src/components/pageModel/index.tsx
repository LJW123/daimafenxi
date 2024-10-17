import React, { useState, useEffect, useRef, useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import axios from 'axios';
import { datamg } from '@/common';
import JsxParserView from './jsxParserView';

import FilterContainer from '@/configs/filter/filterContainer';
import MapLayerFilter from '@/configs/filter/maplayerfilter';
import TableView from '../PageView/TableView/Index';
import IdsGather from '@/configs/idsGather';

import axiosFn from '@/server/axios';
import { toJS } from 'mobx';


interface jsxParserParamsModel {
    chartViewId: string,
    codeString: string,
    dataResult: Array<any> | object,
    funs: object,
    deferred_jsx: Array<string>,
    funcJson: Array<any>
}

const PageView = observer((props: any) => {
    const key = props.key
    const chartView = props.chartView
    const chartViewId = chartView.chartViewId
    const _chartType = chartView.chartType

    const [changeData, setChangeData] = useState<boolean>(false);
    const [dataCount, setDataCount] = useState<number>(0);

    const [jsxParserParams, setJsxParserParams] = useState<any>(null);
    const _jsxParserParams: any = useRef()
    _jsxParserParams.current = jsxParserParams

    useEffect(() => {
        if (chartViewId && _chartType !== "Table") {
            setJsxParserParams(null)
            queryChart()
        } else {
            const metaId = IdsGather.getInstance().getAttributeById(chartView.metaId)?.id;

            let dataParams = IdsGather.getInstance().getAttributeById(chartView.metaId);
            if (dataParams && dataParams.id) {
                processingInnerData(chartView.queryParams, metaId)
            } else {
                processingInterfaceData(dataParams)
            }

        }

    }, [chartView]);

    useEffect(() => {
        const jsxObj = _jsxParserParams.current
        if (jsxObj) {
            setChangeData(true)
            updatePartView()
        }

    }, [FilterContainer.getInstance().filterUpdate, MapLayerFilter.getInstance().filterUpdate]);

    useEffect(() => {
        if (changeData) {
            updatePartView()
        }
    }, [changeData]);

    const updatePartView = (pagination?: any) => {

        const jsxObj = _jsxParserParams.current

        if (!jsxObj) return null
        const _jsxObj = { ...jsxObj }
        if (!_jsxObj.metaId) return null
        const metaId = _jsxObj.metaId

        let change: boolean = true

        if (change && window.queryParams[chartViewId]) {

            let qparams = JSON.parse(JSON.stringify(window.queryParams[chartViewId]));
            qparams.whereCondition = FilterContainer.getInstance().toChart(metaId);

            let _filterContainer = MapLayerFilter.getInstance().getFilterContainer(metaId)
            if (_filterContainer) {
                _filterContainer = toJS(_filterContainer)
            }


            // 根据 metaId 判断是否为平台元信息
            if (_chartType === "Table" && isNaN(metaId)) {
                // 不是平台元信息
                tableChange(_filterContainer)
            } else {

                if (_filterContainer) {
                    for (const key in _filterContainer) {
                        const obj = _filterContainer[key];
                        const value = obj.map((it: any) => it.value)
                        const _value = value.length > 1 ? value.map((it: any) => `'${it}'`).join(',') : value.join(',')
                        qparams.whereCondition.qList.push({
                            "fieldName": `${key}`,
                            // "fieldName": `atts.${key}`,
                            "value": _value,
                            "conditionType": "leaf",
                            "opType": value.length > 1 ? "contain" : 'eq',
                            "fieldType": 9
                        })

                        let params = {
                            metaId: metaId,
                            ...qparams,
                            ...obj,
                            ...pagination,
                        }

                        queryInsightsData(params).then(res => {
                            _jsxObj.dataResult.queryData = res
                            setJsxParserParams(_jsxObj)
                            setChangeData(false)

                        }).catch(error => console.error(error))

                    }
                } else {

                    let params = {
                        metaId: metaId,
                        ...qparams,
                        ...pagination,
                    }

                    queryInsightsData(params).then(res => {
                        _jsxObj.dataResult.queryData = res
                        setJsxParserParams(_jsxObj)
                        setChangeData(false)

                    }).catch(error => console.error(error))
                }




            }
        }
    }

    const tableChange = (filterParams: any) => {

        let isClickAll = toJS(MapLayerFilter.getInstance().isClickAll);
        let resData = [];
        const jsxObj = _jsxParserParams.current
        const _jsxObj = { ...jsxObj };
        if (filterParams && Object.keys(filterParams).length > 0 && !isClickAll) {
            let queryData = jsxObj.oldData.queryData;
            let params: any = [];

            for (const key in filterParams) {
                let value = filterParams[key];
                for (const k in value) {
                    params.push({
                        key: key,
                        value: value[k].value
                    })
                }
            }

            const uniqueParams: any = Array.from(new Set(params.map(JSON.stringify))).map(JSON.parse);

            for (let index = 0; index < uniqueParams.length; index++) {
                let paramsItem = uniqueParams[index];
                let res = queryData.filter((it: any) => it[paramsItem.key] == paramsItem.value);
                resData.push(...res)
            }

        } else {
            resData = jsxObj.oldData.queryData;
        }

        _jsxObj.dataResult.queryData = resData
        setDataCount(resData.length)
        setJsxParserParams(_jsxObj)
        setChangeData(false)
    }

    const queryChart = () => {
        let url = `${datamg}/chartView/query`;
        axios.create().post(url, {
            id: chartViewId
        }).then(res => {
            if (res.data.status === 200) {
                const data = res.data.data
                const items = data.items
                if (items.length > 0) {
                    const item = items[0]
                    const charConfig = item.charConfig || '';
                    let charConfigObj: any = {
                        script: '',
                        dataResult: {},
                        funcJson: [],
                    };
                    try {
                        if (charConfig) {
                            charConfigObj = JSON.parse(charConfig);
                        }
                    } catch (error) { }
                    item.charConfigObj = charConfigObj
                    processingData(item)
                }
            }
        })
    };

    const axiosQuery = (method: any, url: any, params: any, funcJsx: string) => {
        return new Promise((resolve, reject) => {
            let _url = `${datamg}${url}`;
            let ajax = null
            if (method == 'get' || method == 'GET') {
                ajax = axios.create().get(_url, params)
            } else if (method == 'post' || method == 'POST') {
                ajax = axios.create().post(_url, params)
            } else if (method == 'delete' || method == 'DELETE') {
                ajax = axios.create().delete(_url, params)
            }

            if (ajax) {
                ajax.then((res: any) => {
                    if (res.data.status === 200) {
                        const data = res.data.data
                        let redData = []
                        if (funcJsx) {
                            redData = eval(funcJsx)
                        } else {
                            redData = JSON.parse(JSON.stringify(data))
                        }
                        resolve(redData);
                    }
                }).catch(error => {
                    console.error(error)
                    resolve({});
                })
            } else {
                resolve({});
            }
        });

    }

    const queryQuestionId = (questionId: string) => {
        return new Promise((resolve, reject) => {
            let _url = `${datamg}/insights/query/${questionId}?rType=json`;
            axios.create().post(_url).then((res: any) => {
                if (res.status == 200) {
                    resolve(res.data.data)
                }
            })
        });
    }

    const queryInsightsData = (params: any) => {
        return new Promise((resolve, reject) => {
            let _url = `${datamg}/insights/query/data`;
            axios.create().post(_url, params).then((res: any) => {
                if (res.status == 200) {
                    resolve(res.data)
                    queryInsightsDataCount(params)
                }
            })
        });
    }

    // 数据总条数
    const queryInsightsDataCount = (params: any) => {
        let _params = JSON.parse(JSON.stringify(params));
        _params.sType = 'statistics';
        _params.sFun = 'count';

        delete _params.pageNum
        delete _params.pageSize

        let url = `${datamg}/insights/query/data`;
        axiosFn.commonPost(url, _params).then((res: any) => {
            if (res.status == 200) {
                let count = res.data[0]?.count || res.data[0]?.COUNT || 0;
                setDataCount(count)
            }
        })
    }


    const processingInnerData = async (queryParams: any, metaId: any) => {


        if (!window.queryParams) {
            window.queryParams = {}
        }
        window.queryParams[chartViewId] = queryParams;


        let funs: any = {}
        let deferred_jsx: string[] = []

        try {

            let _dataResult: any = {

            }
            if (metaId) {
                const params = {
                    metaId: metaId,
                    ...queryParams,
                }

                _dataResult['queryData'] = await queryInsightsData(params)
            }

            const _jsxParserParams = {
                dataResult: _dataResult,
                oldData: JSON.parse(JSON.stringify(_dataResult)),
                funs: funs,
                deferred_jsx: deferred_jsx,
                chartViewId: chartViewId,
                metaId: metaId
            }

            setJsxParserParams(_jsxParserParams)
            setTimeout(() => {
                setChangeData(true)
            }, 10);
        } catch (error) {
            console.error(error)
        }

    }

    const processingInterfaceData = async (dataParams: any) => {


        if (!window.queryParams) {
            window.queryParams = {}
        }
        window.queryParams[chartViewId] = dataParams;


        let funs: any = {}
        let deferred_jsx: string[] = []

        try {

            let _dataResult: any = {

            }
            let result = await fetch(dataParams.url).then(r => r.json());

            _dataResult['queryData'] = result.data;

            const _jsxParserParams = {
                dataResult: _dataResult,
                oldData: JSON.parse(JSON.stringify(_dataResult)),
                funs: funs,
                deferred_jsx: deferred_jsx,
                chartViewId: chartViewId,
                metaId: dataParams.layerName
            }

            setDataCount(result.data.length)

            setJsxParserParams(_jsxParserParams)
            setTimeout(() => {
                setChangeData(true)
            }, 10);
        } catch (error) {
            console.error(error)
        }

    }

    const processingData = async (chartObj: any) => {
        const charConfigObj = chartObj.charConfigObj
        const chartType = chartObj.chartType
        const questionId = chartObj.questionId
        const staticData = charConfigObj.dataResult || {}
        const funcJson = charConfigObj.funcJson || []
        const codeString = charConfigObj.script || ''
        const metaId = charConfigObj.metaId || ''
        const queryParams = charConfigObj.queryParams || {}

        if (!window.queryParams) {
            window.queryParams = {}
        }
        window.queryParams[chartViewId] = queryParams;

        let _dataResult: any = {
            staticData,
        }
        let funs: any = {}
        let deferred_jsx: string[] = []

        try {

            const disposeFunc = async () => {
                for (let index = 0; index < funcJson.length; index++) {
                    const _fun: any = funcJson[index];

                    // 请求事件
                    if (_fun.funcName.indexOf('axios') > -1) {
                        const method = _fun.method
                        const url = _fun.url
                        const params = _fun.params
                        _dataResult[_fun.funcName] = await axiosQuery(method, url, params, _fun.onFunc)
                    } else {


                        if (chartType == 2) {//图表
                            // 没有方法名称的是直接执行的代码
                            // 是否延迟执行 
                            if (_fun.onFunc) {
                                deferred_jsx.push(_fun.onFunc)
                            }
                        } else if (chartType == 3) {//普通组件

                            // 自定义事件 按钮事件
                            let js = `${_fun.onFunc}`
                            if (js.indexOf("function") > 0) {
                                funs[_fun.funcName] = eval(js)
                            } else {

                                funs[_fun.funcName] = (..._obj: any) => {
                                    const obj = _obj
                                    obj.push(_dataResult)
                                    obj.push({ metaId: metaId })
                                    if (_fun.onFunc) {
                                        eval(js)
                                    }
                                }
                            }


                        }
                    }
                }
            }
            await disposeFunc()
            if (questionId) {
                _dataResult['queryData'] = await queryQuestionId(questionId)
            }



            if (metaId) {
                const params = {
                    metaId: metaId,
                    ...queryParams,
                }
                _dataResult['queryData'] = await queryInsightsData(params)
            }



            const _jsxParserParams = {
                codeString: codeString,
                dataResult: _dataResult,
                oldData: JSON.parse(JSON.stringify(_dataResult)),
                funs: funs,
                deferred_jsx: deferred_jsx,
                funcJson: funcJson,
                chartViewId: chartViewId,
                metaId: metaId
            }

            setJsxParserParams(_jsxParserParams)
            setTimeout(() => {
                setChangeData(true)
            }, 10);
        } catch (error) {
            console.error(error)
        }

    }


    if (_chartType == "Table") {
        // 内置表格
        return <TableView
            key={key}
            chartView={chartView}
            data={jsxParserParams?.dataResult?.queryData || []}
            dataCount={dataCount}
            updatePartView={updatePartView}
        />
    } else if (jsxParserParams) {
        // 部件
        return <JsxParserView key={key} jsxParserParams={jsxParserParams} />
    } else {
        return null
    }

})
export default PageView;
