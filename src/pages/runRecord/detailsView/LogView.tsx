import { datamg } from '@/common';
import axiosFn from '@/server/axios';
import { message } from 'antd';
import React, { useState, useEffect, useRef, useCallback } from 'react';
let logTimer: any = null;
const LogView = (props: any) => {
  const taskInfo = props.taskInfo;
  const [logCon, setLogCon] = useState<any>(null);

  useEffect(() => {
    if (taskInfo) {
      onLookLog(taskInfo.id)
    }
    return () => {
      if (logTimer) clearTimeout(logTimer);
      logTimer = null;
    }
  }, [taskInfo]);


  const onLookLog = (taskId: any) => {
    let url = `${datamg}/process/log/${taskId}`
    axiosFn.commonGet(url).then((res: any) => {
      if (res.data.status == 200) {
        setLogCon(res.data.data);
        if (logTimer) clearTimeout(logTimer)
        logTimer = null
        logTimer = setTimeout(() => {
          onLookLog(taskId)
        }, 2000);

      }
    }).catch(() => {
      message.error('查询日志错误')
    })
  }

  return <div
    style={{
      whiteSpace: 'pre-wrap',
      height: 'calc(100% )',
      overflowY: 'auto'
    }}>{logCon}</div>
};
export default LogView;
