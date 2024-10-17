import { MapType, ToolModel } from '@/plugin/qSpace/core';
import { makeAutoObservable } from 'mobx';

class MapUi {
    updateNum: number = 0

    mapStatus:MapType = 'normal'

    toolStatus:ToolModel | null=null

    constructor() {
        makeAutoObservable(this)
    }

    setUpdateNum(num: number) {
        this.updateNum = num
    }

    setMapStatus(val: MapType) {
        this.mapStatus = val
    }

    setToolStatus(val: ToolModel | null) {
        this.toolStatus = val
    }
}

let mapUi = new MapUi();

export default mapUi

