import { datamg } from "@/common";
import Chart from "./chart";
import axiosFn from "@/server/axios";
import uiState from "@/mobx/ui";
import { getQMap, MapSource, QLayerDataModel } from "@/plugin/qSpace/core";
import QueryConfig from "../queryConfig/queryConfig";
import filterContainer, {
  FilterParams,
  FilterParamsIF,
} from "../filter/filterContainer";
import IdsGather from "../idsGather";

interface FilterChilds {
  label: string;
  value: string;
}
interface FilterType {
  attr: string;
  childs: Array<FilterChilds>;
}

export default class Data {
  icon: string;
  title: string;
  legend: string;
  metaId: string | undefined;
  maxzoom: number | undefined;
  minzoom: number | undefined;
  classId: string | undefined;
  childs: Array<Data>;
  charts: Array<Chart>;
  filter: Array<FilterType>;

  isAjax: boolean;
  metaInfo: any;
  index: number = 0;
  default?: boolean;

  dataParams: any;

  constructor(params: Data) {
    this.icon = params.icon || "";
    this.title = params.title || "";
    this.legend = params.legend || "";
    this.default = params.default;

    let metaId = params.metaId || undefined;
    if (metaId) {
      let dataParams = IdsGather.getInstance().getAttributeById(metaId);
      if (dataParams && dataParams.id && dataParams.type === "data") {
        this.metaId = dataParams.id;
      } else {
        this.dataParams = dataParams;
      }
    }

    this.maxzoom = params.maxzoom || undefined;
    this.minzoom = params.minzoom || undefined;
    this.classId = params.classId || undefined;

    if (params.childs && params.childs.length > 0) {
      this.childs = params.childs.map((item) => new Data(item));
    } else {
      this.childs = [];
    }

    if (params.charts && params.charts.length > 0) {
      this.charts = params.charts.map((item) => new Chart(item));
    } else {
      this.charts = [];
    }

    this.filter = params.filter || [];

    this.isAjax = false;
    this.metaInfo = null;
  }

  setMetaInfo(data: any) {
    this.metaInfo = data;
    if (!this.title) {
      this.title = data.name;
    }
  }

  setIsAjax(boo: boolean) {
    this.isAjax = boo;
  }

  queryChildsMetas(callback: Function) {
    if (this.childs && this.childs.length > 0) {
      type MetaIds = { [key: string]: string };
      const metaIds: MetaIds = {};
      for (let index = 0; index < this.childs.length; index++) {
        const item: Data = this.childs[index];
        if (item.metaId) {
          metaIds[item.metaId] = item.metaId;
        }
      }
      const ids = Object.keys(metaIds);
      let url = `${datamg}/metainfo/query`;
      let params = {
        ids: ids,
      };
      axiosFn.commonPost(url, params).then((res: any) => {
        if (res.data.status == 200) {
          let items = res.data.data.items;
          for (let index = 0; index < this.childs.length; index++) {
            const item: Data = this.childs[index];
            const meta = items.find((it: any) => it.id == item.metaId);
            if (meta) {
              item.setMetaInfo(meta);
              item.setIsAjax(true);
            }
          }
          if (callback) callback();
        }
      });
    } else {
      if (callback) callback();
    }
  }

  queryChildsMetasByClassId(callback: Function) {
    if (this.classId) {
      let url = `${datamg}/metainfo/query`;
      let params = {
        classIds: [this.classId],
      };
      axiosFn.commonPost(url, params).then((res: any) => {
        if (res.data.status == 200) {
          let items = res.data.data.items;

          this.childs = items.map((meta: any) => {
            const obj: any = {
              icon: meta.icon,
              title: meta.name,
              legend: "",
              metaId: meta.id,
              classId: undefined,
              childs: [],
              charts: [],
            };

            const child = new Data(obj);
            child.setMetaInfo(meta);
            child.setIsAjax(true);

            return child;
          });

          if (callback) callback();
        }
      });
    } else {
      if (callback) callback();
    }
  }

  queryMetas(callback: Function) {
    if (this.metaId) {
      let url = `${datamg}/metainfo/query`;
      let params = {
        ids: [this.metaId],
      };
      axiosFn.commonPost(url, params).then((res: any) => {
        if (res.data.status == 200) {
          let items = res.data.data.items;
          const meta = items.find((it: any) => it.id == this.metaId);
          if (meta) {
            this.setMetaInfo(meta);
            this.setIsAjax(true);
          }
          if (callback) callback();
        }
      });
    } else {
      this.setIsAjax(true);
      if (callback) callback();
    }
  }
}
