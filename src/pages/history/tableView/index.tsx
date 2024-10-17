import React, { useState, useEffect, useRef, useCallback } from 'react';
import { observer } from 'mobx-react-lite';

import styles from './styles.less';
import { ClearOutlined, DeleteOutlined, FormOutlined } from '@ant-design/icons';
import { datamg } from '@/common';
import axiosFn from '@/server/axios';
import RowEditView from './rowEditView';
import { Modal, Button, Table, Pagination, message, } from 'antd';
import moment from 'moment';
import historyData from '../historyData';

const TableView = observer((props: any) => {
  const metaId = historyData.selMetaId;
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]); //选择的表格行key
  const [selectedRows, setSelectedRows] = useState<any>([]); //选择的表格行
  const [editRowVisible, setEditRowVisible] = useState<boolean>(false);
  const [deleteVisible, setDeleteVisible] = useState<boolean>(false);

  // 选中行
  const onSelectChange = (newSelectedRowKeys: any, selectedRows: any) => {
    setSelectedRowKeys(newSelectedRowKeys);
    setSelectedRows(selectedRows);
  };


  const toolbarOnClick = (type: any) => {
    switch (type) {
      case 'onEdit':
        if (selectedRowKeys.length > 1) {
          message.error("不能编辑多行!")
        } else {
          setEditRowVisible(true);
        }
        break;
      case 'onDelete':
        setDeleteVisible(true);
        break;
      default:
        break;
    }
  };

  // 清空选中
  const clearSelected = () => {
    setSelectedRowKeys([]);
    setSelectedRows([]);
  };


  // 删除
  const onDelete = () => {
    let list = [];
    for (let li of selectedRowKeys) {
      list.push(
        axiosFn.commonDelete(`${datamg}/metainfo/${metaId}/attribute/delete`, li)
      )
    }
    Promise.all(list).then(res => {
      setDeleteVisible(false);
      historyData.queryAttribute();
    }).catch(error => {
      console.error('服务错误', error);
    });
  }

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  };


  // 编辑保存
  const onSave = (values: any) => {
    let params = {
      id: selectedRowKeys[0],
      rtime: values.rtime ? values.rtime?.format('x') : null,
      extendId: values.extendId,
      type1: values.type1,
      type2: values.type2,
      type3: values.type3,
      data: { ...values },
    };
    delete params.data.rtime;
    delete params.data.extendId;

    delete params.data.type1;
    delete params.data.type2;
    delete params.data.type3;



    let url = `${datamg}/metainfo/${metaId}/attribute/update`;
    axiosFn.commonPost(url, params).then((res: any) => {
      if (res.data.status == 200) {
        setEditRowVisible(false);
        clearSelected();
        historyData.queryAttribute();
        message.success('保存成功');
      }
    })
  }


  const hasSelected = selectedRowKeys.length > 0;
  let firstSelectItem;
  if (hasSelected)
    firstSelectItem = historyData.rawData.find((r: any) => r.id === selectedRowKeys[0])

  // 获取表格高度
  const getTableScrollY = () => {
    let doc: any = document.getElementById('table_content');
    if (doc) {
      let sty = getComputedStyle(doc, null);
      let res = parseFloat(sty.height) - 100;
      return res;
    }
  };
  let scrollY: any = getTableScrollY();


  const dataSource = historyData.dataSource;
  const columns = historyData.columns;
  const queryParams = historyData.queryParams;
  const totalItems = historyData.totalItems;
  const rawMetainfo = historyData.rawMetainfo;

  return (
    <div className={styles.attribute_view} id="table_content">
      <div className={styles.toolbar}>
        <Button type='primary' size='small' icon={<FormOutlined />} disabled={!hasSelected} onClick={() => { toolbarOnClick('onEdit') }}>编辑</Button>
        <Button type='primary' size='small' icon={<DeleteOutlined />} disabled={!hasSelected} danger onClick={() => { toolbarOnClick('onDelete') }}>删除</Button>
        <Button type='primary' size='small' icon={<ClearOutlined />} disabled={!hasSelected} onClick={() => { clearSelected() }}>清空选中</Button>
      </div>

      <div style={{ height: `${scrollY + 46}px` }}>
        <Table
          dataSource={dataSource}
          columns={columns}
          rowKey="key"
          bordered
          pagination={false}
          size='small'
          scroll={{ x: columns.length * 150, y: scrollY }}
          rowSelection={rowSelection}
        />
      </div>
      <div className={styles.pagination_view}>
        <Pagination
          align="end"
          defaultCurrent={1}
          defaultPageSize={queryParams.pageSize}
          total={totalItems}
          onChange={(page: any, pageSize: any) => {
            historyData.setQueryParams({
              ...historyData.queryParams,
              pageNum: page,
              pageSize: pageSize,
            });
            historyData.queryAttribute();
          }}
        />
      </div>



      {editRowVisible && <RowEditView
        visible={editRowVisible}
        fields={columns}
        title={'编辑数据'}
        yMetainfo={rawMetainfo}
        defaultValue={{
          ...selectedRows[0],
          rtime: firstSelectItem?.rtime ? moment(firstSelectItem?.rtime * 1) : null,
          extendId: firstSelectItem?.extendId,
          type1: firstSelectItem?.type1,
          type2: firstSelectItem?.type2,
          type3: firstSelectItem?.type3,
        }}
        onSubmit={onSave}
        onCancle={() => { setEditRowVisible(false) }} />}

      <Modal
        title='删除'
        open={deleteVisible}
        onOk={onDelete}
        onCancel={() => {
          setDeleteVisible(false)
        }}
      >
        <>确定删除选中的<span style={{ color: 'red' }}>{selectedRowKeys.length}</span>条数据吗？</>
      </Modal>

    </div>
  );
})

export default TableView;
