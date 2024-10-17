import React, { useState, useEffect, useRef, useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import { Form, DatePicker, } from 'antd';
import styles from './styles.less';
import { Button } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import TableView from './tableView';
import historyData from './historyData';

const { RangePicker } = DatePicker;
const HistoryView = observer((props: any) => {
  useEffect(() => { }, []);

  const [form] = Form.useForm();

  const tabsList: any = [
    { title: "灌溉决策", metaId: "1778421869585984" },
    { title: "种植结构", metaId: "1778663732057664" },
    { title: "水利用系数", metaId: "1778663569299008" },
    { title: "旱情预测", metaId: "1778663407044160" },
    { title: "灌溉面积监测", metaId: "1778662133999168" }, ,
    { title: "地物分类", metaId: '1' },
    { title: "产量估算", metaId: '2' },
  ];


  useEffect(() => {
    let metaId = tabsList[0].metaId;
    historyData.setSelMetaId(metaId)
  }, [])


  const onClickTabs = (item: any) => {
    historyData.setSelMetaId(item.metaId)
  }

  const onFinish = (values: any) => {
  }

  return (
    <div className={styles.history_view}>
      <div className={styles.content_view}>
        <div className={styles.tabs_view}>
          {tabsList.map((item: any) => {
            let isSel = item.metaId == historyData.selMetaId;

            return (
              <div
                key={item.title}
                className={`${styles.tabs_item} ${isSel ? styles.tabs_item_sel : ""}`}
                onClick={() => onClickTabs(item)}
              >
                {item.title}
              </div>
            )
          })
          }
        </div>
        <div className={styles.search_view}>
          <Form
            form={form}
            onFinish={onFinish}
            layout='inline'
          >
            <Form.Item name="date" rules={[{ required: true }]}>
              <RangePicker />
            </Form.Item>
            <Form.Item  >
              <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>
                搜索
              </Button>
            </Form.Item>
          </Form>
        </div>
        <TableView />
      </div>
    </div>
  );
})

export default HistoryView;
