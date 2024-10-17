import { datamg } from '@/common';
import axiosFn from '@/server/axios';
import { makeAutoObservable } from 'mobx';
import moment from 'moment';


const DTYPE_DICT: any = {
  number: 4,
  boolean: 8,
  string: 9,
  object: 13,
};

class WorkFlowSpace {
  workFlowData: any; //流程
  singleFormObj: any; //表单设计
  formSchema: any; // Schema

  constructor() {
    makeAutoObservable(this)
  }

  clearData() {
    this.workFlowData = null;
    this.singleFormObj = null;
    this.formSchema = null;
  }

  setWorkFlowData(data: any) {
    this.workFlowData = data
  }

  setSingleFormObj(data: any) {
    this.singleFormObj = data
  }

  setFormSchema(data: any) {
    this.formSchema = data
  }


  // 通过类型查询元信息
  queryMetaInfoByClassId(classId: string, callBack: Function) {
    let url = `${datamg}/metainfo/query`;
    let parmas = {
      classIds: [classId]
    }
    axiosFn.commonPost(url, parmas).then((res: any) => {
      if (res.data.status == 200) {
        let items = res.data.data.items;
        callBack(items)
      }
    })
  }

  // 查询流程
  queryWorkFlowById(id: string) {
    let url = `${datamg}/workFlow/query`;
    let parmas = {
      id: id
    }

    axiosFn.commonPost(url, parmas).then((res: any) => {
      if (res.data.status == 200) {
        let items = res.data.data.items;
        let item = items[0];
        this.setWorkFlowData(item);
        this.onLoadFormSchema()
      }
    })
  }

  // 加载表单设计
  onLoadFormSchema() {
    let workFlowData = this.workFlowData;
    let url = `${datamg}/form/getByBelong`;
    let parmas = {
      belongId: workFlowData.id,
      belongType: workFlowData.type.otid,
    }
    axiosFn.commonGet(url, parmas).then((res: any) => {
      let data = res.data.data;
      if (data) {
        this.setSingleFormObj(data);
        let schema = JSON.parse(data.content);
        this.setFormSchema(schema)
      }
    })
  }

  // 执行流程
  runWorkFlow(values: any, callBack: Function) {
    let workFlowData = this.workFlowData;
    try {
      const runParams: any = {};
      Object.keys(values).forEach((key: string) => {
        const val = values[key];
        const jsType = typeof val;
        runParams[key] = {
          value: val,
          name: key,
          title: key,
          type: {
            otid: 3520,
            name: '参数',
          },
          paramType: DTYPE_DICT[jsType],
        };
      });
      const obj = {
        name: `${workFlowData.name}${moment().format('YYMMDDHHmmssSSS')}`,
        tags: workFlowData.tags,
        runParams: runParams,
      };

      let url = `${datamg}/workFlow/${workFlowData.id}/run`
      axiosFn.commonPost(url, obj).then((res: any) => {
        callBack();
      })
    } catch (error) {
      console.error(error);
    }
  }




}

let workFlowSpace = new WorkFlowSpace();

export default workFlowSpace

