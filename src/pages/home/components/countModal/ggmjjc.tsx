import React, { useState, useEffect, useRef, useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import { Form } from 'antd';
import { Select } from 'antd';
import { datamg } from '@/common';
import axiosFn from '@/server/axios';
import styles from "./styles.less";
import moment from 'moment';
import { message } from 'antd';

const { Option } = Select;
const rainfallClassId = "1783632890345024"; //降雨
const droughtClassId = "1757827591751232"; //旱情预测
const workFlowId = "1783654179767872";

const DTYPE_DICT: any = {
  number: 4,
  boolean: 8,
  string: 9,
  object: 13,
};
// 灌溉面积监测
const GgmjjcView = observer((props: any) => {
  const closeModal = props.closeModal;
  const [form] = Form.useForm();
  const [rainfallOptions, setRainfallOptions] = useState<any>([])
  const [droughtOptions, setDroughtOptions] = useState<any>([])
  const [workFlowData, setWorkFlowData] = useState<any>(null)

  useEffect(() => {
    queryMeta(rainfallClassId).then((res: any) => {
      if (res.data.status == 200) {
        let items = res.data.data.items;
        setRainfallOptions(items);
      }
    });

    queryMeta(droughtClassId).then((res: any) => {
      if (res.data.status == 200) {
        let items = res.data.data.items;
        setDroughtOptions(items);
      }
    });

    queryWorkFlow(workFlowId).then((res: any) => {
      if (res.data.status == 200) {
        let items = res.data.data.items;
        let item = items[0];
        setWorkFlowData(item);
      }
    })
  }, []);

  // 查询流程
  const queryWorkFlow = (id: any) => {
    let url = `${datamg}/workFlow/query`;
    let parmas = {
      id: id
    }
    return axiosFn.commonPost(url, parmas)
  }


  // 通过code查询元信息
  const queryMeta = (classId: any) => {
    let url = `${datamg}/metainfo/query`;
    let parmas = {
      classIds: [classId]
    }
    return axiosFn.commonPost(url, parmas)
  };

  const onFinish = (values: any) => {

    const _value: any = {};
    Object.keys(values).forEach((key: string) => {
      let val = values[key];
      _value[key] = {
        id: val,
        type: { otid: 3030, name: "元信息" }
      }
    })

    try {
      const runParams: any = {};
      Object.keys(_value).forEach((key: string) => {
        const val = _value[key];
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

      let url = `${datamg}/workFlow/${workFlowId}/run`
      axiosFn.commonPost(url, obj).then((res: any) => {
        message.info('任务已执行')
      })
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <>
      <Form
        labelCol={{ span: 6 }}
        wrapperCol={{ span: 18 }}
        form={form}
        name="control-hooks"
        onFinish={onFinish}
      >
        <Form.Item name="rain_path" label="降雨">
          <Select>
            {rainfallOptions.map((item: any) => {
              return <Option key={item.id} value={item.id}>{item.name}</Option>
            })
            }
          </Select>
        </Form.Item>
        <Form.Item name="soil_water_path1" label="旱情预测1">
          <Select>
            {droughtOptions.map((item: any) => {
              return <Option key={item.id} value={item.id}>{item.name}</Option>
            })
            }
          </Select>
        </Form.Item>

        <Form.Item name="soil_water_path2" label="旱情预测2">
          <Select>
            {droughtOptions.map((item: any) => {
              return <Option key={item.id} value={item.id}>{item.name}</Option>
            })
            }
          </Select>
        </Form.Item>
      </Form>

      <div className={styles.footer_view}>
        <div className={`${styles.btn} ${styles.btn_cancel}`} onClick={closeModal}>取消</div>
        <div className={`${styles.btn} ${styles.btn_submit}`} onClick={() => form.submit()}>确定</div>
      </div>

    </>
  )
})

export default GgmjjcView;
