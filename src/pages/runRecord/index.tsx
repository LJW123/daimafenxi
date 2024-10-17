import React, { useState, useEffect, useRef, useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import styles from './styles.less';
import DragPage from './dragPage';
import AgGridReactTable from './agGridReactTable';
import { datamg } from '@/common';
import axiosFn from '@/server/axios';
import { Space } from 'antd';
import { Popconfirm } from 'antd';
import groupSpace from '@/mobx/groupSpace';
import DetailsView from './detailsView';

let timer: any = null;
const RunRecord = observer((props: any) => {
  const groupId = groupSpace.getGroup();
  const initParams = {
    pageNum: 1,
    pageSize: 20,
    gpids: [groupId],
  };

  const [dataList, setDataList] = useState<any>(null);
  const [filterParams, setFilterParams] = useState<any>(initParams);
  const [drawerData, setDrawerData] = useState<any>(null);

  useEffect(() => {
    queryList(initParams)

    return () => {
      if (timer) clearTimeout(timer);
      timer = null;
    }
  }, []);

  const queryList = (obj: any) => {
    let url = `${datamg}/process/flow/query`;
    axiosFn.commonPost(url, obj).then((res: any) => {
      let data = res.data.data;
      setDataList(data);
      if (timer) clearTimeout(timer);
      timer = null;
      timer = setTimeout(() => {
        queryList(obj)
      }, 1000 * 30);
    })
  };


  // 删除记录
  const onDeleteConfirm = (obj: any) => {
    let id = obj.id;
    let url = `${datamg}/process/flow/delete`;
    axiosFn.commonDelete(url, id).then((resData: any) => {
      queryList(filterParams);
    })
  };

  return (
    <div className={styles.runRecord_view}>
      <div id='workflow' className={styles.content_view}>
        <DragPage
          leftView={
            <AgGridReactTable
              domId={'workflow'}
              dataList={dataList}
              initParams={initParams}
              queryList={queryList}
              filterParams={filterParams}
              setFilterParams={setFilterParams}
              getActionCellRenderer={(params: any) => {
                return (
                  <Space>
                    <a onClick={() => setDrawerData(params.data)}>查看</a>
                    <Popconfirm
                      title="确定要删除吗?"
                      key="deleteable"
                      onConfirm={() => {
                        onDeleteConfirm(params.data);
                      }}
                      okText="确定"
                      cancelText="取消"
                    >
                      <a key="act_delete" style={{ color: 'red' }}>
                        删除
                      </a>
                    </Popconfirm>
                  </Space>)
              }}
            />
          }

          rightView={drawerData ?
            <div className={styles.right_view}>
              <div className={styles.head_view}>
                <div className={styles.name_view}>{drawerData.name}</div>
                <div className={styles.close_btn} onClick={() => setDrawerData(null)}>x</div>
              </div>
              <div className={styles.right_content_view}>
                <DetailsView data={drawerData} />
              </div>
            </div>
            : null}
        />
      </div>
    </div>
  );
})

export default RunRecord;
