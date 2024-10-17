import { CONFIG_PATH, PUBLIC_PATH } from "@/config";
import { getQMap, QMapGl } from "@/plugin/qSpace/core";
import IdsGather from "../idsGather";

class MakerLayer {

    layerName: string = ""

    geojsonData: any = null

    html: any = null

    makerData: any = {}

    constructor(geojson: any, layerName: string) {
        this.layerName = layerName;
        this.geojsonData = geojson;
    }
    showLevel: Array<any> = []// [{ zoom: 1, value: "1" }, { zoom: 4, value: "2" }, { zoom: 7, value: "3" }, { zoom: 10, value: "4" }, { zoom: 12, value: "5" }]


    // render(template: string, context: any) {
    //     return template.replace(/{{(.*?)}}/g, (match, key) => context[key.trim()]);
    // }
    //更改后逻辑如果value是undefined或null，则返回空字符串，否则返回value  
    render(template: string, context: any) {
        return template.replace(/{{(.*?)}}/g, (match, key) => {
            const trimmedKey = key.trim();
            const value = context[trimmedKey];

            // 检查value是否是时间字符串（这里假设是ISO 8601格式的字符串）  
            if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(value)) {
                // 使用Date对象解析时间字符串，并格式化为“日时”格式  
                const date = new Date(value);
                const day = date.getDate().toString().padStart(2, '0'); // 确保日期是两位数  
                const hour = date.getHours().toString().padStart(2, '0'); // 确保小时是两位数  
                return `${day}日${hour}时`;
            }

            // 如果不是时间字符串，则按原逻辑处理  
            return value === undefined || value === null ? "-.-" : value.toString();
        });
    }

    isShowMarker(showLevel: any, zoom: number) {

        for (let i = 0; i < this.showLevel.length; i++) {
            if (this.showLevel[i].zoom <= zoom && this.showLevel[i].value == showLevel) {
                return true;
            }
        }
        return false;

    }
    updateMarkers() {

        if (!(this.geojsonData && this.geojsonData.features)) {
            return
        }

        let idsGather = IdsGather.getInstance().getAttributeById(this.layerName);

        if (!idsGather) {
            return
        }


        let idField = idsGather.idField || "id"
        let showLevelField = idsGather.showLevelField
        this.showLevel = idsGather.showLevel


        let features = this.geojsonData.features
        let html = this.html;

        let map = getQMap()?.getMap();
        let zoom = map.getZoom();

        const newMarkers: any = {};

        for (let i = 0; i < features.length; i++) {
            let feature = features[i]
            let geometry = feature.geometry;

            let id = feature.properties[idField]

            let isShow = true;

            if (showLevelField && this.showLevel) {
                let showLevel = feature.properties[showLevelField]
                isShow = this.isShowMarker(showLevel, zoom);
            }

            if (isShow) {
                let src_marker = this.makerData[id];

                if (!src_marker) { 

                    let htmltext = this.render(html, feature.properties);//`<div>123</div>`; 

                    const el = document.createElement('div');
                    el.innerHTML = htmltext;

                    src_marker = new QMapGl.Marker({
                        element: el.firstChild
                    }).setLngLat(geometry.coordinates)

                    const element = src_marker.getElement();

                    element.addEventListener('click', (e: any) => {
                        window.Evented.fire('onCardClick', { data: feature.properties, layerName: this.layerName })
                    });
                }
                
                if (!this.makerData[id]&&!newMarkers[id]){
                    src_marker.addTo(map);
                    newMarkers[id] = src_marker;
                } 
            }

        }

        for (const id in this.makerData) {
            if (!newMarkers[id]) this.makerData[id].remove();
        }

        this.makerData = newMarkers;

        //console.log(this.makerData,Object.keys(this.makerData).length)

    }

    processProperties(features: Array<any>) {
        // 水库水情 蓄水量：w   单位换算一下，例如数据返回1319.59，则显示蓄水量13.19
        // 区域用水总量 用水管控指标quota 实际用水量fwqtA 单位换算一下除一亿
        features.forEach((item: any) => {                        
            if (item && item.properties) {
                if (item.properties.w) {
                    item.properties.w = (item.properties.w / 100).toFixed(2)
                }
            }
            if (item && item.geometry) {
                if (item.geometry.w) {
                    item.geometry.w = (item.geometry.w / 100).toFixed(2)
                }
            }
            if (item && item.properties) {
                if (item.properties.fwqtA) {
                    item.properties.fwqtA = (item.properties.fwqtA / 100000000).toFixed(2)
                }
            }
            if (item && item.geometry) {
                if (item.geometry.fwqtA) {
                    item.geometry.fwqtA = (item.geometry.fwqtA / 100).toFixed(2)
                }
            }
            if (item && item.properties) {
                if (item.properties.quota) {
                    item.properties.quota = (item.properties.quota / 100000000).toFixed(2)
                }
            }
            if (item && item.geometry) {
                if (item.geometry.quota) {
                    item.geometry.quota = (item.geometry.quota / 100).toFixed(2)
                }
            }

        });
    }
    async addToMap() {
        if (this.geojsonData) {

            let idsGather = IdsGather.getInstance().getAttributeById(this.layerName);

            let features = this.geojsonData.features
            this.processProperties(features)


            this.html = await fetch(`${PUBLIC_PATH}configJson/${CONFIG_PATH}/card/${idsGather.html}.html`).then(r => r.text());



            this.updateMarkers()

            //   this.upfn=this.updateMarkers.bind(this);

            //let map = getQMap()?.getMap();
            //let rrr = map.on('zoomend', this.updateMarkers.bind(this));

        }
    }

    removeMarker() {
        for (let id in this.makerData) {
            let marker = this.makerData[id]
            marker.remove();
        }
        this.makerData = {}

       // let map = getQMap()?.getMap();
        //map.off('zoomend', this.updateMarkers);
    }
}

class MakerLayerManage {

    private static instance: MakerLayerManage;
    public static getInstance() {
        if (!MakerLayerManage.instance) {
            MakerLayerManage.instance = new MakerLayerManage();
        }
        return MakerLayerManage.instance;
    }


    //地图实例
    mapInstance: any;

    makerLayerList: Array<MakerLayer> = []

    constructor() {

    }


    addMakerLayer(geojson: any, layerName: string) {
        let makerlayer = new MakerLayer(geojson, layerName);

        makerlayer.addToMap();

        this.makerLayerList.push(makerlayer)
    }

    removeMakerLayer(layerName: string) {
        let findex = this.makerLayerList.findIndex(mll => mll.layerName == layerName);
        if (findex >= 0) {
            this.makerLayerList[findex].removeMarker();

            this.makerLayerList.splice(findex, 1)
        }
    }
}

export default MakerLayerManage;