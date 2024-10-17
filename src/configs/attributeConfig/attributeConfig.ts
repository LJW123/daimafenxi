import { CONFIG_PATH, PUBLIC_PATH } from "@/config"
import Attribute from "./attribute"



export default class AttributeConfig {

    private static instance: AttributeConfig;
    public static getInstance() {
        if (!AttributeConfig.instance) {
            AttributeConfig.instance = new AttributeConfig();
        }
        return AttributeConfig.instance;
    }


    attributes: Array<Attribute> = []


    constructor() {

    }

    getAttribute(obj: any): Attribute | undefined {

        const feature = obj.feature
        const mapStyle = obj.style

        const source = feature.source
        const sourceLayer = feature.sourceLayer
        const sources = mapStyle.sources || {}
        const _source = sources[source]

        if (_source.tt) {
            // 点击图层来源于场景
            const attribute = this.attributes.find(item => item.type == _source.tt && item.source == source)
            return attribute
        } else {
            // 点击图层来源于元信息或服务   暂时不考虑服务  
            const attribute = this.attributes.find(item => item.type == 'data' && item.source == source)
            return attribute

        }

    }

    getAttributeById(id: string): Attribute | undefined {
        const attribute = this.attributes.find(item => item.source == id)
        return attribute
    }

    LoadConfig() {
        fetch(`${PUBLIC_PATH}configJson/${CONFIG_PATH}/attributeConfig.json`).then(r => r.json()).then((res: any[]) => {
            if (res && res.length > 0) {
                this.attributes = res.map(item => new Attribute(item));
            } else {
                this.attributes = []
            }
        })
    }

}