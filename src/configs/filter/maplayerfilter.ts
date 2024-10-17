
import { iconsize } from "@/config";
import { getQMap, MapSource } from "@/plugin/qSpace/core"

import { makeAutoObservable, runInAction, toJS } from "mobx"

class MapLayerFilter {

    private static instance: MapLayerFilter;
    public static getInstance() {
        if (!MapLayerFilter.instance) {
            MapLayerFilter.instance = new MapLayerFilter();
        }
        return MapLayerFilter.instance;
    }

    mapFilter: any = {}
    filterUpdate: number = 1
    isClickAll: boolean = false

    constructor() {
        makeAutoObservable(this)
    }

    updateFilter() {
        runInAction(() => {
            this.filterUpdate += 1;
        })
    }
    getFilterContainer(metaId: string) {
        return this.mapFilter[metaId]
    }

    updateIconShow(metaId: string) {
        let caseList = this.createMapExpress(this.mapFilter[metaId])

        const dataList: MapSource[] = getQMap()?.getDataLayerList() || [];
        const layer = dataList.find((it: any) => it.id == metaId)

        if (layer) {
            let arr = layer.getLayerList()
            arr.forEach(ar => {
                if (ar.id.indexOf('image') > -1) {
                    getQMap()?.getMap().setLayoutProperty(ar.id, 'icon-size', caseList);
                }

                if (ar.id.indexOf('注记') > -1) {
                    getQMap()?.getMap().setPaintProperty(ar.id, 'text-opacity', caseList);
                }
            })
        }
        this.updateFilter();
    }
    createFilter(metaId: string | undefined, filterParams: any) {
        if (metaId) {
            let metaFilter = this.mapFilter[metaId];
            if (!metaFilter) {
                metaFilter = {}
            }
            if (filterParams) {
                const attr = filterParams.attr
                const child = filterParams.child
                if (!metaFilter[attr]) {
                    metaFilter[attr] = []
                }
                metaFilter[attr].push(child)

                this.mapFilter[metaId] = metaFilter
                this.updateIconShow(metaId)
            }
        }
    }
    clearAll(metaId: string | undefined) {
        if (metaId) {
            delete this.mapFilter[metaId];

            this.updateIconShow(metaId)
        }
    }

    clearFilter(metaId: string | undefined, filterParams: any) {
        if (metaId) {
            let metaFilter = this.mapFilter[metaId];
            if (metaFilter) {
                const attr = filterParams.attr
                const child = filterParams.child
                if (!metaFilter[attr]) {
                    metaFilter[attr] = []
                }
                metaFilter[attr] = metaFilter[attr].filter((tt: any) => tt.value !== child.value)
                if (metaFilter[attr].length == 0) {
                    delete metaFilter[attr]
                }
                this.updateIconShow(metaId)
            }
        }
    }

    createMapExpress(metainfoFilter: any) {
        let mapFilter = []

        let filterContainer = toJS(metainfoFilter);


        for (const key in filterContainer) {
            const obj = filterContainer[key];
            const value = obj.map((it: any) => it.value)
            const uniqueArr = [...new Set(value)];
            const _value = uniqueArr.length > 1 ? uniqueArr.map((it: any) => `'${it}'`).join(',') : uniqueArr.join(',')
            let values = _value.split(",");

            let ce: any = {
                condition:
                    ["match", ['get', key]],
                output: 0.8
            };
            for (let i = 0; i < values.length; i++) {
                let mkey = values[i]
                ce.condition.push(mkey.replace(/'/g, ""));
                ce.condition.push(true);
            }
            ce.condition.push(false);
            mapFilter.push(ce);

        }
        let caseList = [];
        caseList.push("case");

        let incFilter: any = ["all"]
        mapFilter.forEach(f => {
            incFilter.push(f.condition);
        })

        caseList.push(incFilter);

        caseList.push(iconsize);
        caseList.push(0);

        return caseList;
    }


}
//let maplayerFilter = new MapLayerFilter();

export default MapLayerFilter