import { datamg } from "@/common";
import axiosFn from "@/server/axios";
import { makeAutoObservable } from "mobx";

class HistoryData {
  selMetaId: string | null = null;
  rawMetainfo: Array<any> = [];
  columns: Array<any> = [];
  rawData: Array<any> = [];
  dataSource: Array<any> = [];
  totalItems: Number = 0;
  queryParams: any = {
    pageSize: 15,
    pageNum: 1,
    loadAttr: true,
    attrs: { whereConditions: [] },
  }

  constructor() {
    makeAutoObservable(this)
  }

  setSelMetaId(id: string | null) {
    this.selMetaId = id;
    this.clearTableData()
    this.queryMetaInfo()
  }

  setRawMetainfo(data: Array<any>) {
    this.rawMetainfo = data
  }

  setColumns(data: Array<any>) {
    this.columns = data
  }

  setRawData(data: Array<any>) {
    this.rawData = data
  }

  setDataSource(data: Array<any>) {
    this.dataSource = data
  }
  setTotalItems(num: Number) {
    this.totalItems = num
  }
  setQueryParams(obj: any) {
    this.queryParams = obj
  }

  clearTableData() {
    this.rawMetainfo = [];
    this.columns = [];
    this.dataSource = [];
    this.totalItems = 0;
  }


  // 查询元信息
  queryMetaInfo() {
    let url = `${datamg}/metainfo/query`;
    let params = {
      id: this.selMetaId
    }
    axiosFn.commonPost(url, params).then((res: any) => {
      if (res.data.status == 200) {
        let data = res.data.data;
        let item = data.items?.[0]
        if (item) {
          this.setRawMetainfo(item)
          this.getColumnsFun()
        }
      }
    })
  }

  // 获取表头
  getColumnsFun() {
    try {
      let metainfo: any = this.rawMetainfo;
      let fileHeader = metainfo?.attributes?.fileHeader;
      let columns: any = [];
      if (fileHeader) {
        fileHeader.forEach((item: any) => {
          let obj = {
            title: item,
            dataIndex: item,
            key: item,
            ellipsis: {
              showTitle: false,
            },
          };
          columns.push(obj);
        });
        this.setColumns(columns);
        this.queryAttribute();

      }

    } catch (error) {
      console.error(error);
    }
  };


  // 查询元信息属性
  queryAttribute() {
    let params = {
      metaId: this.selMetaId,
      ...this.queryParams,
    };

    let url = `${datamg}/attribute/query`
    axiosFn.commonPost(url, params).then((res: any) => {
      if (res.data.status == 200) {
        let resData = res.data.data;
        let datalist = resData.items;
        let tableData = this.getDataSource(datalist);
        this.setRawData(datalist);
        this.setDataSource(tableData);
        this.setTotalItems(resData.totalItems)
      }
    })
  };

  // 获取表格数据
  getDataSource = (datalist: any) => {
    let result = datalist.map((r: any, i: any) => {
      let data = { ...r.data };
      for (let key in data) {
        if (typeof data[key] == 'object') {
          // 该属性的 typeof 如果是 object，则回显为null
          data[key] = null
        }
      }
      let item = { key: r.id, ...data };
      return item;
    });
    return result;
  }
}





const historyData = new HistoryData();

export default historyData
