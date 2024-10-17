import { observer } from "mobx-react-lite";
import * as turf from "@turf/turf";

import styles from "./styles.less";
import { Table } from "antd";
import IdsGather from "@/configs/idsGather";
import { useEffect, useState } from "react";
const TableView = observer((props: any) => {
  const chartView = props.chartView;
  const data = props.data || [];
  const _data = data.map((item: any, index: any) => {
    return {
      ...item,
      _rowKey: index
    }
  })
  const dataCount = props.dataCount || 0;
  const updatePartView = props.updatePartView;

  const viewParams = chartView.viewParams;
  const queryParams = chartView.queryParams;
  const fields = viewParams.fields || [];

  const [scrollY, setScrollY] = useState<any>(500);
  const [scrollX, setScrollX] = useState<any>(300);

  // 监听页面大小变化
  useEffect(() => {
    if (data.length > 0) {
      let targetDiv: any = document.getElementById("tableView");
      if (typeof ResizeObserver === "function") {
        // 检查浏览器是否支持ResizeObserver
        let resizeObserver = new ResizeObserver((entries) => {
          entries.forEach((entry) => {
            getTableScrollY();
            getTableScrollX();
          });
        });
        resizeObserver.observe(targetDiv); // 开始监听指定div元素的尺寸变化
      } else {
        console.warn("ResizeObserver is not supported in this browser.");
      }
    }
  }, [data]);

  const columns = fields.map((item: any) => {
    let titleWidth = item.title.length * 30
    return {
      title: item.title,
      dataIndex: item.name,
      width: titleWidth,
      render: (text: any, record: any, index: any) => {
        // 判断是否有 domain
        let _text = text;
        if (item.domain) {
          _text = domainFun(item.domain, text)
        }

        return (
          <div
            onClick={(e: any) => onLocation(e, record, index)}
            style={{ cursor: "pointer" }}
          >
            {_text}
            <span style={{ display: "none " }}>{index}</span>
          </div>
        )
      }
    };
  });


  // 处理值域
  const domainFun = (domain: any, dataVal: any) => {
    let resData = dataVal;
    if (domain.type == "dict") {
      // 字典
      let values = domain.values;
      let res = values.find((item: any) => item.value == dataVal);
      if (res) {
        resData = res.label
        if (res.styles) {
          resData = <span style={{ ...res.styles }}>{res.label}</span>
        }
      }
    }
    return resData
  }

  const onLocation = (e: any, item: any, index: any) => {

    let feature = null;
    if (item.latitude && item.longitude) {
      const point = turf.point([item.longitude * 1, item.latitude * 1], item);
      feature = point;
    }
    let _metaId = IdsGather.getInstance().getAttributeById(
      chartView.metaId
    )?.id;
    let _data = [e, { queryData: data }, { metaId: _metaId, feature }];

    window.Evented.fire("onLoaction", { data: _data });
  };

  const onChangePagination = (page: any, pageSize: any) => {
    updatePartView({
      pageNum: page,
    });
  };

  // 获取表格高度
  const getTableScrollY = () => {
    let doc: any = document.getElementById("tableView");
    if (doc) {
      let sty = getComputedStyle(doc, null);
      let res = viewParams?.headTitle ? parseFloat(sty.height) - 160 : parseFloat(sty.height) - 110;
      setScrollY(res);
    }
  };

  // 获取表格宽度
  const getTableScrollX = () => {
    let _width = 200;
    columns.forEach((item: any) => {
      _width = _width + (item?.width || 0)
    });
    setScrollX(_width);
  };


  return (
    <div className={styles.table_view} id="tableView">
      {viewParams?.headTitle &&
        <div className={styles.head_view}>
          {`${viewParams?.headTitle}(${dataCount})` || ""}
        </div>
      }

      <div className={styles.content_view}>
        <Table
          dataSource={_data}
          columns={columns}
          rowKey="_rowKey"
          pagination={{
            defaultCurrent: 1,
            total: dataCount,
            showSizeChanger: false,
            defaultPageSize: queryParams.pageSize,
            simple: true,
            size: "small",
            onChange: onChangePagination,
            showTotal: (total: any) => {
              return `共 ${total} 条数据，每页${queryParams.pageSize}条`;
            },
          }}
          // scroll={{ y: scrollY, x: 'max-content' }}
          scroll={{ y: scrollY, x: scrollX }}
          bordered
        />
      </div>
    </div>
  );
});

export default TableView;
