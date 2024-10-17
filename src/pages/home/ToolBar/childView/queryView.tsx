import React, { useState, useEffect, useRef, useCallback } from "react";
import * as turf from "@turf/turf";
import { observer } from "mobx-react-lite";
import styles from "./styles.less";
import { Form } from "antd";
import { Input } from "antd";
import { Space } from "antd";
import { Button } from "antd";
import axiosFn from "@/server/axios";
import { datamg, dataUrl, serverUrl } from "@/common";
import groupSpace from "@/mobx/groupSpace";
import { message } from "antd";
import { Select } from "antd";
import { getQMap } from "@/plugin/qSpace/core";
const QueryView = observer((props: any) => {
  const gpId = groupSpace.getGroup();
  const [form] = Form.useForm();

  const [queryList, setQueryList] = useState<any[]>([]);
  const [classList, setClassList] = useState<any[]>([]);
  const groupData = groupSpace.groupData;

  useEffect(() => {
    if (groupData) {
      queryClass();
    }
  }, [groupData]);

  // 查询组内类型
  const queryClass = () => {
    // 1.查询元信息
    let url = `${datamg}/metainfo/query`;
    let parmas = {
      gpId: groupData.id,
      imgType: "Tree",
      name: `${groupData.name}-类视图`,
      pageNum: 1,
      pageSize: 0,
    };

    axiosFn.commonPost(url, parmas).then((res: any) => {
      if (res.data.status == 200) {
        let meta = res.data.data.items?.[0];
        let diagramId = meta?.attributes?.diagramId;
        if (diagramId) {
          queryDiagram(diagramId);
        } else {
          message.info("缺少类视图");
        }
      }
    });
  };

  // 2.查询类视图
  const queryDiagram = (id: any) => {
    let params = {
      id: id,
      loadObjectClass: true,
    };
    let url = `${datamg}/diagram/query`;
    axiosFn.commonPost(url, params).then((res: any) => {
      if (res.data.status == 200) {
        let firstItem = res.data.data.items?.[0];
        if (firstItem) {
          let items = firstItem.items || [];
          setClassList(items);
        }
      }
    });
  };

  // 点击搜索
  const onFinish = (values: any) => {
    if (!values.title) {
      setQueryList([]);
      message.info("缺少名称");
      return null;
    }

    if (values.cls_id == "0") {
      delete values.cls_id;
    }

    let params = {
      fts_name: gpId,
      ...values,
    };
    let _url = `${serverUrl}/gserver/searching/query`;
    axiosFn.commonGet(_url, params).then((res: any) => {
      let data = res.data || [];
      if (data) {
        let _data = data.map((item: any) => {
          let cls_id = item.cls_id;
          if (cls_id) {
            let calss = classList.find((it: any) => it.id == cls_id);
            if (calss) {
              return {
                ...item,
                cls_name: calss.name,
              };
            } else {
              return {
                ...item,
                cls_name: "-",
              };
            }
          }
        });

        setQueryList(_data);
      } else {
        setQueryList([]);
      }
    });
  };

  const getClassOptions = (data: any) => {
    let options = data.map((item: any) => {
      return { value: item.id, label: item.name };
    });
    options.unshift({ value: "0", label: "全部" });
    return options;
  };

  // 点击定位
  const onLocation = (item: any) => {
    let _obj: any = {
      center: [item.x, item.y],
      zoom: 12,
      pitch: 0,
      bearing: 0,
    };

    const point = turf.point([item.x, item.y]);
    getQMap()?.locationGeometryNotA(point.geometry);
    // getQMap()?.geometryHighlightedLayer.addLayer(point.geometry)
  };

  return (
    <div className={styles.query_view}>
      <Form
        form={form}
        name="control-hooks"
        onFinish={onFinish}
        style={{ maxWidth: 600, position: "relative" }}
        layout="inline"
        initialValues={{
          cls_id: "0",
        }}
      >
        <Form.Item name="cls_id" label="">
          <Select
            style={{ width: 120 }}
            options={getClassOptions(classList)}
            placeholder="选择类型"
          />
        </Form.Item>
        <Form.Item name="title" label="">
          <Input style={{ width: 160 }} placeholder="输入名称" />
        </Form.Item>

        <Form.Item style={{ position: "absolute", right: 6 }}>
          <Space>
            <Button type="primary" htmlType="submit">
              搜索
            </Button>
          </Space>
        </Form.Item>
      </Form>

      <div className={styles.list_view}>
        <div className={styles.list_title}>
          <div>名称</div>
          <div>类型</div>
        </div>

        {queryList.map((item: any) => {
          return (
            <div
              key={item.id}
              className={styles.item_view}
              onClick={() => onLocation(item)}
            >
              <div>{item.title}</div>
              <div>{item.cls_name}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
});

export default QueryView;
