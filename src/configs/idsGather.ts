import { CONFIG_PATH, PUBLIC_PATH } from "@/config"



export default class IdsGather {

    private static instance: IdsGather;
    public static getInstance() {
        if (!IdsGather.instance) {
            IdsGather.instance = new IdsGather();
        }
        return IdsGather.instance;
    }

    idsGather: any = {}


    constructor() {

    }



    getAttributeById(key: string): any {
        return this.idsGather[key]
    }

    LoadConfig() {
        fetch(`${PUBLIC_PATH}configJson/${CONFIG_PATH}/idsGather.json`).then(r => r.json()).then((res: any[]) => {
            this.idsGather = res
        })
    }

}