import { useState, useEffect, } from 'react';

import { Tabs } from 'antd';
import { datamg } from '@/common';
import axiosFn from '@/server/axios';
import ResultView from './ResultView';

import styles from './styles.less';
import LogView from './LogView';

const DetailsView = (props: any) => {
  const data = props.data;

  const [taskInfo, setTaskInfo] = useState<any>(null);
  const [resultList, setResultList] = useState<any>(null);

  useEffect(() => {
    if (data?.id) {
      queryTask(data.id)
    }
  }, [data]);

  // 根据实例id，查询任务
  const queryTask = (processId: any) => {
    let params = {
      loadResource: true,
      loadProcessFlow: true,
      processIds: [processId],
      sort: { sortBy: "id", asc: true },
      tags: "流程任务"
    }

    let url = `${datamg}/task/query`;
    axiosFn.commonPost(url, params).then((res: any) => {
      let item = res.data.data.items?.[0];
      if (item) {
        setTaskInfo(item);
        let task = item;
        queryResult(task.id)
      }
    })
  };

  // 查询成果
  const queryResult = (taskId: any) => {
    let url = `${datamg}/process/achievement/browse/${taskId}`;
    axiosFn.commonGet(url).then((res: any) => {
      if (res.data.status == 200) {
        let data = res.data.data;
        if (data.directory) {
          // 结果为目录
          let results = data.child;
          setResultList(results)
        } else {
          // 结果为文件
          setResultList([data])
        }

      }
    })
  }

  return (
    <div className={styles.tabs_view}>
      <Tabs
        defaultActiveKey="1"
        destroyInactiveTabPane={true}
        items={[
          {
            key: '1',
            label: '成果',
            children: <ResultView data={resultList} taskInfo={taskInfo} />,
          },
          {
            key: '2',
            label: '日志',
            children: <LogView taskInfo={taskInfo} />,
          },
        ]}
      />
    </div>
  );
};
export default DetailsView;
