import React, { useState, useEffect, useRef, useCallback } from 'react';
import { observer } from 'mobx-react-lite';

import workFlowSpace from './workFlowSpace';
import QFormRender from '@/components/QFormRender';
import { useForm } from '@/thirdparty/form-render';
import styles from './styles.less';
import { message } from 'antd';

// 灌溉面积监测
const WorkFlowView = observer((props: any) => {
  const closeModal = props.closeModal;
  const workFlowId = props.workFlowId;
  const form = useForm();
  const formSchema = workFlowSpace.formSchema;

  useEffect(() => {
    workFlowSpace.queryWorkFlowById(workFlowId);
  }, []);


  const onFinish = (values: any) => {
    let properties = formSchema.properties;
    const _value: any = {};

    Object.keys(values).forEach((key: string) => {
      let widgetType = properties[key].widget;
      let val = values[key];
      // 判断是否为元信息
      if (widgetType == 'DragMetaList' || widgetType == 'DragMeta') {
        _value[key] = {
          id: val,
          type: { otid: 3030, name: "元信息" }
        }
      } else {
        _value[key] = val
      }
    })

    workFlowSpace.runWorkFlow(_value, () => {
      message.info('任务已执行')
      closeModal();
    })
  }

  return (
    <>
      {formSchema && (
        <QFormRender
          form={form}
          formSchema={formSchema}
          onSave={onFinish}
        />
      )}

      <div className={styles.footer_view}>
        <div className={`${styles.btn} ${styles.btn_cancel}`} onClick={closeModal}>取消</div>
        <div className={`${styles.btn} ${styles.btn_submit}`} onClick={() => form.submit()}>确定</div>
      </div>

    </>
  )
})

export default WorkFlowView;
