import { CONFIG_PATH, PUBLIC_PATH } from "@/config"
import {  MapSource } from "@/plugin/qSpace/core";
import IdsGather from "../idsGather";


export default class QueryConfig {


  private static instance: QueryConfig;
  public static getInstance() {
    if (!QueryConfig.instance) {
      QueryConfig.instance = new QueryConfig();
    }
    return QueryConfig.instance;
  }

  queryConfig: Array<any> = []

  filterLayers: Array<MapSource> = []
  constructor() {

  }


  getFieldName(metaId: any, type: any) {
    let config = this.queryConfig.find((it: any) => it.metaId == metaId)
    if (config) {
      return config[type]
    } else {
      return null
    }

  }

  getMetaQueryConfig(metaId: any) {
    let config = this.queryConfig.find((it: any) => it.metaId == metaId)
    if (config) {
      return config
    } else {
      return null
    }

  }

  LoadConfig() {
    fetch(`${PUBLIC_PATH}configJson/${CONFIG_PATH}/queryConfig.json`).then(r => r.json()).then((res: any[]) => {
      if (res && res.length > 0) {
        this.queryConfig = res.map(item => {
          return {
            ...item,
            metaId: IdsGather.getInstance().getAttributeById(item.metaId)?.id
          }
        });
      } else {
        this.queryConfig = []
      }
    })
  }
}