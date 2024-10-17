import { getQMap, MapSource } from "@/plugin/qSpace/core"
import QueryConfig from "../queryConfig/queryConfig"
import { makeAutoObservable, runInAction, toJS } from "mobx"



interface Districts {
    dKey: string
    dValue: string | Array<string>
}

interface River {
    lv?: number | undefined
    rKey: string
    rValue: string | Array<string>
}

export interface FilterParamsIF {
    key: string
    filter: Array<string | Array<any>>
}

export interface FilterParams {
    metaId: string | undefined
    filter: Array<FilterParamsIF>
} 


class FilterContainer {

    private static instance: FilterContainer;
    public static getInstance() {
        if (!FilterContainer.instance) {
            FilterContainer.instance = new FilterContainer();
        }
        return FilterContainer.instance;
    }


    districts: Districts = {
        dKey: '',
        dValue: ''
    }

    rivers: River = {
        lv: undefined,
        rKey: '',
        rValue: ''
    }

    filterUpdate: number = 1

    constructor() {
        makeAutoObservable(this)
    }

    updateFilter() {
        runInAction(() => {
            this.filterUpdate += 1;
        })
    }

    setDistricts(obj: Districts) {
        this.districts = obj
        this.toMap()
        this.updateFilter()
    }

    setRivers(obj: River) {

        this.rivers = obj
        this.toMap()
        this.updateFilter()
    }

    toMap() {

        const dataList: MapSource[] = getQMap()?.getDataLayerList() || [];

        dataList.forEach(ms => {
            let metaQueryConfig = QueryConfig.getInstance().getMetaQueryConfig(ms.id);
            if (!metaQueryConfig) {
                return;
            }


            const dfilter: Array<string | Array<any>> = []
            const rfilter: Array<string | Array<any>> = []
            const metaId = metaQueryConfig.metaId

            if (this.districts.dKey) {
                let fieldName = QueryConfig.getInstance().getFieldName(metaId, this.districts.dKey)

                if (fieldName) {
                    fieldName = toJS(fieldName);

                    if (fieldName.startsWith("atts.")) {
                        fieldName = fieldName.substring(5);
                    }

                    dfilter.push("all")
                    if (this.districts.dValue instanceof Array) {
                        let r = this.districts.dValue.map(item => {
                            return ["==", ["get", fieldName], item]
                        })
                        dfilter.push(["any", ...r])
                    } else {
                        dfilter.push(["==", ["get", fieldName], this.districts.dValue])
                    }
                }
            }

            if (this.rivers.rKey) {
                let fieldName = QueryConfig.getInstance().getFieldName(metaId, this.rivers.rKey)

                if (fieldName) {
                    fieldName = toJS(fieldName);

                    if (fieldName.startsWith("atts.")) {
                        fieldName = fieldName.substring(5);
                    }

                    rfilter.push("all")
                    if (this.rivers.rValue instanceof Array) {
                        let r = this.rivers.rValue.map(item => {
                            return ["==", ["get", fieldName], item]
                        })
                        rfilter.push(["any", ...r])
                    } else {
                        rfilter.push(["==", ["get", fieldName], this.rivers.rValue])
                    }
                }
            }

            const filter: Array<string | Array<any>> = ["all"]
            if (dfilter.length > 0) filter.push(dfilter)
            if (rfilter.length > 0) filter.push(rfilter)
            const layer = dataList.find((it: any) => it.id == metaId)

            if (layer) {
                let arr = layer.getLayerList()
                arr.forEach(ar => {
                    getQMap()?.getMap().setFilter(ar.id, filter);
                })
            }
        })


    }

    toChart(metaId: string) {
        let whereCondition: any = {
            "conditionType": "and",
            "qList": []
        }

        if (this.districts.dKey) {
            let fieldName = QueryConfig.getInstance().getFieldName(metaId, this.districts.dKey)

            let dValue: string = ''
            let opType: string = ''

            if (this.districts.dValue instanceof Array) {
                // dValue = this.districts.dValue.join(',')
                dValue = this.districts.dValue.map((it: any) => `'${it}'`).join(',')
                opType = 'contain'
            } else {
                dValue = this.districts.dValue
                opType = 'eq'

            }

            whereCondition.qList.push({
                "fieldName": `${fieldName}`,
                // "fieldName": `atts.${fieldName}`,
                "value": dValue,
                "conditionType": "leaf",
                "opType": opType,
                "fieldType": 9
            })
        }
        if (this.rivers.rKey) {
            let fieldName = QueryConfig.getInstance().getFieldName(metaId, this.rivers.rKey)

            let rValue: string = ''
            let opType: string = ''

            if (this.rivers.rValue instanceof Array) {
                // rValue = this.rivers.rValue.join(',')
                rValue = this.rivers.rValue.map((it: any) => `'${it}'`).join(',')
                opType = 'contain'
            } else {
                rValue = this.rivers.rValue
                opType = 'eq'
            }
            whereCondition.qList.push({
                "fieldName": `${fieldName}`,
                // "fieldName": `atts.${fieldName}`,
                "value": rValue,
                "conditionType": "leaf",
                "opType": opType,
                "fieldType": 9
            })
        }
        return whereCondition
    }
}


export default FilterContainer