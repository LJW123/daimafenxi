import { CONFIG_PATH, PUBLIC_PATH } from "@/config"
import { PageStyle } from "./style"
import Data from "./data"


interface PageData {
    pageDatas: Array<Data>
}

export default class Schema {

    private static instance: Schema;
    public static getInstance() {
        if (!Schema.instance) {
            Schema.instance = new Schema();
        }
        return Schema.instance;
    }

    pageStyle: PageStyle = new PageStyle({})

    datas: PageData = {
        pageDatas: []
    }

    schema: any

    constructor() {

    }

    getPageConfig() {
        fetch(`${PUBLIC_PATH}configJson/${CONFIG_PATH}/configJson.json`).then(r => r.json()).then((res: any[]) => {
            this.schema = res;
        })
    }

    // static getPageConfig(callback: Function) {
    //     fetch(`${PUBLIC_PATH}configJson/configJson.json`).then(r => r.json()).then(res => {
    //         if (callback) callback(res)
    //     })
    // }

    LoadConfig() {
        fetch(`${PUBLIC_PATH}configJson/${CONFIG_PATH}/configJson.json`).then(r => r.json()).then((res: any) => {

            const styleSchema = res.styleSchema || {}
            const dataSchema = res.dataSchema || {}

            this.pageStyle = new PageStyle(styleSchema)

            this.datas = {
                pageDatas: []
            }
            if (dataSchema.pageDatas) {
                this.datas.pageDatas = dataSchema.pageDatas.map((item: Data) => new Data(item))
            }


        })
    }

}