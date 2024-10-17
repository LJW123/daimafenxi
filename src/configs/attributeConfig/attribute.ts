import IdsGather from "../idsGather"


interface Attr {
    name: string
    label: string
}

export default class Attribute {

    title: string
    type: string
    source: string
    attribute: Array<Attr>
    chartViewId: string | undefined
    style: any = {}
    iframe: any
    attrName: any

    constructor(params: any) {
        this.title = params.title
        this.type = params.type
        // this.source = params.source

        let dataParams = IdsGather.getInstance().getAttributeById(params.source);
        if (dataParams && dataParams.id) {
            this.source = dataParams.id
        } else {
            this.source = dataParams?.layerName
        }

        this.style = params.style || {};
        this.iframe = params.iframe;
        this.attrName = params.attrName;

        this.chartViewId = params.chartViewId
        if (params.attribute) {
            this.attribute = params.attribute.map((item: any) => {
                return {
                    name: item.name,
                    label: item.label
                }
            })
        } else {
            this.attribute = []
        }


    }

    getAttribute(obj: any): any[] {
        const attribute = this.attribute.map((item: any) => {
            return {
                label: item.label,
                value: obj[item.name]
            }
        })
        return attribute
    }


}